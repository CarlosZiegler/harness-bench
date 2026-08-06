import type { HarnessId, ModelRole } from "../types/index.ts";

export interface Preset {
  harness: HarnessId;
  models: ModelRole[];
  notes?: string;
  campaign?: string;
  /** Fixed controls documented for this preset (shown in meta) */
  controls?: Record<string, string>;
}

/**
 * Named presets.
 *
 * ★ Fair fight #1 is the headline campaign:
 *   same model (grok-4.5) + same effort (high) + same task prompt
 *   only harness differs: prime-agent vs grok-cli
 */
export const PRESETS: Record<string, Preset> = {
  // ─── Fair fight #1: harness delta (Grok 4.5 high) ─────────────────
  "fair-prime-grok-4.5-high": {
    harness: "prime-agent",
    models: [
      {
        role: "solo",
        id: "xai/grok-4.5",
        label: "grok-4.5",
        provider: "xai",
        effort: "high",
      },
    ],
    campaign: "fair-fight-1-harness-delta",
    controls: {
      model: "grok-4.5",
      effort: "high",
      mode: "agent-owns-plan",
      task: "pulseboard",
    },
    notes:
      "FAIR FIGHT #1 — Prime Agent side. Pair with fair-grok-cli-grok-4.5-high",
  },
  "fair-grok-cli-grok-4.5-high": {
    harness: "grok-cli",
    models: [
      {
        role: "solo",
        id: "grok-4.5",
        label: "grok-4.5",
        effort: "high",
      },
    ],
    campaign: "fair-fight-1-harness-delta",
    controls: {
      model: "grok-4.5",
      effort: "high",
      mode: "agent-owns-plan",
      task: "pulseboard",
    },
    notes:
      "FAIR FIGHT #1 — Grok CLI side. Pair with fair-prime-grok-4.5-high. Headless: https://docs.x.ai/build/cli/headless-scripting",
  },

  // ─── Convenience aliases (same as fair-*) ─────────────────────────
  "prime-grok-4.5": {
    harness: "prime-agent",
    models: [
      {
        role: "solo",
        id: "xai/grok-4.5",
        label: "grok-4.5",
        provider: "xai",
        effort: "high",
      },
    ],
    notes: "Alias → same controls as fair-prime-grok-4.5-high",
  },
  "grok-cli-grok-4.5": {
    harness: "grok-cli",
    models: [
      { role: "solo", id: "grok-4.5", label: "grok-4.5", effort: "high" },
    ],
    notes: "Alias → same controls as fair-grok-cli-grok-4.5-high",
  },


  // ─── Fair fight #2: harness delta (Luna xhigh) ───────────────────
  "fair-prime-luna-xhigh": {
    harness: "prime-agent",
    models: [
      {
        role: "solo",
        id: "gpt-5.6-luna",
        label: "luna",
        provider: "openai-codex",
        effort: "xhigh",
      },
    ],
    campaign: "fair-fight-2-luna-harness-delta",
    controls: {
      model: "gpt-5.6-luna",
      effort: "xhigh",
      mode: "agent-owns-plan",
      task: "pulseboard",
    },
    notes:
      "FAIR FIGHT #2 — Prime Agent side. Model gpt-5.6-luna + --thinking xhigh. Pair with fair-codex-luna-xhigh. Does NOT use Grok.",
  },
  "fair-codex-luna-xhigh": {
    harness: "codex",
    models: [
      {
        role: "solo",
        id: "gpt-5.6-luna",
        label: "luna",
        effort: "xhigh",
      },
    ],
    campaign: "fair-fight-2-luna-harness-delta",
    controls: {
      model: "gpt-5.6-luna",
      effort: "xhigh",
      mode: "agent-owns-plan",
      task: "pulseboard",
    },
    notes:
      "FAIR FIGHT #2 — Codex CLI side. -m gpt-5.6-luna -c model_reasoning_effort=xhigh. Overrides ~/.codex default sol/high.",
  },

  // ─── Other harnesses (later campaigns) ────────────────────────────
  "prime-opus-4.7": {
    harness: "prime-agent",
    models: [
      {
        role: "solo",
        id: "anthropic/claude-opus-4-7",
        label: "opus-4.7",
        effort: "high",
      },
    ],
  },
  "prime-sonnet-4.6": {
    harness: "prime-agent",
    models: [
      {
        role: "solo",
        id: "anthropic/claude-sonnet-4-6",
        label: "sonnet-4.6",
        effort: "high",
      },
    ],
  },
  "claude-opus-4.7": {
    harness: "claude-code",
    models: [{ role: "solo", id: "claude-opus-4-7", label: "opus-4.7" }],
  },
  "claude-sonnet-4.6": {
    harness: "claude-code",
    models: [{ role: "solo", id: "claude-sonnet-4-6", label: "sonnet-4.6" }],
  },
  "codex-sol-luna-xhigh": {
    harness: "codex",
    models: [
      { role: "planner", id: "gpt-5.6-sol", label: "sol-xhigh" },
      { role: "executor", id: "gpt-5.6-luna", label: "luna-xhigh" },
    ],
    notes:
      "Later campaign: multi-agent recipe inside Codex only (not a harness fair fight)",
  },
  "codex-luna-xhigh": {
    harness: "codex",
    models: [
      { role: "solo", id: "gpt-5.6-luna", label: "luna", effort: "xhigh" },
    ],
  },
  "codex-sol-xhigh": {
    harness: "codex",
    models: [{ role: "solo", id: "gpt-5.6-sol", label: "sol", effort: "xhigh" }],
  },
  "manual-any": {
    harness: "manual",
    models: [{ role: "solo", id: "manual", label: "manual" }],
    notes: "Handoff only",
  },
};

/** Parse "grok-4.5" or "solo:grok-4.5@high" or "planner:sol,executor:luna" */
export function parseModelsArg(spec: string): ModelRole[] {
  const parts = spec
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.map((part) => {
    let role: ModelRole["role"] = "solo";
    let rest = part;
    if (part.includes(":") && ["solo", "planner", "executor"].includes(part.split(":")[0]!)) {
      const [roleRaw, ...r] = part.split(":");
      role = roleRaw as ModelRole["role"];
      rest = r.join(":");
    }
    let effort: string | undefined;
    if (rest.includes("@")) {
      const [idPart, eff] = rest.split("@");
      rest = idPart!;
      effort = eff;
    }
    return {
      role,
      id: rest,
      label: slugLabel(rest),
      effort,
      provider: rest.startsWith("grok") && !rest.includes("/") ? "xai" : undefined,
    };
  });
}

function slugLabel(id: string) {
  return id
    .split("/")
    .pop()!
    .replace(/[^a-zA-Z0-9.]+/g, "-")
    .toLowerCase();
}
