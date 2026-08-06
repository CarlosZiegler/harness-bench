import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://postgres:postgres@localhost:5432/pulseboard"

// Disable prefetch for serverless-friendly connections; fine for local too.
const client = postgres(connectionString, { max: 10 })

export const db = drizzle(client, { schema })
export type Database = typeof db
