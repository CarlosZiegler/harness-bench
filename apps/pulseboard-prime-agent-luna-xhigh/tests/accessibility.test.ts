import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

describe("app navigation accessibility", () => {
  it("labels navigation landmarks for assistive technology", () => {
    const source = readFileSync(
      resolve("src/components/layout/app-sidebar.tsx"),
      "utf8"
    )
    expect(source).toContain('aria-label="Primary navigation"')
    expect(source).toContain('aria-label="Mobile navigation"')
  })
})
