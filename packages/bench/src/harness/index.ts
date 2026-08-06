import type { HarnessAdapter, HarnessId } from "../types/index.ts";
import { primeAgentHarness } from "./prime-agent.ts";
import { grokCliHarness } from "./grok-cli.ts";
import { claudeCodeHarness } from "./claude-code.ts";
import { codexHarness } from "./codex.ts";
import { manualHarness } from "./manual.ts";

const registry: Record<HarnessId, HarnessAdapter> = {
  "prime-agent": primeAgentHarness,
  "grok-cli": grokCliHarness,
  "claude-code": claudeCodeHarness,
  codex: codexHarness,
  manual: manualHarness,
};

export function getHarness(id: HarnessId): HarnessAdapter {
  const h = registry[id];
  if (!h) throw new Error(`Unknown harness: ${id}`);
  return h;
}

export function listHarnesses() {
  return Object.values(registry);
}
