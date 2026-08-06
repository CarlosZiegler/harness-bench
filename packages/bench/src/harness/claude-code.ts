import { execa } from "execa";
import { writeText } from "../lib/fs.ts";
import type { HarnessAdapter, ModelRole } from "../types/index.ts";

/**
 * Claude Code CLI adapter.
 * Uses: claude -p --output-format json --permission-mode bypassPermissions
 * Multi-model (SOL planner + Luna executor) is expressed in the prompt when
 * the CLI does not expose native multi-agent flags for those models.
 */
export const claudeCodeHarness: HarnessAdapter = {
  id: "claude-code",
  label: "Claude Code",

  async isAvailable() {
    const r = await execa("which", ["claude"], { reject: false });
    return r.exitCode === 0;
  },

  async run({ cwd, prompt, models, timeoutMs, logFile, env }) {
    const model = pickModelFlag(models);
    await writeText(`${cwd}/.bench-prompt.md`, prompt);

    const args = [
      "-p",
      prompt,
      "--output-format",
      "json",
      "--permission-mode",
      "bypassPermissions",
      "--print",
    ];
    if (model) {
      args.push("--model", model);
    }

    const started = Date.now();
    try {
      const result = await execa("claude", args, {
        cwd,
        env: { ...process.env, ...env },
        timeout: timeoutMs,
        reject: false,
        all: true,
      });

      await writeText(
        logFile,
        [
          `# claude-code run`,
          `model: ${model ?? "(default)"}`,
          `elapsedMs: ${Date.now() - started}`,
          `exitCode: ${result.exitCode}`,
          `timedOut: ${result.timedOut ?? false}`,
          "",
          result.all ?? "",
        ].join("\n"),
      );

      let tokens: { input?: number; output?: number; total?: number } | undefined;
      let toolCalls: number | undefined;
      try {
        const parsed = JSON.parse(result.all ?? "{}");
        // Claude Code JSON shape varies by version; best-effort parse.
        const usage = parsed?.usage ?? parsed?.result?.usage;
        if (usage) {
          tokens = {
            input: usage.input_tokens ?? usage.inputTokens,
            output: usage.output_tokens ?? usage.outputTokens,
            total:
              (usage.input_tokens ?? usage.inputTokens ?? 0) +
              (usage.output_tokens ?? usage.outputTokens ?? 0),
          };
        }
        if (Array.isArray(parsed?.message?.content)) {
          toolCalls = parsed.message.content.filter(
            (c: { type?: string }) => c.type === "tool_use",
          ).length;
        }
      } catch {
        // non-json or partial
      }

      return {
        exitCode: result.exitCode ?? null,
        timedOut: result.timedOut ?? false,
        tokens,
        toolCalls,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await writeText(logFile, `claude failed: ${message}\n`);
      return { exitCode: 1, timedOut: false };
    }
  },
};

function pickModelFlag(models: ModelRole[]) {
  // Prefer solo; for multi-model pairs, pass planner as primary and encode
  // executor instructions inside the prompt (see buildPrompt).
  const solo = models.find((m) => m.role === "solo");
  const planner = models.find((m) => m.role === "planner");
  const m = solo ?? planner ?? models[0];
  return m?.id;
}
