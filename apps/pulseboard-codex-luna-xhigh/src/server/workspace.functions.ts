import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { and, eq } from "drizzle-orm"

import { createWorkspaceSlug, workspaceNameSchema } from "@/lib/pulseboard"

async function getAuthContext() {
  const [{ auth }, { db }, schema] = await Promise.all([
    import("@/lib/auth"),
    import("@/db"),
    import("@/db/schema"),
  ])
  const session = await auth.api.getSession({ headers: getRequestHeaders() })

  if (!session) throw new Error("You need to be signed in to continue.")
  return { db, schema, user: session.user }
}

export const ensureWorkspace = createServerFn({ method: "POST" }).handler(
  async () => {
    const { db, schema, user } = await getAuthContext()
    const existing = await db
      .select({ workspace: schema.workspace })
      .from(schema.workspaceMember)
      .innerJoin(
        schema.workspace,
        eq(schema.workspaceMember.workspaceId, schema.workspace.id)
      )
      .where(eq(schema.workspaceMember.userId, user.id))
      .limit(1)

    if (existing.length > 0) return existing[0].workspace

    const [created] = await db.transaction(async (tx) => {
      const workspaceId = crypto.randomUUID()
      const [newWorkspace] = await tx
        .insert(schema.workspace)
        .values({
          id: workspaceId,
          name: `${user.name.split(" ")[0] ?? "My"}'s space`,
          slug: `${createWorkspaceSlug(user.name)}-${workspaceId.slice(0, 6)}`,
        })
        .returning()

      await tx.insert(schema.workspaceMember).values({
        workspaceId,
        userId: user.id,
        role: "owner",
      })

      return [newWorkspace]
    })

    return created
  }
)

export const renameWorkspace = createServerFn({ method: "POST" })
  .validator((input: unknown) => workspaceNameSchema.parse(input))
  .handler(async ({ data: name }) => {
    const { db, schema, user } = await getAuthContext()
    const membership = await db
      .select({
        workspaceId: schema.workspaceMember.workspaceId,
        role: schema.workspaceMember.role,
      })
      .from(schema.workspaceMember)
      .where(
        and(
          eq(schema.workspaceMember.userId, user.id),
          eq(schema.workspaceMember.role, "owner")
        )
      )
      .limit(1)

    const workspaceId = membership[0]?.workspaceId
    if (!workspaceId)
      throw new Error("Only workspace owners can rename this space.")

    const [updated] = await db
      .update(schema.workspace)
      .set({
        name,
        slug: `${createWorkspaceSlug(name)}-${workspaceId.slice(0, 6)}`,
      })
      .where(eq(schema.workspace.id, workspaceId))
      .returning()

    return updated
  })
