import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { and, asc, count, desc, eq, gte } from "drizzle-orm"

import type { db as database } from "@/db"
import type * as schemaModule from "@/db/schema"
import { pulseInputSchema } from "@/lib/pulseboard"
import type { DashboardSnapshot } from "@/db/schema"

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

async function getWorkspaceId(
  db: typeof database,
  schema: typeof schemaModule,
  userId: string
) {
  const membership = await db
    .select({ workspaceId: schema.workspaceMember.workspaceId })
    .from(schema.workspaceMember)
    .where(eq(schema.workspaceMember.userId, userId))
    .limit(1)

  if (!membership[0])
    throw new Error("Your workspace is still being prepared. Please refresh.")
  return membership[0].workspaceId
}

export const getDashboard = createServerFn({ method: "GET" }).handler(
  async (): Promise<DashboardSnapshot> => {
    const { db, schema, user } = await getAuthContext()
    const workspaceId = await getWorkspaceId(db, schema, user.id)
    const workspaceRows = await db
      .select()
      .from(schema.workspace)
      .where(eq(schema.workspace.id, workspaceId))
      .limit(1)
    const currentWorkspace = workspaceRows[0]

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(
      startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7)
    )

    const [memberRows, todayRows, weekRows, recentRows] = await Promise.all([
      db
        .select({ value: count() })
        .from(schema.workspaceMember)
        .where(eq(schema.workspaceMember.workspaceId, workspaceId)),
      db
        .select({ value: count() })
        .from(schema.pulse)
        .where(
          and(
            eq(schema.pulse.workspaceId, workspaceId),
            gte(schema.pulse.createdAt, startOfToday)
          )
        ),
      db
        .select({ value: count() })
        .from(schema.pulse)
        .where(
          and(
            eq(schema.pulse.workspaceId, workspaceId),
            gte(schema.pulse.createdAt, startOfWeek)
          )
        ),
      db
        .select({
          pulse: schema.pulse,
          author: { name: schema.user.name, image: schema.user.image },
        })
        .from(schema.pulse)
        .innerJoin(schema.user, eq(schema.pulse.authorId, schema.user.id))
        .where(eq(schema.pulse.workspaceId, workspaceId))
        .orderBy(desc(schema.pulse.createdAt))
        .limit(8),
    ])

    return {
      workspace: currentWorkspace,
      memberCount: Number(memberRows[0]?.value ?? 0),
      pulsesToday: Number(todayRows[0]?.value ?? 0),
      pulsesThisWeek: Number(weekRows[0]?.value ?? 0),
      recentPulses: recentRows.map(({ pulse, author }) => ({
        ...pulse,
        author,
      })),
      currentUser: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
      },
    }
  }
)

export const listPulses = createServerFn({ method: "GET" }).handler(
  async () => {
    const { db, schema, user } = await getAuthContext()
    const workspaceId = await getWorkspaceId(db, schema, user.id)
    const rows = await db
      .select({
        pulse: schema.pulse,
        author: { name: schema.user.name, image: schema.user.image },
      })
      .from(schema.pulse)
      .innerJoin(schema.user, eq(schema.pulse.authorId, schema.user.id))
      .where(eq(schema.pulse.workspaceId, workspaceId))
      .orderBy(asc(schema.pulse.createdAt))
      .limit(100)

    return rows.reverse().map(({ pulse, author }) => ({ ...pulse, author }))
  }
)

export const createPulse = createServerFn({ method: "POST" })
  .validator((input: unknown) => pulseInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { db, schema, user } = await getAuthContext()
    const workspaceId = await getWorkspaceId(db, schema, user.id)
    const [created] = await db
      .insert(schema.pulse)
      .values({
        id: crypto.randomUUID(),
        workspaceId,
        authorId: user.id,
        mood: data.mood,
        body: data.body,
      })
      .returning()

    return {
      ...created,
      author: { name: user.name, image: user.image ?? null },
    }
  })
