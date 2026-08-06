# Attempts — pulseboard-prime-agent-luna-xhigh

| # | Date | Outcome | Why |
|---|---|---|---|
| 1 | 2026-08-06 | **timeout / agent_hang** | After writing app+dist, `prime-agent -p` idled ~43m (0% CPU), left `vite dev :3000`, never exited; no streaming build.log. Controls OK (luna@xhigh). See `attempt-1-hang/HANG.md`. |
| 2 | 2026-08-06 | *(in progress / see parent result.json)* | Re-run after bench mitigations: stream logs, session-dir, process-group kill, idle-mtime watchdog, no long-lived vite in prompt contract, orphan cleanup. |

