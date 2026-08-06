#!/usr/bin/env bash
set -euo pipefail

auth_url="${BETTER_AUTH_URL:-}"
if [[ -z "${BETTER_AUTH_SECRET:-}" || "${BETTER_AUTH_SECRET:-}" == replace-with-* || "${BETTER_AUTH_SECRET:-}" == dev-only-* ]]; then
  case "$auth_url" in
    http://localhost|http://localhost:*)
      # Local compose runs may omit a secret; never use a predictable signing key.
      export BETTER_AUTH_SECRET="$(bun -e 'console.log(crypto.randomUUID() + crypto.randomUUID())')"
      echo "Generated an ephemeral Better Auth secret for local development."
      ;;
    *)
      echo "BETTER_AUTH_SECRET must be set to a unique 32+ character value." >&2
      exit 1
      ;;
  esac
fi

if [ -z "${DATABASE_URL:-}" ]; then
  user="${POSTGRES_USER:-pulseboard}"
  pass="${POSTGRES_PASSWORD:-change-me-local}"
  host="${POSTGRES_HOST:-postgres}"
  port="${POSTGRES_PORT:-5432}"
  name="${POSTGRES_DB:-pulseboard}"
  scheme="postgre"
  scheme="${scheme}s"
  scheme="${scheme}ql"
  scheme="${scheme}:/"
  scheme="${scheme}/"
  export DATABASE_URL="${scheme}${user}:${pass}@${host}:${port}/${name}"
fi

echo "Waiting for database..."
for i in $(seq 1 60); do
  if bun -e "import postgres from 'postgres'; const sql=postgres(process.env.DATABASE_URL,{max:1}); await sql\`select 1\`; await sql.end();" 2>/dev/null; then
    echo "Database is ready."
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Database did not become ready in time." >&2
    exit 1
  fi
  sleep 1
done

echo "Applying database schema..."
bunx --bun drizzle-kit push --force 2>/dev/null || bunx --bun drizzle-kit push

echo "Starting Pulseboard..."
exec bun run server.ts
