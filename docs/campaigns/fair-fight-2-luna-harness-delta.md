# Fair Fight #2 — Prime Agent vs Codex · Luna xHigh

**Question:** Same model (GPT-5.6 Luna) + same effort (xhigh) + same Pulseboard task — how much does the harness (Prime Agent vs Codex CLI) change delivery?

| Side | Harness | Model | Effort |
|---|---|---|---|
| A | Prime Agent | `gpt-5.6-luna` (`openai-codex`) | `--thinking xhigh` |
| B | Codex CLI | `gpt-5.6-luna` | `model_reasoning_effort=xhigh` |

Presets: `fair-prime-luna-xhigh` · `fair-codex-luna-xhigh`  
Task: Pulseboard (same prompts as FF#1)  
Plan mode: Mode 1 — agent owns plan  
**Does not use Grok.** Overrides Codex home default (`sol`/`high`).

## Run

```bash
bun run bench -- run -t pulseboard --preset fair-prime-luna-xhigh --force --timeout-minutes 120
bun run bench -- run -t pulseboard --preset fair-codex-luna-xhigh --force --timeout-minutes 120
```


## Status (2026-08-06)

| Side | Result |
|---|---|
| A Prime · Luna xhigh | **TIMEOUT / HANG** after ~build — see `results/pulseboard-prime-agent-luna-xhigh/HANG.md` |
| B Codex · Luna xhigh | **Not started** (sequential queue blocked on A) |

### Why A hung (short)

- Model/effort controls OK (`gpt-5.6-luna` @ xhigh).
- Agent wrote a full-looking app + `dist/`, then went **idle ~40+ min** (0% CPU).
- Left `vite dev :3000` running; never wrote `BENCH_VALIDATE.md`; never returned to bench.
- Bench had no streaming log/heartbeat → looked “still running” until process inspection.

### Bench follow-ups

Watchdog on idle mtime, stream logs, session-dir forensics, kill orphan vite, avoid port 3000 clash, classify `agent_hang` in result.json.


## Attempt 2 (scored)

| Side | Result |
|---|---|
| A Prime · Luna xhigh | **98 Tier A** (~64m). Agent exit 1 maxTurns; runtime all green. |
| B Codex · Luna xhigh | **89 Tier A** (~38m). Docker COPY fail + compose env; e2e auth incomplete. |

Full write-up: [docs/fair-fight-2/RESULTS.md](../fair-fight-2/RESULTS.md)
