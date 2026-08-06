import { describe, expect, it } from "vitest"
import { createId, slugify } from "../src/lib/id"
import { MOODS, formatRelativeTime, moodConfig } from "../src/lib/mood"

describe("id helpers", () => {
  it("creates unique ids with optional prefix", () => {
    const a = createId("ws")
    const b = createId("ws")
    expect(a).toMatch(/^ws_/)
    expect(a).not.toEqual(b)
    expect(createId().length).toBeGreaterThan(10)
  })

  it("slugifies names", () => {
    expect(slugify("Alex Rivera")).toBe("alex-rivera")
    expect(slugify("  Hello!!! World  ")).toBe("hello-world")
    expect(slugify("###")).toBe("")
  })
})

describe("mood helpers", () => {
  it("covers all moods", () => {
    expect(MOODS).toEqual(["great", "ok", "blocked"])
    for (const m of MOODS) {
      expect(moodConfig[m].label).toBeTruthy()
      expect(moodConfig[m].emoji).toBeTruthy()
    }
  })

  it("formats relative times", () => {
    const now = new Date().toISOString()
    expect(formatRelativeTime(now)).toBe("just now")

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    expect(formatRelativeTime(hourAgo)).toBe("1h ago")
  })
})
