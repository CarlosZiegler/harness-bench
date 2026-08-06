import { describe, expect, it } from "bun:test"
import { slugify } from "./src/lib/ids"

describe("Pulseboard smoke", () => {
  it("creates workspace-safe slugs", () => {
    expect(slugify("Pulseboard Team")).toBe("pulseboard-team")
  })
})
