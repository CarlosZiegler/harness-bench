import { readFile } from "node:fs/promises";
import path from "node:path";
import { exists, listFilesRecursive, readText } from "../lib/fs.ts";
import type {
  DimensionScore,
  RuntimeResult,
  Scorecard,
  StructuralScan,
} from "../types/index.ts";
import { nowIso } from "../lib/time.ts";

/**
 * Auto scorer — heuristic baseline (0-100).
 * Not a substitute for LLM/human audit, but enough to rank runs and
 * catch structural/runtime failures consistently.
 *
 * Weights mirror packages/bench/rubrics/fullstack-webdev.md
 */
export async function autoScore(opts: {
  appDir: string;
  structural: StructuralScan;
  runtime?: RuntimeResult;
}): Promise<Scorecard> {
  const { appDir, structural: s, runtime } = opts;
  const files = await listFilesRecursive(appDir);

  const dims: DimensionScore[] = [];

  // 1. Deliverables (0-20)
  {
    const max = 20;
    let score = 0;
    const notes: string[] = [];
    const checks: [boolean, number, string][] = [
      [s.present.package_json, 2, "package.json"],
      [s.present.readme, 3, "README"],
      [s.stack.dockerfile, 3, "Dockerfile"],
      [s.stack.dockerCompose, 4, "docker-compose"],
      [s.stack.tanstackStart, 2, "TanStack Start"],
      [s.stack.drizzle, 2, "Drizzle"],
      [s.stack.betterAuth, 2, "Better Auth"],
      [s.stack.shadcn, 1, "shadcn"],
      [s.present.tests, 1, "tests"],
    ];
    for (const [ok, pts, label] of checks) {
      if (ok) score += pts;
      else notes.push(`missing ${label}`);
    }
    dims.push(dim("deliverables", "Deliverable completeness", max, score, notes));
  }

  // 2. Backend correctness (0-15)
  {
    const max = 15;
    let score = 0;
    const notes: string[] = [];
    if (s.stack.drizzle) score += 4;
    else notes.push("no drizzle");
    if (s.stack.postgres) score += 3;
    else notes.push("no postgres signal");
    if (s.stack.betterAuth) score += 4;
    else notes.push("no better-auth");
    // schema / server fns presence
    const hasSchema = files.some((f) => /schema\.(ts|js)$/.test(f) || /db\/schema/.test(f));
    const hasServer =
      files.some((f) => /server\//.test(f)) ||
      files.some((f) => /serverFn|createServerFn/.test(f));
    if (hasSchema) score += 2;
    else notes.push("no db schema file");
    if (hasServer) score += 2;
    else notes.push("no server functions / server dir");
    dims.push(dim("backend", "Backend correctness", max, Math.min(max, score), notes));
  }

  // 3. Frontend / WebDev quality (0-25) — Arena-inspired
  {
    const max = 25;
    let score = 0;
    const notes: string[] = [];
    const evidence: string[] = [];

    // Visual system
    if (s.stack.shadcn) {
      score += 4;
      evidence.push("shadcn/base-ui present");
    } else notes.push("no shadcn signal");
    if (s.stack.reui) {
      score += 2;
      evidence.push("reui present");
    } else notes.push("reui not detected (optional but preferred)");

    // Routing / pages
    if (s.counts.routes >= 4) score += 4;
    else if (s.counts.routes >= 2) score += 2;
    else notes.push(`few routes (${s.counts.routes})`);

    // Componentization
    if (s.counts.components >= 8) score += 4;
    else if (s.counts.components >= 3) score += 2;
    else notes.push(`few components (${s.counts.components})`);

    // Responsive / layout heuristics
    const cssBlob = await sampleMatching(appDir, files, /\.(css|tsx)$/, 30);
    if (/sm:|md:|lg:|xl:|@media/.test(cssBlob)) score += 3;
    else notes.push("little responsive class usage");

    // Dark mode / theme
    if (/dark:|next-themes|ThemeProvider|color-scheme/.test(cssBlob)) score += 2;
    else notes.push("no dark/theme signal");

    // Empty / loading / error states
    if (/Skeleton|EmptyState|isLoading|isPending|error\.message|ErrorBoundary/.test(cssBlob))
      score += 3;
    else notes.push("weak loading/empty/error UI signals");

    // Accessibility basics
    if (/\baria-|\brole=|sr-only|alt=/.test(cssBlob)) score += 3;
    else notes.push("weak a11y attributes");

    dims.push(
      dim("frontend", "Frontend / WebDev quality", max, Math.min(max, score), notes, evidence),
    );
  }

  // 4. Auth & multi-tenancy / product flows (0-10)
  {
    const max = 10;
    let score = 0;
    const notes: string[] = [];
    const blob = await sampleMatching(appDir, files, /\.(ts|tsx)$/, 80);
    if (/better-auth|auth\.api|signIn|signUp/.test(blob)) score += 4;
    else notes.push("auth flows weak");
    if (/session|getSession|useSession/.test(blob)) score += 2;
    if (/organization|workspace|tenant|team/i.test(blob)) score += 2;
    else notes.push("no org/workspace concept");
    if (/middleware|protect|requireAuth|beforeLoad/.test(blob)) score += 2;
    else notes.push("no route protection signal");
    dims.push(dim("auth_flows", "Auth & product flows", max, Math.min(max, score), notes));
  }

  // 5. DevOps / runtime (0-15)
  {
    const max = 15;
    let score = 0;
    const notes: string[] = [];
    if (s.stack.dockerfile) score += 3;
    else notes.push("no Dockerfile");
    if (s.stack.dockerCompose) score += 4;
    else notes.push("no compose");
    if (s.present.env_example) score += 2;
    else notes.push("no .env.example");

    if (runtime) {
      const byId = Object.fromEntries(runtime.checks.map((c) => [c.id, c]));
      if (byId["install"]?.ok) score += 1;
      if (byId["typecheck"]?.ok) score += 1;
      if (byId["build"]?.ok) score += 2;
      else notes.push("build failed/skipped");
      if (byId["docker_build"]?.ok) score += 1;
      if (byId["compose_up"]?.ok) score += 1;
      for (const c of runtime.checks.filter((x) => !x.ok)) {
        notes.push(`runtime fail: ${c.id} — ${c.detail ?? ""}`);
      }
    } else {
      notes.push("runtime not run");
    }
    dims.push(dim("devops", "DevOps / runtime validation", max, Math.min(max, score), notes));
  }

  // 6. Code quality (0-10)
  {
    const max = 10;
    let score = 5; // baseline if project exists
    const notes: string[] = [];
    if (s.present.tsconfig) score += 1;
    if (s.counts.testFiles >= 3) score += 2;
    else if (s.counts.testFiles >= 1) score += 1;
    else notes.push("few/no tests");
    if (s.secrets.likelyLeakedKeys.length) {
      score -= 3;
      notes.push(`possible secret leak (${s.secrets.likelyLeakedKeys.length})`);
    }
    if (s.secrets.envCommitted) {
      score -= 2;
      notes.push(".env committed without example-only pattern");
    }
    // huge single files penalty
    const big = await findHugeFiles(appDir, files);
    if (big.length) {
      score -= 1;
      notes.push(`large files: ${big.slice(0, 3).join(", ")}`);
    }
    score = Math.max(0, Math.min(max, score));
    dims.push(dim("code_quality", "Code quality & hygiene", max, score, notes));
  }

  // 7. Architecture (0-5)
  {
    const max = 5;
    let score = 0;
    const notes: string[] = [];
    const dirs = new Set(files.map((f) => f.split("/")[0]));
    if ([...dirs].some((d) => ["src", "app", "server", "features"].includes(d))) score += 2;
    if (files.some((f) => /components\//.test(f))) score += 1;
    if (files.some((f) => /lib\/|utils\/|server\//.test(f))) score += 1;
    if (files.some((f) => /db\/|drizzle|schema/.test(f))) score += 1;
    if (score < 3) notes.push("flat or unclear structure");
    dims.push(dim("architecture", "Architecture", max, Math.min(max, score), notes));
  }

  const total = dims.reduce((a, d) => a + d.score, 0);
  const maxTotal = dims.reduce((a, d) => a + d.max, 0);
  const normalized = Math.round((total / maxTotal) * 100);

  const frontend = subscore(dims, ["frontend"]);
  const backend = subscore(dims, ["backend", "auth_flows"]);
  const devops = subscore(dims, ["devops"]);
  const codeQuality = subscore(dims, ["code_quality", "architecture", "deliverables"]);

  return {
    dimensions: dims,
    total: normalized,
    max: 100,
    tier: tierOf(normalized),
    frontendSubscore: frontend,
    backendSubscore: backend,
    devopsSubscore: devops,
    codeQualitySubscore: codeQuality,
    killerStrength: guessStrength(dims),
    killerWeakness: guessWeakness(dims),
    auditedAt: nowIso(),
    auditor: "auto",
  };
}

function dim(
  id: string,
  label: string,
  max: number,
  score: number,
  notes: string[],
  evidence?: string[],
): DimensionScore {
  return {
    id,
    label,
    weight: max,
    score: Math.max(0, Math.min(max, score)),
    max,
    notes,
    evidence,
  };
}

function tierOf(total: number): Scorecard["tier"] {
  if (total >= 80) return "A";
  if (total >= 60) return "B";
  if (total >= 40) return "C";
  return "D";
}

function subscore(dims: DimensionScore[], ids: string[]) {
  const subset = dims.filter((d) => ids.includes(d.id));
  const score = subset.reduce((a, d) => a + d.score, 0);
  const max = subset.reduce((a, d) => a + d.max, 0) || 1;
  return Math.round((score / max) * 100);
}

function guessStrength(dims: DimensionScore[]) {
  const best = [...dims].sort((a, b) => b.score / b.max - a.score / a.max)[0];
  return best ? `${best.label} (${best.score}/${best.max})` : undefined;
}

function guessWeakness(dims: DimensionScore[]) {
  const worst = [...dims].sort((a, b) => a.score / a.max - b.score / b.max)[0];
  return worst
    ? `${worst.label} (${worst.score}/${worst.max})${worst.notes[0] ? " — " + worst.notes[0] : ""}`
    : undefined;
}

async function sampleMatching(
  appDir: string,
  files: string[],
  re: RegExp,
  limit: number,
) {
  const picked = files.filter((f) => re.test(f)).slice(0, limit);
  let out = "";
  for (const f of picked) {
    try {
      out += "\n" + (await readText(path.join(appDir, f)));
    } catch {
      /* */
    }
  }
  return out;
}

async function findHugeFiles(appDir: string, files: string[]) {
  const huge: string[] = [];
  for (const f of files) {
    if (!/\.(ts|tsx|js|jsx|css)$/.test(f)) continue;
    try {
      const txt = await readFile(path.join(appDir, f), "utf8");
      if (txt.split("\n").length > 500) huge.push(f);
    } catch {
      /* */
    }
  }
  return huge;
}

// silence unused
void exists;
