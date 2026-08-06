import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

describe("production container configuration", () => {
  it("builds the SSR bundle in production mode without embedding auth secrets", () => {
    const dockerfile = readFileSync(resolve("Dockerfile"), "utf8")
    expect(dockerfile).toContain("ENV NODE_ENV=production")
    expect(dockerfile).not.toContain("ENV BETTER_AUTH_SECRET=")
    expect(dockerfile).toContain("USER bun")
  })
})
