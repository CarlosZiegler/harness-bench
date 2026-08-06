import { and, desc, eq, gte, sql } from "drizzle-orm"
import { db } from "@/db"
import {
  pulse,
  user,
  workspace,
  workspaceMember,
  type PulseMood,
  type Workspace,
} from "@/db/schema"
import { createId, slugify } from "@/lib/id"

export async function ensurePersonalWorkspace(
  userId: string,
  userName: string,
): Promise<Workspace> {
  const existing = await db
    .select({ workspace })
    .from(workspaceMember)
    .innerJoin(workspace, eq(workspace.id, workspaceMember.workspaceId))
    .where(eq(workspaceMember.userId, userId))
    .limit(1)

  if (existing[0]) {
    return existing[0].workspace
  }

  const baseName = userName?.trim() ? `${userName.trim()}'s Workspace` : "My Workspace"
  const baseSlug = slugify(userName || "workspace") || "workspace"
  const uniqueSlug = `${baseSlug}-${createId().slice(0, 8)}`
  const workspaceId = createId("ws")

  const [created] = await db
    .insert(workspace)
    .values({
      id: workspaceId,
      name: baseName,
      slug: uniqueSlug,
    })
    .returning()

  await db.insert(workspaceMember).values({
    id: createId("wsm"),
    workspaceId,
    userId,
    role: "owner",
  })

  return created
}

export async function getUserWorkspace(userId: string) {
  const row = await db
    .select({
      workspace,
      role: workspaceMember.role,
    })
    .from(workspaceMember)
    .innerJoin(workspace, eq(workspace.id, workspaceMember.workspaceId))
    .where(eq(workspaceMember.userId, userId))
    .limit(1)

  return row[0] ?? null
}

export async function renameWorkspace(
  workspaceId: string,
  userId: string,
  name: string,
) {
  const membership = await db
    .select()
    .from(workspaceMember)
    .where(
      and(
        eq(workspaceMember.workspaceId, workspaceId),
        eq(workspaceMember.userId, userId),
      ),
    )
    .limit(1)

  if (!membership[0]) {
    throw new Error("You are not a member of this workspace")
  }

  const trimmed = name.trim()
  if (trimmed.length < 2) {
    throw new Error("Workspace name must be at least 2 characters")
  }

  const [updated] = await db
    .update(workspace)
    .set({ name: trimmed })
    .where(eq(workspace.id, workspaceId))
    .returning()

  return updated
}

export async function getWorkspaceStats(workspaceId: string) {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const startOfWeek = new Date()
  const day = startOfWeek.getDay()
  const diff = day === 0 ? 6 : day - 1
  startOfWeek.setDate(startOfWeek.getDate() - diff)
  startOfWeek.setHours(0, 0, 0, 0)

  const [memberCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(workspaceMember)
    .where(eq(workspaceMember.workspaceId, workspaceId))

  const [pulsesToday] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pulse)
    .where(
      and(
        eq(pulse.workspaceId, workspaceId),
        gte(pulse.createdAt, startOfToday),
      ),
    )

  const [pulsesThisWeek] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(pulse)
    .where(
      and(
        eq(pulse.workspaceId, workspaceId),
        gte(pulse.createdAt, startOfWeek),
      ),
    )

  return {
    members: memberCount?.count ?? 0,
    pulsesToday: pulsesToday?.count ?? 0,
    pulsesThisWeek: pulsesThisWeek?.count ?? 0,
  }
}

export async function listPulses(workspaceId: string, limit = 50) {
  const rows = await db
    .select({
      id: pulse.id,
      mood: pulse.mood,
      body: pulse.body,
      createdAt: pulse.createdAt,
      authorId: pulse.authorId,
      authorName: user.name,
      authorImage: user.image,
      authorEmail: user.email,
    })
    .from(pulse)
    .innerJoin(user, eq(user.id, pulse.authorId))
    .where(eq(pulse.workspaceId, workspaceId))
    .orderBy(desc(pulse.createdAt))
    .limit(limit)

  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }))
}

export async function createPulse(input: {
  workspaceId: string
  authorId: string
  mood: PulseMood
  body: string
}) {
  const body = input.body.trim()
  if (!body) {
    throw new Error("Pulse note is required")
  }
  if (body.length > 500) {
    throw new Error("Pulse note must be 500 characters or fewer")
  }

  const membership = await db
    .select()
    .from(workspaceMember)
    .where(
      and(
        eq(workspaceMember.workspaceId, input.workspaceId),
        eq(workspaceMember.userId, input.authorId),
      ),
    )
    .limit(1)

  if (!membership[0]) {
    throw new Error("You are not a member of this workspace")
  }

  const [created] = await db
    .insert(pulse)
    .values({
      id: createId("pulse"),
      workspaceId: input.workspaceId,
      authorId: input.authorId,
      mood: input.mood,
      body,
    })
    .returning()

  const [author] = await db
    .select({
      name: user.name,
      image: user.image,
      email: user.email,
    })
    .from(user)
    .where(eq(user.id, input.authorId))
    .limit(1)

  return {
    id: created.id,
    mood: created.mood,
    body: created.body,
    createdAt: created.createdAt.toISOString(),
    authorId: created.authorId,
    authorName: author?.name ?? "Unknown",
    authorImage: author?.image ?? null,
    authorEmail: author?.email ?? "",
  }
}

