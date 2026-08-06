import { describe, expect, it } from "vitest"

import { createWorkspaceSlug, pulseBodySchema } from "@/lib/pulseboard"

describe("Pulseboard domain helpers", () => {
  it("creates stable, readable workspace slugs", () => {
    expect(createWorkspaceSlug("  Studio / North  ")).toBe("studio-north")
    expect(createWorkspaceSlug("Team & Culture")).toBe("team-culture")
  })

  it("keeps pulse notes short enough for a quick team read", () => {
    expect(
      pulseBodySchema.safeParse("Shipping the new invite flow today").success
    ).toBe(true)
    expect(pulseBodySchema.safeParse("").success).toBe(false)
    expect(pulseBodySchema.safeParse("x".repeat(281)).success).toBe(false)
  })
})
