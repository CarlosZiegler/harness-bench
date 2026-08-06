import { execa } from "execa";
import path from "node:path";
import { writeText } from "../lib/fs.ts";
import type { HarnessAdapter, ModelRole } from "../types/index.ts";

/**
 * OpenAI Codex CLI adapter (fair-fight safe).
 *
 *   codex exec --full-auto --skip-git-repo-check \
 *     -m gpt-5.6-luna \
 *     -c model_reasoning_effort="xhigh" \
 *     -
 *
 * Prompt is piped on stdin ("-") so argv stays small and shell pollution is avoided.
 *
 * CRITICAL:
 * - Always pass -m explicitly (user ~/.codex/config.toml may default to gpt-5.6-sol).
 * - Always pass model_reasoning_effort (config may default to "high", not xhigh).
 * - Strip PRIME_AGENT_INTERNAL_* / RLM_* when parent is a Prime session.
 */
export const codexHarness: HarnessAdapter = {
  id: "codex",
  label: "Codex CLI",

  async isAvailable() {
    const r = await execa("which", ["codex"], { reject: false });
    return r.exitCode === 0;
  },

  async run({ cwd, prompt, models, timeoutMs, logFile, env }) {
    const primary = pickPrimary(models);
    const model = normalizeCodexModelId(primary.id);
    const effort = primary.effort ?? "xhigh";

    const promptFile = path.join(cwd, ".bench-prompt.md");
    await writeText(promptFile, prompt);

    const args = [
      "exec",
      "--full-auto",
      "--skip-git-repo-check",
      "-m",
      model,
      // Force effort — do not inherit ~/.codex/config.toml default ("high")
      "-c",
      `model_reasoning_effort=${tomlString(effort)}`,
      // Read prompt from stdin
      "-",
    ];

    const cleanEnv = sanitizeEnv({ ...process.env, ...env });
    const started = Date.now();

    try {
      const result = await execa("codex", args, {
        cwd,
        env: cleanEnv,
        timeout: timeoutMs,
        reject: false,
        all: true,
        // Pipe prompt only — never inherit parent shell stdin
        input: prompt,
        extendEnv: false,
      });

      await writeText(
        logFile,
        [
          `# codex run`,
          `model: ${model}`,
          `model_reasoning_effort: ${effort}`,
          `cwd: ${cwd}`,
          `promptFile: ${promptFile}`,
          `elapsedMs: ${Date.now() - started}`,
          `exitCode: ${result.exitCode}`,
          `timedOut: ${result.timedOut ?? false}`,
          `args: codex ${args.map(safeArg).join(" ")}`,
          `env: stripped PRIME_AGENT_INTERNAL_* RLM_*; input=prompt stdin`,
          "",
          result.all ?? "",
        ].join("\n"),
      );

      return {
        exitCode: result.exitCode ?? null,
        timedOut: result.timedOut ?? false,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await writeText(logFile, `codex failed: ${message}\n`);
      return { exitCode: 1, timedOut: false };
    }
  },
};

function pickPrimary(models: ModelRole[]) {
  return (
    models.find((m) => m.role === "solo") ??
    models.find((m) => m.role === "planner") ??
    models[0]
  );
}

/** Map legacy/wrong ids like gpt-5.6-luna-xhigh → gpt-5.6-luna */
function normalizeCodexModelId(id: string) {
  let m = id.includes("/") ? id.split("/").pop()! : id;
  // effort is not part of the model slug in Codex
  m = m.replace(/-xhigh$/i, "").replace(/-high$/i, "");
  return m;
}

function tomlString(s: string) {
  // codex -c value is TOML; quote strings
  return JSON.stringify(s);
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

function safeArg(a: string) {
  if (a.length > 48) return `"${a.slice(0, 20)}…"`;
  return /\s/.test(a) ? JSON.stringify(a) : a;
}
