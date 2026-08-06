import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

describe("auth configuration smoke", () => {
  it("enables email/password and tanstack cookie plugin", () => {
    const src = readFileSync(resolve("src/lib/auth.ts"), "utf8")
    expect(src).toContain("emailAndPassword")
    expect(src).toContain("enabled: true")
    expect(src).toContain("tanstackStartCookies")
    expect(src).toContain('provider: "pg"')
  })

  it("requires a real production secret and bypasses stale session cookie cache", () => {
    const auth = readFileSync(resolve("src/lib/auth.ts"), "utf8")
    const session = readFileSync(
      resolve("src/server/session.server.ts"),
      "utf8"
    )
    expect(auth).toContain("BETTER_AUTH_SECRET")
    expect(auth).toContain('process.env.NODE_ENV === "production"')
    expect(auth).toContain("authSecret.length < 32")
    expect(auth).toContain("BETTER_AUTH_URL must use HTTPS in production")
    expect(auth).toContain("disableIpTracking: true")
    expect(session).toContain("disableCookieCache: true")
  })

  it("mounts better-auth handler on splat route", () => {
    const src = readFileSync(resolve("src/routes/api/auth/$.ts"), "utf8")
    expect(src).toContain("auth.handler")
    expect(src).toContain('"/api/auth/$"')
  })
})
