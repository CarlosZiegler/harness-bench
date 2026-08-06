import { execa } from "execa";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { writeText, ensureDir, exists } from "../lib/fs.ts";
import type { HarnessAdapter, ModelRole } from "../types/index.ts";

/**
 * Prime Agent adapter — fair-fight hardened.
 *
 * Docs: packages/coding-agent/docs/usage.md
 *
 * Hang mitigations (after FF#2 attempt-1):
 * 1. Stream stdout/stderr to logFile while running (not only on exit)
 * 2. --session-dir under results/<slug>/session for forensics
 * 3. Process group (detached) + kill entire tree on timeout/watchdog
 * 4. Idle mtime watchdog on cwd (no writes + low activity → kill as hang)
 * 5. Strip PRIME_AGENT_INTERNAL_* / RLM_* (no parent-session attach)
 * 6. stdin ignore; prompt via @.bench-prompt.md
 * 7. Append completion contract: do not leave vite/dev servers running
 */
export const primeAgentHarness: HarnessAdapter = {
  id: "prime-agent",
  label: "Prime Agent",

  async isAvailable() {
    const r = await execa("which", ["prime-agent"], { reject: false });
    return r.exitCode === 0;
  },

  async run({ cwd, prompt, models, timeoutMs, logFile, env }) {
    const primary = pickPrimary(models);
    const { provider, model } = splitProviderModel(primary);
    const thinking = mapEffortToThinking(primary.effort ?? "high");

    const promptRel = ".bench-prompt.md";
    const fullPrompt =
      prompt.trimEnd() +
      "\n\n---\n\n" +
      COMPLETION_CONTRACT +
      "\n";
    await writeText(path.join(cwd, promptRel), fullPrompt);

    const which = await execa("which", ["prime-agent"], { reject: false });
    if (which.exitCode !== 0) {
      const handoff = [
        "# Prime Agent Handoff",
        "prime-agent binary not on PATH.",
        `cwd: ${cwd}`,
        `model: ${provider ? `${provider}/` : ""}${model}`,
        "",
        fullPrompt,
      ].join("\n");
      await writeText(logFile, handoff + "\n");
      return { exitCode: 0, timedOut: false, rawSummary: "handoff-written" };
    }

    const resultDir = path.dirname(logFile);
    const sessionDir = path.join(resultDir, "session");
    await ensureDir(sessionDir);

    const autoTimeoutMs = Math.max(60_000, timeoutMs);
    // Idle watchdog: no cwd file mtime progress for this long → hang
    const idleLimitMs = Math.min(
      25 * 60_000,
      Math.max(12 * 60_000, Math.floor(timeoutMs * 0.35)),
    );

    const args = [
      "-p",
      "--mode",
      "json",
      "--cwd",
      cwd,
      "--thinking",
      thinking,
      "--autonomous",
      "--autonomous-timeout-ms",
      String(autoTimeoutMs),
      "--autonomous-max-turns",
      "200",
      "--autonomous-max-continuations",
      "30",
      "--autonomous-max-tokens",
      "2000000",
      // Keep session under results for hang forensics (attempt-1 used --no-session)
      "--session-dir",
      sessionDir,
      // Prefer dedicated port if agent starts a server
      // (env VITE_PORT / PORT set below)
    ];
    if (provider) args.push("--provider", provider);
    args.push("--model", model);
    args.push("--", `@${promptRel}`);

    const cleanEnv = sanitizeEnv({
      ...process.env,
      ...env,
      // steer away from compare-site port 3000
      PORT: env?.PORT ?? "3110",
      VITE_PORT: env?.VITE_PORT ?? "3110",
    });

    const started = Date.now();
    await writeText(
      logFile,
      [
        `# prime-agent run`,
        `# hang-mitigations: stream-log, session-dir, pgroup-kill, idle-mtime=${idleLimitMs}ms`,
        `provider: ${provider ?? "(default)"}`,
        `model: ${model}`,
        `thinking: ${thinking}`,
        `cwd: ${cwd}`,
        `sessionDir: ${sessionDir}`,
        `prompt: @${promptRel}`,
        `args: prime-agent ${args.map(safeArg).join(" ")}`,
        `started: ${new Date(started).toISOString()}`,
        "",
      ].join("\n"),
    );

    const logStream = createWriteStream(logFile, { flags: "a" });
    let timedOut = false;
    let hungIdle = false;
    let exitCode: number | null = null;

    const child = execa("prime-agent", args, {
      cwd,
      env: cleanEnv,
      // hard ceiling slightly above autonomous timeout
      timeout: timeoutMs + 90_000,
      reject: false,
      all: false,
      stdout: "pipe",
      stderr: "pipe",
      stdin: "ignore",
      extendEnv: false,
      // own process group so we can kill vite grandchildren
      detached: true,
      cleanup: false,
    });

    const pid = child.pid;
    child.stdout?.on("data", (buf: Buffer) => {
      logStream.write(buf);
    });
    child.stderr?.on("data", (buf: Buffer) => {
      logStream.write(buf);
    });

    const watchdog = startIdleWatchdog({
      cwd,
      idleLimitMs,
      onHang: () => {
        hungIdle = true;
        logStream.write(
          `\n\n# WATCHDOG: idle mtime > ${idleLimitMs}ms — killing process group (agent_hang)\n`,
        );
        killProcessGroup(pid);
      },
    });

    try {
      const result = await child;
      exitCode = result.exitCode ?? null;
      timedOut = Boolean(result.timedOut);
      if (timedOut) {
        logStream.write("\n# execa timeout — killing process group\n");
        killProcessGroup(pid);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logStream.write(`\n# prime-agent exception: ${message}\n`);
      killProcessGroup(pid);
      exitCode = 1;
    } finally {
      watchdog.stop();
      // Always try orphan cleanup in app cwd
      await cleanupAppOrphans(cwd, logStream);
      logStream.write(
        `\n# finished: exit=${exitCode} timedOut=${timedOut} hungIdle=${hungIdle} elapsedMs=${Date.now() - started}\n`,
      );
      await new Promise<void>((resolve) => logStream.end(() => resolve()));
    }

    if (hungIdle) {
      return {
        exitCode: exitCode ?? 1,
        timedOut: true,
        rawSummary: "agent_hang_idle_mtime",
      };
    }
    return {
      exitCode,
      timedOut,
      tokens: undefined,
    };
  },
};

const COMPLETION_CONTRACT = `## Bench completion contract (mandatory)

You are running unattended inside harness-bench.

1. **Do not leave long-running dev servers** (\`vite dev\`, \`bun dev\`, etc.) running when you finish. If you start one for smoke, **stop it** before exiting.
2. Prefer \`bun run typecheck\`, \`bun run build\`, \`bun test\`, and docker checks over interactive dev servers.
3. If you need a temporary server, bind to \`PORT\`/\`VITE_PORT\` from the environment (default **3110**), never assume exclusive use of 3000.
4. When the product is done, write a short \`BENCH_VALIDATE.md\` with pass/fail commands, then **exit** so the parent harness can score the run.
5. Do not wait for interactive confirmation. Finish or fail closed.
`;

function killProcessGroup(pid: number | undefined) {
  if (!pid) return;
  try {
    // negative PID = process group (detached child)
    process.kill(-pid, "SIGTERM");
  } catch {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      /* */
    }
  }
  setTimeout(() => {
    try {
      process.kill(-pid, "SIGKILL");
    } catch {
      try {
        process.kill(pid, "SIGKILL");
      } catch {
        /* */
      }
    }
  }, 4000);
}

function startIdleWatchdog(opts: {
  cwd: string;
  idleLimitMs: number;
  onHang: () => void;
}) {
  const startedAt = Date.now();
  const graceMs = 10 * 60_000; // allow scaffold/install/build burst
  let lastActivityAt = Date.now();
  let stopped = false;
  let fired = false;

  const interval = setInterval(async () => {
    if (stopped || fired) return;
    try {
      const latest = await latestMtimeMs(opts.cwd);
      // latest is absolute mtime; only count as activity if recent
      if (latest && Date.now() - latest < opts.idleLimitMs) {
        lastActivityAt = Math.max(lastActivityAt, latest);
      }
      const elapsed = Date.now() - startedAt;
      const idleFor = Date.now() - lastActivityAt;
      if (elapsed > graceMs && idleFor > opts.idleLimitMs) {
        fired = true;
        opts.onHang();
      }
    } catch {
      /* ignore */
    }
  }, 30_000);

  return {
    stop() {
      stopped = true;
      clearInterval(interval);
    },
  };
}

async function latestMtimeMs(root: string): Promise<number | null> {
  const { readdir, stat } = await import("node:fs/promises");
  let latest = 0;
  async function walk(dir: string, depth: number) {
    if (depth > 8) return;
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (
        e.name === "node_modules" ||
        e.name === ".git" ||
        e.name === "dist" ||
        e.name === ".output" ||
        e.name === ".tanstack"
      ) {
        continue;
      }
      const full = path.join(dir, e.name);
      try {
        if (e.isDirectory()) await walk(full, depth + 1);
        else {
          const s = await stat(full);
          if (s.mtimeMs > latest) latest = s.mtimeMs;
        }
      } catch {
        /* */
      }
    }
  }
  await walk(root, 0);
  return latest || null;
}

async function cleanupAppOrphans(
  cwd: string,
  log: { write: (s: string) => void },
) {
  // Best-effort: kill vite/bun dev whose cwd is this app
  try {
    const { execa: ex } = await import("execa");
    const ps = await ex("ps", ["-ax", "-o", "pid=,command="], {
      reject: false,
      all: true,
    });
    const lines = (ps.all ?? "").split("\n");
    for (const line of lines) {
      if (!line.includes(cwd)) continue;
      if (!/vite|bun dev|next dev/i.test(line)) continue;
      const pid = Number(line.trim().split(/\s+/)[0]);
      if (!pid || pid === process.pid) continue;
      try {
        process.kill(pid, "SIGTERM");
        log.write(`# cleanup orphan pid=${pid} :: ${line.trim().slice(0, 120)}\n`);
      } catch {
        /* */
      }
    }
  } catch {
    /* */
  }
}

function sanitizeEnv(
  env: NodeJS.ProcessEnv,
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(env)) {
    if (k.startsWith("PRIME_AGENT_INTERNAL_")) continue;
    if (k.startsWith("RLM_")) continue;
    if (k === "PRIME_AGENT_CODING_AGENT_DIR") continue;
    out[k] = v;
  }
  out.CI = out.CI ?? "1";
  out.NO_COLOR = "1";
  delete out.FORCE_COLOR;
  return out;
}

function pickPrimary(models: ModelRole[]) {
  return (
    models.find((m) => m.role === "solo") ??
    models.find((m) => m.role === "planner") ??
    models[0]
  );
}

function splitProviderModel(m: ModelRole): {
  provider?: string;
  model: string;
} {
  if (m.provider) {
    return {
      provider: m.provider,
      model: m.id.includes("/") ? m.id.split("/").pop()! : m.id,
    };
  }
  if (m.id.includes("/")) {
    const [provider, ...rest] = m.id.split("/");
    return { provider, model: rest.join("/") };
  }
  if (m.id.startsWith("grok")) return { provider: "xai", model: m.id };
  return { model: m.id };
}

function mapEffortToThinking(effort: string) {
  const e = effort.toLowerCase();
  if (
    ["off", "minimal", "low", "medium", "high", "xhigh", "max"].includes(e)
  ) {
    return e;
  }
  return "high";
}

function safeArg(a: string) {
  if (a.length > 48) return `"${a.slice(0, 20)}…"`;
  return /\s/.test(a) ? JSON.stringify(a) : a;
}

// silence unused
void exists;
