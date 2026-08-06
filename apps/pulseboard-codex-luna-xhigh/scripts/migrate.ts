import { readFile } from "node:fs/promises"

import postgres from "postgres"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set before running migrations.")
}

const sql = postgres(databaseUrl, {
  connect_timeout: 10,
})

try {
  const migration = await readFile(
    new URL("../drizzle/0000_pulseboard.sql", import.meta.url),
    "utf8"
  )

  for (const statement of migration
    .split("--> statement-breakpoint")
    .map((part) => part.trim())
    .filter(Boolean)) {
    await sql.unsafe(statement)
  }
} finally {
  await sql.end({ timeout: 5 })
}
