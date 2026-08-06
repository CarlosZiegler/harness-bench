import { execa } from "execa";
import { writeText } from "../lib/fs.ts";
import type { HarnessAdapter, ModelRole } from "../types/index.ts";

/**
 * Grok CLI (xAI) adapter — headless scripting mode.
 *
 * Docs: https://docs.x.ai/build/cli/headless-scripting
 *
 *   grok -p "<prompt>" \
 *     -m grok-4.5 \
 *     --effort high \
 *     --cwd <dir> \
 *     --always-approve \
 *     --output-format json \
 *     --no-alt-screen \
 *     --no-auto-update
 */
export const grokCliHarness: HarnessAdapter = {
  id: "grok-cli",
  label: "Grok CLI",

  async isAvailable() {
    const r = await execa("which", ["grok"], { reject: false });
    return r.exitCode === 0;
  },

  async run({ cwd, prompt, models, timeoutMs, logFile, env }) {
    const primary = pickPrimary(models);
    const model = stripProvider(primary.id);
    const effort = primary.effort ?? "high";

    await writeText(`${cwd}/.bench-prompt.md`, prompt);

    const args = [
      "--no-auto-update",
      "-p",
      prompt,
      "-m",
      model,
      "--effort",
      effort,
      "--cwd",
      cwd,
      "--always-approve",
      "--permission-mode",
      "bypassPermissions",
      "--output-format",
      "json",
      "--no-alt-screen",
      "--verbatim",
    ];

    const started = Date.now();
    try {
      const result = await execa("grok", args, {
        cwd,
        env: { ...process.env, ...env },
        timeout: timeoutMs,
        reject: false,
        all: true,
      });

      await writeText(
        logFile,
        [
          `# grok-cli run`,
          `# docs: https://docs.x.ai/build/cli/headless-scripting`,
          `model: ${model}`,
          `effort: ${effort}`,
          `cwd: ${cwd}`,
          `elapsedMs: ${Date.now() - started}`,
          `exitCode: ${result.exitCode}`,
          `timedOut: ${result.timedOut ?? false}`,
          `args: grok ${args.map(safeArg).join(" ")}`,
          "",
          result.all ?? "",
        ].join("\n"),
      );

      let tokens: { input?: number; output?: number; total?: number } | undefined;
      try {
        const parsed = JSON.parse(result.all ?? "{}");
        const usage = parsed?.usage ?? parsed?.result?.usage ?? parsed?.stats;
        if (usage) {
          tokens = {
            input: usage.input_tokens ?? usage.inputTokens ?? usage.input,
            output: usage.output_tokens ?? usage.outputTokens ?? usage.output,
            total:
              usage.total_tokens ??
              usage.totalTokens ??
              (usage.input_tokens ?? usage.input ?? 0) +
                (usage.output_tokens ?? usage.output ?? 0),
          };
        }
      } catch {
        /* plain or partial */
      }

      return {
        exitCode: result.exitCode ?? null,
        timedOut: result.timedOut ?? false,
        tokens,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await writeText(logFile, `grok-cli failed: ${message}\n`);
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

function stripProvider(id: string) {
  // xai/grok-4.5 -> grok-4.5
  if (id.includes("/")) return id.split("/").pop()!;
  return id;
}

function safeArg(a: string) {
  if (a.length > 40) return `"${a.slice(0, 20)}…"`;
  return /\s/.test(a) ? JSON.stringify(a) : a;
}
