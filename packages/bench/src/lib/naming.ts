import { slugify } from "./fs.ts";
import type { HarnessId, ModelRole } from "../types/index.ts";

/**
 * App naming:
 *   <task>-<harness>-<model>[-effort][-rN]
 * Examples:
 *   pulseboard-prime-agent-grok-4-5-high
 *   pulseboard-grok-cli-grok-4-5-high
 */
export function buildAppName(opts: {
  taskId: string;
  harness: HarnessId;
  models: ModelRole[];
  runIndex?: number;
  customSlug?: string;
}) {
  if (opts.customSlug) return slugify(opts.customSlug);

  const modelPart = opts.models
    .map((m) => {
      const base = slugify(m.label ?? m.id);
      const effort = m.effort ? slugify(m.effort) : "";
      const core = effort ? `${base}-${effort}` : base;
      if (m.role === "solo") return core;
      return `${m.role}-${core}`;
    })
    .join("-");

  const parts = [opts.taskId, opts.harness, modelPart].filter(Boolean);
  if (opts.runIndex && opts.runIndex > 1) parts.push(`r${opts.runIndex}`);
  return slugify(parts.join("-"));
}

export function shortModelLabel(models: ModelRole[]) {
  return models
    .map((m) => {
      const id = m.label ?? m.id;
      const eff = m.effort ? `@${m.effort}` : "";
      return m.role === "solo" ? `${id}${eff}` : `${m.role}:${id}${eff}`;
    })
    .join(" + ");
}
