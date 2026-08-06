# Hang & incomplete-run taxonomy

When a fair-fight side does not finish, **document it**. Do not only delete the run.

| Class | Meaning | Counts as |
|---|---|---|
| `agent_hang` | Process alive/idle or stuck in tools; no exit; app may be partial | Incomplete — analyze why |
| `adapter_bug` | Our CLI flags/env wrong (e.g. daemon env leak, bad `--flag=value`) | Invalid — fix bench, re-run |
| `timeout_budget` | Hit configured wall clock while still working | Incomplete / timeout |
| `infra` | Network, disk, docker daemon host issues | Infra — retry |
| `user_intervention` | Human edited app mid-run | Invalid for fair fight |

## Required fields in `result.json` / `HANG.md`

- controls (model, effort, harness) — prove not wrong model  
- evidence (mtime idle, CPU, ps/stack, orphan processes)  
- last known good artifacts  
- classification + bench follow-up  

## Watchdogs (to implement)

- idle app mtime > 20–30 min while status=running → probe CPU → hang  
- stream agent stdout to `build.log` continuously  
- on finalize/timeout: kill vite/docker for that app cwd  
