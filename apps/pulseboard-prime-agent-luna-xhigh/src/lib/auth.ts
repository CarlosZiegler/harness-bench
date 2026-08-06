import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { db } from "@/db"
import * as schema from "@/db/schema"

const isProduction = process.env.NODE_ENV === "production"
const authURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3110"
if (isProduction && !process.env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL must be set in production")
}
const isLocalOrigin = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(
  authURL
)
if (isProduction && !authURL.startsWith("https://") && !isLocalOrigin) {
  throw new Error("BETTER_AUTH_URL must use HTTPS in production")
}

const authSecret = process.env.BETTER_AUTH_SECRET
const trustedProxies = (process.env.TRUSTED_PROXIES ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
const ipAddressConfig = trustedProxies.length
  ? { ipAddressHeaders: ["x-forwarded-for"], trustedProxies }
  : { disableIpTracking: true }
const hasInsecureSecret =
  !authSecret ||
  authSecret.length < 32 ||
  /(?:change[-_ ]?me|replace[-_ ]?with|local[-_ ]development|dev[-_ ]only)/i.test(
    authSecret
  )
if (isProduction && hasInsecureSecret) {
  throw new Error(
    "BETTER_AUTH_SECRET must be a unique 32+ character secret in production"
  )
}

export const auth = betterAuth({
  appName: "Pulseboard",
  baseURL: authURL,
  secret: authSecret ?? "local-development-secret-change-me-32chars",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => {
          const name = newUser.name.trim()
          if (name.length < 1 || name.length > 100) return false
          return { data: { ...newUser, name } }
        },
      },
      update: {
        before: async (updatedUser) => {
          if (updatedUser.name === undefined) return
          const name = updatedUser.name.trim()
          if (name.length < 1 || name.length > 100) return false
          return { data: { ...updatedUser, name } }
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  trustedOrigins: [authURL, process.env.VITE_APP_URL ?? authURL].filter(
    Boolean
  ),
  rateLimit: {
    enabled: true,
  },
  advanced: {
    useSecureCookies: isProduction && authURL.startsWith("https://"),
    ipAddress: ipAddressConfig,
  },
  plugins: [tanstackStartCookies()],
})

export type Session = typeof auth.$Infer.Session
export type AuthUser = Session["user"]
