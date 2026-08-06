# Phase 2 — Validate: Pulseboard

Continue in the **existing** project at `{{APP_DIR}}` (app `{{APP_NAME}}`).
Do **not** regenerate the app from scratch. Do **not** ask for confirmation.

## Goals

Make the current codebase actually run:

1. Install deps
2. Typecheck (fix if needed)
3. Production build (fix if needed)
4. `docker build` succeeds
5. `docker compose up --build` brings app + postgres up (fix if needed)
6. Smoke: at least one HTTP path responds (health or home)

## Rules

- Use env vars; keep secrets out of the repo
- Prefer fixing the existing code over rewrites
- If compose needs a healthcheck or migrate-on-start, add it
- Stop only when checks pass or you hit a hard external blocker

## Report back

When finished, leave a short `BENCH_VALIDATE.md` in the app root listing:
- commands run
- pass/fail per check
- remaining known issues
