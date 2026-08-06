# Phase 1 — Build: Launchpad

You are an autonomous coding agent. Build the full application **inside the current working directory only**.

- **App name**: `{{APP_NAME}}`
- **Working directory**: `{{APP_DIR}}`
- **Models**: `{{MODELS}}`
- **Task**: `{{TASK_ID}}` — {{TASK_TITLE}}

## Rules

1. No confirmation questions — plan briefly, then implement fully.
2. Stay in this workspace.
3. Stack is fixed: **TanStack Start + Drizzle + Postgres + Better Auth + shadcn/re-ui + Docker Compose**.
4. No real secrets in the repo. Provide `.env.example` only.

## Scaffold

If needed:

```bash
bunx --bun shadcn@latest init --preset b0 --template start --pointer --yes --force -n app
```

## Product: Launchpad (feature-request board)

### Must have
- Better Auth email/password; protected routes
- Drizzle schema: user, project, feature_request, vote
- User can create projects and post feature requests
- Requests have status: `backlog | next | done`
- Upvote (unique per user/request); show vote counts
- Board UI (columns or tabs) with polished empty/loading states
- Landing + app shell + dark mode + responsive
- Dockerfile + docker-compose (app + postgres)
- README + `.env.example` + some tests

### Frontend bar
Designed UI (not stock template): composition with shadcn, clear hierarchy, a11y basics, intentional empty states.

### Forbidden
Next.js, Prisma-only substitutions, leaving scaffold placeholder as the product.

## Definition of done
Auth → project → request → vote works in code; docker assets present; README present; no secrets.
