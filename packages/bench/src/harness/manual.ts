import { writeText } from "../lib/fs.ts";
import type { HarnessAdapter } from "../types/index.ts";

/**
 * Manual harness — writes the prompt + a DONE marker expectation.
 * Useful when the human/operator (or an outer agent session) will build
 * the app, then the bench continues with validate/score.
 */
export const manualHarness: HarnessAdapter = {
  id: "manual",
  label: "Manual / Outer Agent",

  async isAvailable() {
    return true;
  },

  async run({ cwd, prompt, models, logFile }) {
    const body = [
      "# Manual harness",
      "",
      "Execute the prompt below inside this working directory, then re-run:",
      "",
      "  bun run bench -- score --slug <slug>",
      "  bun run bench -- validate --slug <slug>",
      "",
      `Models: ${models.map((m) => `${m.role}:${m.id}`).join(", ")}`,
      `cwd: ${cwd}`,
      "",
      "## Prompt",
      "",
      prompt,
    ].join("\n");
    await writeText(`${cwd}/.bench-prompt.md`, prompt);
    await writeText(`${cwd}/.bench-handoff.md`, body + "\n");
    await writeText(logFile, body + "\n");
    return { exitCode: 0, timedOut: false, rawSummary: "manual-handoff" };
  },
};
