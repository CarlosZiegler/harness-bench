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

  it("mounts better-auth handler on splat route", () => {
    const src = readFileSync(resolve("src/routes/api/auth/$.ts"), "utf8")
    expect(src).toContain("auth.handler")
    expect(src).toContain('"/api/auth/$"')
  })
})
