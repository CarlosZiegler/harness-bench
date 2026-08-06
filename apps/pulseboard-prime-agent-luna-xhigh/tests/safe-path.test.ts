import { describe, expect, it } from "vitest"
import { safeJoin } from "@/lib/safe-path"

describe("safe static asset paths", () => {
  it("rejects traversal and accepts paths inside the client directory", () => {
    expect(safeJoin("/app/dist/client", "/assets/app.js")).toBe(
      "/app/dist/client/assets/app.js"
    )
    expect(safeJoin("/app/dist/client", "/../server/server.js")).toBeNull()
    expect(safeJoin("/app/dist/client", "/%2e%2e/server/server.js")).toBeNull()
    expect(safeJoin("/app/dist/client", "/%E0%A4%A")).toBeNull()
  })
})
