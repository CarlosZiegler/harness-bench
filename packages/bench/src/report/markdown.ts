import path from "node:path";
import { readdir } from "node:fs/promises";
import { DOCS_DIR, RESULTS_DIR } from "../lib/paths.ts";
import { ensureDir, exists, readJson, writeText } from "../lib/fs.ts";
import { formatDuration } from "../lib/time.ts";
import type { RunMeta } from "../types/index.ts";

export async function writeRunReport(meta: RunMeta) {
  const lines: string[] = [];
  lines.push(`# Run: \`${meta.slug}\``);
  lines.push("");
  lines.push(`| Field | Value |`);
  lines.push(`|---|---|`);
  lines.push(`| Task | ${meta.taskId} |`);
  lines.push(`| Harness | ${meta.harness} |`);
  lines.push(
    `| Models | ${meta.models.map((m) => `\`${m.role}:${m.id}\``).join(", ")} |`,
  );
  lines.push(`| Status | **${meta.status}** |`);
  lines.push(
    `| Elapsed | ${meta.elapsedSeconds != null ? formatDuration(meta.elapsedSeconds) : "—"} |`,
  );
  lines.push(`| App dir | \`${meta.appDir}\` |`);
  lines.push(`| Started | ${meta.startedAt} |`);
  lines.push(`| Finished | ${meta.finishedAt ?? "—"} |`);
  lines.push("");

  if (meta.scores) {
    lines.push(`## Score: ${meta.scores.total}/100 (Tier ${meta.scores.tier})`);
    lines.push("");
    lines.push(
      `| Frontend | Backend | DevOps | Code quality |`,
    );
    lines.push(`|---:|---:|---:|---:|`);
    lines.push(
      `| ${meta.scores.frontendSubscore} | ${meta.scores.backendSubscore} | ${meta.scores.devopsSubscore} | ${meta.scores.codeQualitySubscore} |`,
    );
    lines.push("");
    lines.push(`| Dimension | Score | Notes |`);
    lines.push(`|---|---:|---|`);
    for (const d of meta.scores.dimensions) {
      lines.push(
        `| ${d.label} | ${d.score}/${d.max} | ${d.notes.join("; ") || "—"} |`,
      );
    }
    lines.push("");
    if (meta.scores.killerStrength)
      lines.push(`- **Strength:** ${meta.scores.killerStrength}`);
    if (meta.scores.killerWeakness)
      lines.push(`- **Weakness:** ${meta.scores.killerWeakness}`);
    lines.push("");
  }

  if (meta.structural) {
    lines.push(`## Structural`);
    lines.push("");
    lines.push(
      `- Files: ${meta.structural.counts.files} · tsx: ${meta.structural.counts.tsxFiles} · components: ${meta.structural.counts.components} · routes: ${meta.structural.counts.routes} · tests: ${meta.structural.counts.testFiles}`,
    );
    lines.push(
      `- Stack: ${Object.entries(meta.structural.stack)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(", ") || "—"}`,
    );
    if (meta.structural.secrets.likelyLeakedKeys.length) {
      lines.push(
        `- ⚠️ Possible secrets: ${meta.structural.secrets.likelyLeakedKeys.join(", ")}`,
      );
    }
    lines.push("");
  }

  if (meta.runtime) {
    lines.push(`## Runtime checks`);
    lines.push("");
    lines.push(`| Check | OK | Detail | Time |`);
    lines.push(`|---|:---:|---|---:|`);
    for (const c of meta.runtime.checks) {
      lines.push(
        `| ${c.label} | ${c.ok ? "✅" : "❌"} | ${escapePipes(c.detail ?? "")} | ${c.elapsedMs != null ? `${Math.round(c.elapsedMs / 1000)}s` : "—"} |`,
      );
    }
    lines.push("");
  }

  if (meta.phases.length) {
    lines.push(`## Phases`);
    lines.push("");
    for (const p of meta.phases) {
      lines.push(
        `- **${p.name}**: ${p.status} (${p.elapsedSeconds != null ? formatDuration(p.elapsedSeconds) : "—"})${p.error ? ` — ${p.error}` : ""}`,
      );
    }
    lines.push("");
  }

  if (meta.notes?.length) {
    lines.push(`## Notes`);
    for (const n of meta.notes) lines.push(`- ${n}`);
    lines.push("");
  }

  await writeText(path.join(meta.resultDir, "report.md"), lines.join("\n"));
}

export async function rebuildLeaderboard() {
  await ensureDir(RESULTS_DIR);
  await ensureDir(DOCS_DIR);

  let slugs: string[] = [];
  try {
    slugs = await readdir(RESULTS_DIR);
  } catch {
    slugs = [];
  }

  const runs: RunMeta[] = [];
  for (const slug of slugs) {
    const p = path.join(RESULTS_DIR, slug, "result.json");
    if (await exists(p)) {
      try {
        runs.push(await readJson<RunMeta>(p));
      } catch {
        /* skip */
      }
    }
  }

  runs.sort((a, b) => (b.scores?.total ?? -1) - (a.scores?.total ?? -1));

  const lines: string[] = [];
  lines.push(`# Harness Bench Leaderboard`);
  lines.push("");
  lines.push(`Updated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(
    `Scoring is the **auto rubric** (structural + runtime + frontend heuristics). Use LLM/human audit for final claims.`,
  );
  lines.push("");
  lines.push(
    `| Rank | Slug | Harness | Models | Total | Tier | FE | BE | Ops | Qual | Time | Status |`,
  );
  lines.push(
    `|---:|---|---|---|---:|:---:|---:|---:|---:|---:|---:|---|`,
  );

  runs.forEach((r, i) => {
    lines.push(
      `| ${i + 1} | \`${r.slug}\` | ${r.harness} | ${r.models.map((m) => m.id).join(" + ")} | ${r.scores?.total ?? "—"} | ${r.scores?.tier ?? "—"} | ${r.scores?.frontendSubscore ?? "—"} | ${r.scores?.backendSubscore ?? "—"} | ${r.scores?.devopsSubscore ?? "—"} | ${r.scores?.codeQualitySubscore ?? "—"} | ${r.elapsedSeconds != null ? formatDuration(r.elapsedSeconds) : "—"} | ${r.status} |`,
    );
  });

  lines.push("");
  lines.push(`## Runs`);
  for (const r of runs) {
    lines.push(
      `- [\`${r.slug}\`](../results/${r.slug}/report.md) — ${r.status}` +
        (r.scores ? ` — ${r.scores.total}/100` : ""),
    );
  }
  lines.push("");

  await writeText(path.join(DOCS_DIR, "leaderboard.md"), lines.join("\n"));

  // also a compact JSON index
  await writeText(
    path.join(RESULTS_DIR, "index.json"),
    JSON.stringify(
      runs.map((r) => ({
        slug: r.slug,
        taskId: r.taskId,
        harness: r.harness,
        models: r.models,
        status: r.status,
        total: r.scores?.total ?? null,
        tier: r.scores?.tier ?? null,
        elapsedSeconds: r.elapsedSeconds ?? null,
      })),
      null,
      2,
    ) + "\n",
  );
}

function escapePipes(s: string) {
  return s.replace(/\n/g, " ").replace(/\|/g, "\\|").slice(0, 200);
}
