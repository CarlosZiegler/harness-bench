# Phase 1 — Build: Pulseboard

You are an autonomous coding agent. Build the full application described below **inside the current working directory only**.

- **App name**: `{{APP_NAME}}`
- **Working directory**: `{{APP_DIR}}`
- **Models for this run**: `{{MODELS}}`
- **Task**: `{{TASK_ID}}` — {{TASK_TITLE}}

## Non-negotiable rules

1. Do **not** ask for confirmation. Plan briefly, then implement until done.
2. Stay inside the current workspace. Do not create a sibling app directory.
3. Prefer tools available in this runtime. Recover from failures and continue.
4. **No secrets** in git-tracked files. Use `.env.example` with placeholders only.
5. Stack is fixed (do not substitute Next.js or Prisma):
   - **TanStack Start**
   - **Drizzle ORM + PostgreSQL**
   - **Better Auth** (email/password is enough)
   - **shadcn/ui** (+ **re-ui**-style polished patterns where helpful)
   - **Tailwind CSS**
   - **Dockerfile + docker-compose.yml** (app + postgres)

## Scaffold

If the directory is empty or only has a handoff/prompt file, scaffold first:

```bash
bunx --bun shadcn@latest init --preset b0 --template start --pointer --yes --force -n app
```

If scaffold already happened, do not re-init — extend the existing app.

## Product requirements (must ship)

**Pulseboard** is a minimal multi-user "team pulse" product:

### Auth
- Sign up / sign in / sign out with Better Auth (email + password)
- Session-aware UI (show user, hide app when logged out)
- Protect app routes; guests go to `/sign-in`

### Data (Postgres + Drizzle)
Minimum schema concepts:
- `user` (from Better Auth)
- `workspace` (id, name, slug, createdAt)
- `workspace_member` (workspaceId, userId, role)
- `pulse` (id, workspaceId, authorId, mood enum, body text, createdAt)

On first login, auto-create a personal workspace if none exists.

### UX / pages
1. Marketing/landing (simple, polished)
2. Sign-in / Sign-up
3. App shell (sidebar or top nav) with:
   - Dashboard
   - Pulses (list + composer)
   - Workspace settings (rename is enough)
4. Dashboard:
   - Summary cards (members count, pulses today, pulses this week)
   - Recent pulses feed
   - Empty / loading / error states that look intentional
5. Pulse composer: mood (e.g. great / ok / blocked) + short note; submit creates row and updates UI
6. Responsive layout + dark mode support

### Frontend quality bar (Arena WebDev-inspired)
Ship UI that looks **designed**, not scaffold-default:
- Consistent spacing, typography, and card hierarchy
- shadcn components composed into real sections (not one giant page file)
- Skeleton loaders and empty states
- Accessible labels on forms; keyboard-usable dialogs/menus
- No lorem-only pages; copy should match the product

### DevOps
- `Dockerfile` that builds and runs the app
- `docker-compose.yml` with `app` + `postgres` services, env wiring, port mapping
- `.env.example` documenting `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, etc.
- README: what it is, env setup, `bun install`, drizzle migrate/push, `bun dev`, docker compose up

### Quality
- TypeScript strict; app typechecks
- A few tests (auth helpers, drizzle schema smoke, or route handler tests)
- No committed `.env` with real values

## Implementation order (suggested)

1. Scaffold + baseline UI shell
2. Docker compose postgres + Drizzle schema + Better Auth
3. Auth pages + session protection
4. Workspace bootstrap
5. Pulses CRUD + dashboard
6. Polish UI states
7. Dockerfile/compose/README/tests

## Definition of done (phase 1)

- [ ] App runs conceptually end-to-end in code (auth → workspace → pulse → dashboard)
- [ ] Compose + Dockerfile present
- [ ] README + `.env.example` present
- [ ] Tests present
- [ ] No secrets committed

This is phase 1 of 2. Focus on implementation. Phase 2 will force runtime validation.
