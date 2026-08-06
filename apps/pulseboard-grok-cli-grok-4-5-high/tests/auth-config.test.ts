import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

describe("auth configuration surface", () => {
  it("wires email/password and drizzle adapter in auth module source", () => {
    const src = readFileSync(
      join(import.meta.dirname, "../src/lib/auth.ts"),
      "utf8",
    )
    expect(src).toContain("emailAndPassword")
    expect(src).toContain("drizzleAdapter")
    expect(src).toContain("tanstackStartCookies")
    expect(src).toContain('provider: "pg"')
  })

  it("exposes auth API catch-all route", () => {
    const src = readFileSync(
      join(import.meta.dirname, "../src/routes/api/auth/$.ts"),
      "utf8",
    )
    expect(src).toContain("auth.handler")
    expect(src).toContain('"/api/auth/$"')
  })

  it("documents required env vars without committing secrets", () => {
    const envExample = readFileSync(
      join(import.meta.dirname, "../.env.example"),
      "utf8",
    )
    expect(envExample).toContain("DATABASE_URL=")
    expect(envExample).toContain("BETTER_AUTH_SECRET=")
    expect(envExample).toContain("BETTER_AUTH_URL=")
    expect(envExample).not.toMatch(/sk_live|password123|supersecret/i)
  })
})
