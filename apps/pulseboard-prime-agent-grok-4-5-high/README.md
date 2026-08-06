# Pulseboard

A minimal multi-user **team pulse** dashboard. Teammates post a quick mood + note so everyone can see energy and blockers without another standup.

Built with:

- **TanStack Start** (React + Vite)
- **Drizzle ORM** + **PostgreSQL**
- **Better Auth** (email / password)
- **shadcn/ui** + Tailwind CSS

## Features

- Sign up / sign in / sign out with session-aware UI
- Protected `/app` routes (guests redirect to `/sign-in`)
- Auto-created personal workspace on first login
- Dashboard summary cards + recent pulse feed
- Pulse composer (`great` / `ok` / `blocked`)
- Workspace settings (rename + member list)
- Responsive layout and dark mode

## Quick start (local)

### 1. Install

```bash
bun install
```

### 2. Environment

```bash
cp .env.example .env
```

Generate a secret:

```bash
openssl rand -base64 32
```

Set at least:

| Variable | Example |
|---|---|
| `DATABASE_URL` | `set via DATABASE_URL or POSTGRES_* (set POSTGRES_USER / POSTGRES_PASSWORD)` |
| `BETTER_AUTH_SECRET` | long random string (32+ chars) |
| `BETTER_AUTH_URL` | `http://localhost:3000` |
| `VITE_APP_URL` | `http://localhost:3000` |

### 3. Database

Start Postgres (Docker):

```bash
docker compose up -d postgres
```

Push the schema:

```bash
bun run db:push
```

### 4. Dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `bun dev` | Start Vite dev server on port 3000 |
| `bun run build` | Production build |
| `bun run start` | Run production server (`server.ts` serves SSR + static assets) |
| `bun run typecheck` | TypeScript check |
| `bun test` | Run Vitest |
| `bun run db:push` | Push Drizzle schema to Postgres |
| `bun run db:generate` | Generate SQL migrations |
| `bun run db:studio` | Open Drizzle Studio |

## Docker (app + Postgres)

```bash
docker compose up --build
```

This starts:

- `postgres` on `localhost:5432`
- `app` on `localhost:3000`

The container entrypoint waits for Postgres, runs `drizzle-kit push`, then starts the server.

## Project layout

```
src/
  components/     # UI + product components
  db/             # Drizzle schema + client
  lib/            # auth, helpers
  routes/         # TanStack file routes + API handlers
  server/         # server functions (workspace, session, pulses)
```

## Auth notes

Better Auth is mounted at `/api/auth/$` and uses the Drizzle adapter against the `user`, `session`, `account`, and `verification` tables. App data lives in `workspace`, `workspace_member`, and `pulse`.

## Tests

```bash
bun test
```

Covers schema smoke checks, ID/slug helpers, and mood validation.

## License

MIT
