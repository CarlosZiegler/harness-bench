# Fair Fight #1 — How much does the **harness** matter?

> ✅ **Results published:** [docs/fair-fight-1/RESULTS.md](../fair-fight-1/RESULTS.md)  
> Prime Agent **98** (Tier A) vs Grok CLI **89** (Tier A) · same Grok 4.5 @ high · screenshots included.

**Question:** Holding model, effort, task, and plan-mode fixed, how different is the delivered fullstack app when only the **coding harness** changes?

| Side | Harness | Binary | Model | Effort mapping |
|---|---|---|---|---|
| A | **Prime Agent** | `prime-agent` | `grok-4.5` (`xai`) | `--thinking high` |
| B | **Grok CLI** | `grok` | `grok-4.5` | `--effort high` |

Task: **Pulseboard** (TanStack Start · Drizzle · Postgres · Better Auth · shadcn/re-ui · Docker Compose)

Plan mode: **Mode 1 — agent owns the plan**  
(“Plan briefly, then implement.” Same product prompt both sides. No shared PLAN.md.)

---

## Why this fight (and not others)

| Comparison | Problem |
|---|---|
| Prime(Grok) vs Claude(Opus) | model + harness confounded |
| Codex SOL→Luna vs anything solo | multi-agent recipe confounded |
| **Prime(Grok 4.5 high) vs Grok CLI(Grok 4.5 high)** | only harness differs |

Later campaigns can compare agents/recipes. **This campaign documents harness delta.**

---

## Fixed controls

| Control | Value |
|---|---|
| Task prompt | `packages/bench/prompts/tasks/pulseboard.build.md` (+ validate) |
| Scaffold | `bunx --bun shadcn@latest init --preset b0 --template start --pointer --yes` |
| Model | Grok 4.5 |
| Effort | **high** on both |
| Autonomy | unattended; auto-approve tools |
| Timeout | 90 min default (raise if needed) |
| Human mid-run help | **forbidden** |
| Secrets | `.env.example` only |

### Effort equivalence

| Grok CLI | Prime Agent |
|---|---|
| `--effort high` | `--thinking high` |
| `--effort medium` | `--thinking medium` |
| `--effort low` | `--thinking low` |

Grok CLI only exposes `high|medium|low` for grok-4.5. Fair fight stays inside that set.

### Headless invocation (source of truth)

**Grok CLI** — [Headless & Scripting](https://docs.x.ai/build/cli/headless-scripting):

```bash
grok --no-auto-update \
  -p "<prompt>" \
  -m grok-4.5 \
  --effort high \
  --cwd <appDir> \
  --always-approve \
  --permission-mode bypassPermissions \
  --output-format json \
  --no-alt-screen \
  --verbatim
```

**Prime Agent:**

```bash
prime-agent -p --mode json \
  --cwd <appDir> \
  --provider xai --model grok-4.5 \
  --thinking high \
  --autonomous \
  --autonomous-timeout-ms=<ms> \
  -- "<prompt>"
```

---

## How to run

From monorepo root:

```bash
cd /Users/zietec/work/harness-bench
bun install

# Optional dry-run (meta + empty app dirs only)
bun run bench -- run -t pulseboard --preset fair-prime-grok-4.5-high --dry-run --force
bun run bench -- run -t pulseboard --preset fair-grok-cli-grok-4.5-high --dry-run --force

# Real runs (long — 30–90+ min each). Prefer sequential.
bun run bench -- run -t pulseboard --preset fair-prime-grok-4.5-high --force
bun run bench -- run -t pulseboard --preset fair-grok-cli-grok-4.5-high --force

# Compare
bun run bench -- compare \
  pulseboard-prime-agent-grok-4-5-high \
  pulseboard-grok-cli-grok-4-5-high

bun run bench -- report
```

### Expected app names

```text
apps/pulseboard-prime-agent-grok-4-5-high
apps/pulseboard-grok-cli-grok-4-5-high
```

---

## What we measure

1. **Product score** 0–100 (`rubrics/fullstack-webdev.md`) — FE weighted 25  
2. **Runtime** install · typecheck · build · docker build · compose up  
3. **Telemetry** wall time, tokens (if exposed), status  
4. **Optional** LLM/human FE preference (screenshots)

Anti-metrics: file count, LOC, raw test count.

---

## Interpreting results

| Outcome | Claim you can make |
|---|---|
| Large score/runtime gap, same model/effort | **Harness materially changes delivery** |
| Near tie | For this task band, harness swap ≈ neutral (on Grok 4.5 high) |
| One side fails tools/auth, other ships | Harness integration / tool loop is the story |

You **cannot** claim “Prime > all agents” from this fight alone.

---

## Replication checklist

- [ ] `grok login` (or `XAI_API_KEY`) works  
- [ ] `prime-agent` on PATH with `--provider xai --model grok-4.5`  
- [ ] Docker available if scoring full devops  
- [ ] No manual edits inside `apps/<slug>` during the run  
- [ ] Both runs use presets above  
- [ ] Publish `results/*/result.json` + `report.md` + leaderboard  

---

## Next campaigns (out of scope here)

2. Same harness, multi-agent recipe — Codex Luna solo vs SOL→Luna  
3. Cross-harness same model — e.g. Opus on Prime vs Claude Code  
4. Mode 3 — fixed PLAN.md shared, isolate execution only  
