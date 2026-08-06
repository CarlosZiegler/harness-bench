import { describe, expect, it } from "vitest"
import { z } from "zod"
import { createId, slugify } from "../src/lib/ids"
import { formatRelativeTime, startOfDay, startOfWeek } from "../src/lib/format"

const createPulseSchema = z.object({
  mood: z.enum(["great", "ok", "blocked"]),
  body: z.string().trim().min(1).max(500),
})

describe("ids helpers", () => {
  it("creates unique ids with optional prefix", () => {
    const a = createId("ws")
    const b = createId("ws")
    expect(a).toMatch(/^ws_/)
    expect(a).not.toEqual(b)
  })

  it("slugifies names", () => {
    expect(slugify("Jordan Lee's Workspace")).toBe("jordan-lee-s-workspace")
    expect(slugify("  Hello!!! World  ")).toBe("hello-world")
  })
})

describe("format helpers", () => {
  it("formats relative times", () => {
    expect(formatRelativeTime(new Date())).toBe("just now")
  })

  it("computes start of day/week", () => {
    const day = startOfDay(new Date("2024-06-12T15:30:00"))
    expect(day.getHours()).toBe(0)
    expect(day.getMinutes()).toBe(0)

    const week = startOfWeek(new Date("2024-06-12T15:30:00")) // Wednesday
    expect(week.getDay()).toBe(1)
  })
})

describe("pulse validation", () => {
  it("accepts valid pulse payloads", () => {
    const parsed = createPulseSchema.parse({
      mood: "great",
      body: " Shipping the invite flow ",
    })
    expect(parsed).toEqual({ mood: "great", body: "Shipping the invite flow" })
  })

  it("rejects invalid moods and empty bodies", () => {
    expect(() => createPulseSchema.parse({ mood: "meh", body: "hi" })).toThrow()
    expect(() => createPulseSchema.parse({ mood: "ok", body: "   " })).toThrow()
  })
})
