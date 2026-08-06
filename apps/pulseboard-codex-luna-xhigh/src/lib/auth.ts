import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { betterAuth } from "better-auth"
import { tanstackStartCookies } from "better-auth/tanstack-start"

import { db } from "@/db"
import * as schema from "@/db/schema"

export const auth = betterAuth({
  appName: "Pulseboard",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
  plugins: [tanstackStartCookies()],
})
