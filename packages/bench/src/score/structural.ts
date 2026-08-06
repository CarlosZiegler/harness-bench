import path from "node:path";
import { exists, listFilesRecursive, readText } from "../lib/fs.ts";
import type { StructuralScan } from "../types/index.ts";

const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/g,
  /sk-ant-[a-zA-Z0-9\-_]{20,}/g,
  /OPENAI_API_KEY\s*=\s*['\"]?[^'\"\s]+/g,
  /BETTER_AUTH_SECRET\s*=\s*['\"]?(?!changeme|replace|your-|xxx)[A-Za-z0-9\/\+=]{16,}/g,
  /postgres(?:ql)?:\/\/[^:]+:[^@]+@/gi,
];

export async function scanStructural(appDir: string): Promise<StructuralScan> {
  const files = await listFilesRecursive(appDir);
  const has = (re: RegExp) => files.some((f) => re.test(f));
  const hasFile = async (...candidates: string[]) => {
    for (const c of candidates) {
      if (await exists(path.join(appDir, c))) return true;
    }
    return false;
  };

  const pkgPath = path.join(appDir, "package.json");
  let pkg = "";
  if (await exists(pkgPath)) pkg = await readText(pkgPath);

  const composeExists = await hasFile(
    "docker-compose.yml",
    "docker-compose.yaml",
    "compose.yml",
    "compose.yaml",
  );
  const dockerfileExists = await hasFile("Dockerfile", "dockerfile");

  // Grep-ish content signals across a sample of source files
  const sourceFiles = files
    .filter((f) => /\.(ts|tsx|js|jsx|json|yml|yaml|md)$/.test(f))
    .slice(0, 400);

  let blob = pkg + "\n";
  for (const f of sourceFiles) {
    try {
      blob += "\n" + (await readText(path.join(appDir, f)));
    } catch {
      /* skip */
    }
  }

  const likelyLeakedKeys: string[] = [];
  for (const re of SECRET_PATTERNS) {
    const matches = blob.match(re) ?? [];
    for (const m of matches) {
      // redact middle
      const redacted =
        m.length > 12 ? `${m.slice(0, 6)}…${m.slice(-4)}` : "[redacted]";
      if (!likelyLeakedKeys.includes(redacted)) likelyLeakedKeys.push(redacted);
    }
  }

  const tsxFiles = files.filter((f) => f.endsWith(".tsx")).length;
  const testFiles = files.filter((f) =>
    /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(f) || /__tests__\//.test(f),
  ).length;
  const routes = files.filter(
    (f) =>
      /routes\//.test(f) ||
      /app\/.*page\.(t|j)sx?$/.test(f) ||
      /src\/routes\//.test(f),
  ).length;
  const components = files.filter(
    (f) => /components\//.test(f) && /\.(tsx|jsx)$/.test(f),
  ).length;

  const present: Record<string, boolean> = {
    package_json: await hasFile("package.json"),
    readme: await hasFile("README.md", "readme.md"),
    dockerfile: dockerfileExists,
    docker_compose: composeExists,
    env_example: await hasFile(".env.example", ".env.sample"),
    drizzle_config: has(/drizzle\.config\.(ts|js)/) || /drizzle-orm/.test(blob),
    auth: /better-auth/.test(blob) || has(/auth\.(ts|tsx)/),
    tests: testFiles > 0,
    tailwind: /tailwind/.test(blob) || has(/globals\.css/),
    tsconfig: await hasFile("tsconfig.json"),
  };

  return {
    present,
    counts: {
      files: files.length,
      tsxFiles,
      testFiles,
      routes,
      components,
    },
    stack: {
      tanstackStart:
        /@tanstack\/react-start/.test(blob) || /@tanstack\/start/.test(blob),
      drizzle: /drizzle-orm/.test(blob),
      betterAuth: /better-auth/.test(blob),
      shadcn: /shadcn|@base-ui\/react|class-variance-authority/.test(blob),
      reui: /reui|@reui\//i.test(blob),
      postgres:
        /postgres|postgresql|pg\b|@neondatabase|postgres-js|drizzle-orm\/postgres/.test(
          blob,
        ),
      dockerCompose: composeExists,
      dockerfile: dockerfileExists,
    },
    secrets: {
      envCommitted:
        (await hasFile(".env", ".env.local", ".env.production")) &&
        !(await hasFile(".env.example")),
      likelyLeakedKeys,
    },
    packageManager: (await hasFile("bun.lock", "bun.lockb"))
      ? "bun"
      : (await hasFile("pnpm-lock.yaml"))
        ? "pnpm"
        : (await hasFile("package-lock.json"))
          ? "npm"
          : undefined,
  };
}
