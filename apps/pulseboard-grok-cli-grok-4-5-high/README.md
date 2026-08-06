# Pulseboard

A minimal multi-user **team pulse** dashboard. Share how work is going (great / ok / blocked) with a short note, and keep the team aligned without heavy process.

Built with **TanStack Start**, **Drizzle ORM + PostgreSQL**, **Better Auth**, **shadcn/ui**, and **Tailwind CSS**.

## Features

- Email/password auth (sign up, sign in, sign out)
- Personal workspace created automatically on first login
- Dashboard with member count, pulses today, pulses this week
- Pulse composer + feed
- Workspace rename in settings
- Responsive layout and dark mode

## Prerequisites

- [Bun](https://bun.sh) 1.2+
- PostgreSQL 16+ (or Docker)

## Quick start (local)

### 1. Install

```bash
bun install
```

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env` if needed. Defaults assume Postgres on `localhost:5432`:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/pulseboard
BETTER_AUTH_SECRET=change-me-to-a-long-random-string-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3000
```

### 3. Database

Start Postgres (example with Docker Compose — DB only):

```bash
docker compose up -d postgres
```

Push the schema:

```bash
bun run db:push
```

Or generate + migrate:

```bash
bun run db:generate
bun run db:migrate
```

### 4. Dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `bun dev` | Vite dev server on port 3000 |
| `bun run build` | Production build |
| `bun run start` | Run production server |
| `bun run typecheck` | TypeScript check |
| `bun test` | Run Vitest suite |
| `bun run db:push` | Push Drizzle schema to DB |
| `bun run db:generate` | Generate SQL migrations |
| `bun run db:migrate` | Apply migrations |
| `bun run db:studio` | Drizzle Studio |

## Docker (app + Postgres)

```bash
# Optional: set secrets
export BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
export BETTER_AUTH_URL=http://localhost:3000

docker compose up --build
```

The app listens on port **3000**; Postgres on **5432**.

> After the first container start, apply schema if you have not already (from the host, against the compose Postgres):
>
> ```bash
> DATABASE_URL=postgres://postgres:postgres@localhost:5432/pulseboard bun run db:push
> ```

## Project layout

```
src/
  components/     # UI + app shell, pulse feed, composer
  db/             # Drizzle client + schema
  lib/            # auth, workspace helpers
  routes/         # TanStack file routes + API auth handler
  server/         # createServerFn session/data helpers
drizzle/          # SQL migrations (generated)
```

## Auth notes

- Better Auth handler: `/api/auth/*`
- Protected app routes under `/app/*` redirect guests to `/sign-in`
- Session cookies are set via the TanStack Start cookie plugin

## Tests

```bash
bun test
```

Includes schema smoke tests and pure helper unit tests (slugify / mood config).

## License

Private / harness benchmark sample.
