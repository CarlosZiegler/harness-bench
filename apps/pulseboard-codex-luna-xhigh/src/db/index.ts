import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"

import * as schema from "@/db/schema"

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://pulseboard:pulseboard@localhost:5432/pulseboard"

export const sql = postgres(connectionString, {
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
})

export const db = drizzle(sql, { schema })
