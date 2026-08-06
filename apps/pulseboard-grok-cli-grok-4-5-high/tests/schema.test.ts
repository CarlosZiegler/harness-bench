import { describe, expect, it } from "vitest"
import {
  account,
  pulse,
  pulseMoodEnum,
  session,
  user,
  verification,
  workspace,
  workspaceMember,
  workspaceMemberRoleEnum,
} from "../src/db/schema"

describe("drizzle schema smoke", () => {
  it("defines Better Auth core tables", () => {
    expect(user).toBeDefined()
    expect(session).toBeDefined()
    expect(account).toBeDefined()
    expect(verification).toBeDefined()
  })

  it("defines domain tables", () => {
    expect(workspace).toBeDefined()
    expect(workspaceMember).toBeDefined()
    expect(pulse).toBeDefined()
  })

  it("exposes expected enum values", () => {
    expect(pulseMoodEnum.enumValues).toEqual(["great", "ok", "blocked"])
    expect(workspaceMemberRoleEnum.enumValues).toEqual([
      "owner",
      "admin",
      "member",
    ])
  })

  it("has required columns on pulse", () => {
    const cols = Object.keys(pulse)
    expect(cols).toEqual(
      expect.arrayContaining([
        "id",
        "workspaceId",
        "authorId",
        "mood",
        "body",
        "createdAt",
      ]),
    )
  })

  it("has required columns on workspace", () => {
    const cols = Object.keys(workspace)
    expect(cols).toEqual(
      expect.arrayContaining(["id", "name", "slug", "createdAt"]),
    )
  })
})
