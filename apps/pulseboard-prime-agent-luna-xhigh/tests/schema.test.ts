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
  it("exposes required auth tables", () => {
    expect(user).toBeDefined()
    expect(session).toBeDefined()
    expect(account).toBeDefined()
    expect(verification).toBeDefined()
  })

  it("exposes product tables", () => {
    expect(workspace).toBeDefined()
    expect(workspaceMember).toBeDefined()
    expect(pulse).toBeDefined()
  })

  it("defines mood and role enums", () => {
    expect(pulseMoodEnum.enumValues).toEqual(["great", "ok", "blocked"])
    expect(workspaceMemberRoleEnum.enumValues).toEqual([
      "owner",
      "admin",
      "member",
    ])
  })

  it("maps expected columns on pulse", () => {
    const cols = Object.keys(pulse)
    expect(cols).toEqual(
      expect.arrayContaining([
        "id",
        "workspaceId",
        "authorId",
        "mood",
        "body",
        "createdAt",
      ])
    )
  })
})
