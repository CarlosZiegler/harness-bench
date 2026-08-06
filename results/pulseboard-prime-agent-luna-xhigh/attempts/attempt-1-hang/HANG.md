# Hang report — `pulseboard-prime-agent-luna-xhigh`

**Campaign:** Fair Fight #2 · Prime Agent · `gpt-5.6-luna` @ `xhigh`  
**Classification:** **Agent did not finish / hung** (documented).  
**Not classified as:** operator mid-run app edit · wrong model (Grok) · dry-run.

## Timeline

| UTC / local | Event |
|---|---|
| 13:50:19Z / 15:50 | Campaign start Side A `fair-prime-luna-xhigh` |
| ~15:50–15:56 | Scaffold + substantial app write + `vite build` → `dist/` |
| ~15:51+ | `vite dev --port 3000` spawned in app cwd (left running) |
| 15:56 → 16:39 | **~43 min no source/product mtime progress** |
| 16:39 | Diagnosis: idle `prime-agent` child, 0% CPU, kevent wait |
| 16:39 | Operator killed hung tree; status → `timeout` |

## Controls check (not the failure)

```json
{
  "harness": "prime-agent",
  "model": "gpt-5.6-luna",
  "provider": "openai-codex",
  "effort": "xhigh",
  "task": "pulseboard"
}
```

Confirmed **not Grok** and not Codex default Sol.

## Evidence

1. **Process**
   - `bun … fair-prime-luna-xhigh` waiting on child
   - Child `prime-agent` ~49m elapsed, **0% CPU**, stack in `uv_run` / `kevent` (idle event loop)
   - macOS `ps` showed child argv as bare `prime-agent` + spaces (same display pattern as prior isolation hang), while bench intended full `-p --mode json …` args via execa

2. **Filesystem**
   - App largely complete: auth, drizzle, pulses, docker assets, `dist/`
   - Last meaningful build artifact mtime ~**15:56**
   - No `BENCH_VALIDATE.md`
   - No `results/.../build.log` (adapter only writes log on process exit)

3. **Side effects**
   - Orphan **`vite dev --port 3000`** from Luna app cwd still listening — competes with compare site / confuses smoke
   - Worker pid observed with **PPID = long-lived prime-agent daemon (45061 from earlier morning)** — suggests incomplete isolation from pre-existing Prime workers even when INTERNAL env stripped from the direct child

4. **Session store**
   - Run used `--no-session`; no clean dedicated session transcript for the bench child
   - Harder post-mortem of last tool call / whether agent awaited input

## Root cause (working theory)

**Primary (agent/harness behavior):**  
After implementing and building the app, the Prime Agent process **never exited print/autonomous mode**. It left a long-lived `vite dev` and idled. From the bench’s POV the build phase never completed → no score, no Side B start.

**Contributing (bench observability):**  
- `build.log` only flushed at exit → hang looks like “still running” with empty logs  
- No heartbeat / file-mtime watchdog in the runner  
- `--no-session` removes an easy forensic transcript  

**Contributing (environment coupling):**  
- Worker process parented under an older daemon PID suggests residual coupling to already-running Prime infrastructure on the machine  
- Port **3000** collision with `apps/web` compare site when agent starts `vite dev`

**Not blamed:** wrong model selection; user editing `apps/*` mid-run.

## Product state at hang (partial credit context)

Despite hang, the tree included:

- Better Auth + Drizzle schema/server
- Dashboard / pulses / settings components
- Dockerfile + docker-compose
- Production `dist/` build output
- tests config

So this is closer to **“built then failed to terminate/validate”** than **“did nothing.”**

## Scoring recommendation

| Field | Value |
|---|---|
| status | `timeout` |
| tier for fair-fight table | **incomplete / D for completion** or separate **hang** flag |
| Do not treat as clean Prime win/loss vs Codex | Codex never started |
| Optional: score partial structural only | yes, if we run offline `score --skip-runtime` later |

## Bench improvements (action items)

1. **Watchdog:** if `status=running` and app mtime idle > N minutes (e.g. 20) while CPU ~0 → mark hang, kill, document  
2. **Streaming logs:** tee prime-agent stdout to `build.log` while running (not only on exit)  
3. **Session on for bench runs:** drop `--no-session` or use `--session-dir results/<slug>/session` for forensics  
4. **Kill orphans on finalize:** pkill vite/compose for that app cwd when phase ends or times out  
5. **Port policy:** prompt/bench should prefer `PORT=3010+` for agent dev servers to avoid clashing with compare site `:3000`  
6. **Deeper daemon isolation:** verify children are not attaching to pre-existing `prime-agent` supervisors (PPID audit in adapter)  
7. **Hang taxonomy in result.json:** `failureClass: agent_hang | adapter_bug | infra | timeout_budget`

## Campaign impact

- Side A Prime Luna: **timeout / hang** (this report)  
- Side B Codex Luna: **not started** (blocked on A)  
- Fair Fight #2 cannot conclude head-to-head until A is re-run with hang mitigations **or** B is run independently with A marked incomplete
