# Methodology

## Primary question (Fair Fight #1)

> Holding **task**, **model**, and **effort** fixed, how much does the **coding harness** change fullstack delivery quality (including frontend)?

See [campaigns/fair-fight-1-harness-delta.md](./campaigns/fair-fight-1-harness-delta.md).

**Headline pair:** Prime Agent vs Grok CLI · Grok 4.5 · effort high · Pulseboard · Mode 1 (agent owns plan).

---

## Protocol

1. Fixed task prompts in `packages/bench/prompts`.
2. Isolated workspace `apps/<task>-<harness>-<model>-<effort>/`.
3. Same scaffold command when dir empty.
4. Phase 1 build (autonomous).
5. Phase 2 validate + harness-bench runtime checks.
6. Structural scan + auto rubric (+ optional human/LLM audit).
7. Leaderboard `docs/leaderboard.md`.

## Plan modes

| Mode | Who plans | Use when |
|---|---|---|
| **1 Agent owns plan** (default) | each run | real harness quality E2E — **Fair Fight #1** |
| **2 Fixed plan** | shared PLAN.md | isolate execution only |
| **3 Two-phase locked** | one planner once, then all execute | max rigor |

Fair Fight #1 uses **Mode 1** so we measure plan+act as users do. A Mode-2 re-run is optional if plans diverge wildly.

## Controls

| Control | Implementation |
|---|---|
| Same product prompt | templates; only path/slug substituted |
| Same model | presets pin `grok-4.5` |
| Same effort | presets pin `high` (`--effort` / `--thinking`) |
| Same timeout | `--timeout-minutes` |
| No mid-run human help | headless adapters |
| Secrets | scanner + prompt rules |

## Scoring

`packages/bench/rubrics/fullstack-webdev.md` — Frontend 25 / Backend 15 / DevOps 15 / …

## Known confounds

1. Harness system prompts differ by design — **harness is the treatment**.  
2. Non-determinism — repeat with `-r2` for strong claims.  
3. Mode 1 allows different plans — still valid for “end-to-end harness”; use Mode 2 to narrow.  
4. Network/scaffold flakiness — logged under `.bench-scaffold.log`.  
5. Effort enums differ across products — only compare values that both support (`high|medium|low`).

## What not to confound

- Different models on each side  
- Multi-agent recipe on one side only  
- Human rescue on one side only  
- Different tasks or hidden extra instructions  
