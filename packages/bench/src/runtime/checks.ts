import { execa } from "execa";
import path from "node:path";
import { exists } from "../lib/fs.ts";
import type { RuntimeCheck, RuntimeResult } from "../types/index.ts";

export async function runRuntimeChecks(
  appDir: string,
  opts: { skipDocker?: boolean } = {},
): Promise<RuntimeResult> {
  const checks: RuntimeCheck[] = [];

  const hasPkg = await exists(path.join(appDir, "package.json"));
  if (!hasPkg) {
    return {
      checks: [
        {
          id: "package_json",
          label: "package.json exists",
          ok: false,
          detail: "missing package.json",
        },
      ],
      allPassed: false,
    };
  }

  // Detect package manager
  const pm = (await exists(path.join(appDir, "bun.lock"))) ||
    (await exists(path.join(appDir, "bun.lockb")))
    ? "bun"
    : (await exists(path.join(appDir, "pnpm-lock.yaml")))
      ? "pnpm"
      : "npm";

  checks.push(await runCheck("install", "Install dependencies", async () => {
    const args =
      pm === "bun"
        ? ["install"]
        : pm === "pnpm"
          ? ["install"]
          : ["install", "--legacy-peer-deps"];
    const bin = pm === "npm" ? "npm" : pm;
    const r = await execa(bin, args, {
      cwd: appDir,
      reject: false,
      timeout: 10 * 60_000,
      all: true,
    });
    if (r.exitCode !== 0) throw new Error(tail(r.all, 1200));
    return `${pm} install ok`;
  }));

  checks.push(
    await runCheck("typecheck", "Typecheck", async () => {
      const r = await execa(
        pm === "npm" ? "npm" : pm,
        pm === "npm" ? ["run", "typecheck", "--if-present"] : ["run", "typecheck"],
        { cwd: appDir, reject: false, timeout: 5 * 60_000, all: true },
      );
      // if script missing, soft-pass
      if (/Missing script|Script not found|doesn't exist/i.test(r.all ?? "")) {
        return "typecheck script missing (soft pass)";
      }
      if (r.exitCode !== 0) throw new Error(tail(r.all, 1200));
      return "typecheck ok";
    }),
  );

  checks.push(
    await runCheck("build", "Production build", async () => {
      const r = await execa(
        pm === "npm" ? "npm" : pm,
        pm === "npm" ? ["run", "build"] : ["run", "build"],
        { cwd: appDir, reject: false, timeout: 10 * 60_000, all: true },
      );
      if (r.exitCode !== 0) throw new Error(tail(r.all, 1500));
      return "build ok";
    }),
  );

  const hasDockerfile = await exists(path.join(appDir, "Dockerfile"));
  const hasCompose =
    (await exists(path.join(appDir, "docker-compose.yml"))) ||
    (await exists(path.join(appDir, "compose.yml"))) ||
    (await exists(path.join(appDir, "docker-compose.yaml")));

  if (!opts.skipDocker && hasDockerfile) {
    checks.push(
      await runCheck("docker_build", "docker build", async () => {
        const r = await execa(
          "docker",
          ["build", "-t", `harness-bench-tmp:${path.basename(appDir)}`, "."],
          { cwd: appDir, reject: false, timeout: 15 * 60_000, all: true },
        );
        if (r.exitCode !== 0) throw new Error(tail(r.all, 1500));
        return "docker build ok";
      }),
    );
  } else {
    checks.push({
      id: "docker_build",
      label: "docker build",
      ok: false,
      detail: opts.skipDocker ? "skipped" : "no Dockerfile",
    });
  }

  if (!opts.skipDocker && hasCompose) {
    checks.push(
      await runCheck("compose_up", "docker compose up --build -d", async () => {
        const r = await execa(
          "docker",
          ["compose", "up", "--build", "-d", "--wait"],
          { cwd: appDir, reject: false, timeout: 15 * 60_000, all: true },
        );
        // always try to tear down
        await execa("docker", ["compose", "down", "-v"], {
          cwd: appDir,
          reject: false,
          timeout: 120_000,
        });
        if (r.exitCode !== 0) throw new Error(tail(r.all, 1500));
        return "compose up ok";
      }),
    );
  } else {
    checks.push({
      id: "compose_up",
      label: "docker compose up",
      ok: false,
      detail: opts.skipDocker ? "skipped" : "no compose file",
    });
  }

  return {
    checks,
    allPassed: checks.every((c) => c.ok),
  };
}

async function runCheck(
  id: string,
  label: string,
  fn: () => Promise<string>,
): Promise<RuntimeCheck> {
  const t0 = Date.now();
  try {
    const detail = await fn();
    return { id, label, ok: true, detail, elapsedMs: Date.now() - t0 };
  } catch (err) {
    return {
      id,
      label,
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
      elapsedMs: Date.now() - t0,
    };
  }
}

function tail(s: string | undefined, n: number) {
  if (!s) return "";
  return s.length <= n ? s : s.slice(-n);
}
