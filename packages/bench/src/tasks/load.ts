import path from "node:path";
import { PROMPTS_DIR } from "../lib/paths.ts";
import { exists, readText } from "../lib/fs.ts";
import type { TaskDefinition } from "../types/index.ts";
import { pulseboardTask } from "./pulseboard.ts";
import { launchpadTask } from "./launchpad.ts";

const TASKS: Record<string, TaskDefinition> = {
  [pulseboardTask.id]: pulseboardTask,
  [launchpadTask.id]: launchpadTask,
};

export function listTasks() {
  return Object.values(TASKS);
}

export function getTask(id: string): TaskDefinition {
  const t = TASKS[id];
  if (!t) {
    const known = Object.keys(TASKS).join(", ");
    throw new Error(`Unknown task "${id}". Known: ${known}`);
  }
  return t;
}

export async function loadPromptFile(rel: string) {
  const p = path.join(PROMPTS_DIR, rel);
  if (!(await exists(p))) {
    throw new Error(`Prompt file missing: ${p}`);
  }
  return readText(p);
}

export async function buildPhasePrompt(
  task: TaskDefinition,
  phase: "build" | "validate",
  opts: {
    appName: string;
    appDir: string;
    modelsLabel: string;
    multiAgentHint?: string;
  },
) {
  const baseRel =
    phase === "build" ? task.prompts.build : task.prompts.validate;
  let body = await loadPromptFile(baseRel);

  body = body
    .replaceAll("{{APP_NAME}}", opts.appName)
    .replaceAll("{{APP_DIR}}", opts.appDir)
    .replaceAll("{{MODELS}}", opts.modelsLabel)
    .replaceAll("{{TASK_ID}}", task.id)
    .replaceAll("{{TASK_TITLE}}", task.title);

  if (opts.multiAgentHint) {
    body =
      `## Multi-agent protocol\n\n${opts.multiAgentHint}\n\n---\n\n` + body;
  }

  return body;
}

export function multiAgentHint(
  models: { role: string; id: string; label?: string }[],
) {
  const planner = models.find((m) => m.role === "planner");
  const executor = models.find((m) => m.role === "executor");
  if (!planner || !executor) return undefined;

  return [
    `You are operating a **planner → executor** pair:`,
    ``,
    `- **Planner**: \`${planner.label ?? planner.id}\` — decompose the work, define interfaces, acceptance checks, file plan. Do not dump giant undifferentiated code blobs.`,
    `- **Executor**: \`${executor.label ?? executor.id}\` — implement files, run commands, fix errors, iterate until green.`,
    ``,
    `Rules:`,
    `1. Planner produces a short implementation plan (files, schema, routes, docker) before coding.`,
    `2. Executor implements incrementally and runs typecheck/build when possible.`,
    `3. If your harness supports subagents, use them. If not, simulate the protocol in one loop: plan block → implement → verify.`,
    `4. Never stop at a plan. Ship a working app in the workspace.`,
  ].join("\n");
}
