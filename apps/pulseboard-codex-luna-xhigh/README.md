# Pulseboard

Pulseboard is a minimal team pulse dashboard for sharing small, useful signals: a mood, a short note, and a clearer read on the week.

## Stack

- TanStack Start + TanStack Router
- React + TypeScript + Tailwind CSS + shadcn-style components
- Better Auth with email/password sessions
- Drizzle ORM + PostgreSQL
- Docker Compose for the app and database

## Local setup

1. Copy `.env.example` to `.env` and set a real `BETTER_AUTH_SECRET` (at least 32 characters).
2. Install dependencies:

   ```bash
   bun install
   ```

3. Start PostgreSQL, or point `DATABASE_URL` at an existing database. With Docker:

   ```bash
   docker compose up -d postgres
   ```

4. Apply the Drizzle schema. `push` is convenient for local development; generate/apply migrations when you want a migration history:

   ```bash
   bunx drizzle-kit push
   # or: bunx drizzle-kit generate && bunx drizzle-kit migrate
   ```

5. Start the app:

   ```bash
   bun dev
   ```

Open `http://localhost:3000`, create an account, and Pulseboard creates a personal workspace on first access to the app.

## Docker

The Compose file starts PostgreSQL with a persistent volume, applies the checked-in schema on app startup, and runs the production TanStack Start app on port 3000:

```bash
cp .env.example .env
# Set POSTGRES_PASSWORD, COMPOSE_DATABASE_URL, and BETTER_AUTH_SECRET in .env.
docker compose up --build
```

Compose reads database credentials and the Better Auth secret from `.env`; the checked-in example contains placeholders only. Replace them before deploying.

## Quality commands

```bash
bun run typecheck
bun test
bun run lint
bun run build
```

## Structure

- `src/db/schema.ts` — Better Auth and Pulseboard Drizzle tables
- `src/lib/auth.ts` — server-side Better Auth instance
- `src/server/*.functions.ts` — authenticated TanStack server functions
- `src/routes/` — landing, auth, protected app, and auth API route
- `src/components/pulseboard/` — app shell, composer, feed cards, and states
- `drizzle/` — initial PostgreSQL migration
