import { and, count, desc, eq, gte, sql } from "drizzle-orm"
import { db } from "@/db"
import { pulse, user, workspace, workspaceMember } from "@/db/schema"
import type { PulseMood } from "@/db/schema"
import { createId, slugify } from "@/lib/ids"
import { startOfDay, startOfWeek } from "@/lib/format"
import { requireSession } from "./session.server"

async function ensurePersonalWorkspace(userId: string, userName: string) {
  const existing = await db.query.workspaceMember.findFirst({
    where: eq(workspaceMember.userId, userId),
    with: { workspace: true },
  })

  if (existing?.workspace) {
    return existing.workspace
  }

  const baseName = userName.trim()
    ? `${userName.trim()}'s Workspace`
    : "Personal Workspace"
  const baseSlug = slugify(userName || "workspace") || "workspace"
  let slug = baseSlug
  let attempt = 0

  for (;;) {
    const clash = await db.query.workspace.findFirst({
      where: eq(workspace.slug, slug),
    })
    if (!clash) break
    attempt += 1
    slug = `${baseSlug}-${attempt}`
  }

  const workspaceId = createId("ws")
  const memberId = createId("wm")

  await db.transaction(async (tx) => {
    await tx.insert(workspace).values({
      id: workspaceId,
      name: baseName,
      slug,
    })
    await tx.insert(workspaceMember).values({
      id: memberId,
      workspaceId,
      userId,
      role: "owner",
    })
  })

  const created = await db.query.workspace.findFirst({
    where: eq(workspace.id, workspaceId),
  })
  if (!created) throw new Error("Failed to create workspace")
  return created
}

async function getMembership(userId: string, workspaceId: string) {
  return db.query.workspaceMember.findFirst({
    where: and(
      eq(workspaceMember.userId, userId),
      eq(workspaceMember.workspaceId, workspaceId)
    ),
    with: { workspace: true },
  })
}

export async function getBootstrap() {
  const session = await requireSession()
  const ws = await ensurePersonalWorkspace(
    session.user.id,
    session.user.name || session.user.email
  )

  const membership = await getMembership(session.user.id, ws.id)
  if (!membership) throw new Error("Membership missing")

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    },
    workspace: {
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      createdAt: ws.createdAt,
    },
    role: membership.role,
  }
}

export async function getDashboard() {
  const session = await requireSession()
  const ws = await ensurePersonalWorkspace(
    session.user.id,
    session.user.name || session.user.email
  )

  const dayStart = startOfDay()
  const weekStart = startOfWeek()

  const [memberCountRow] = await db
    .select({ value: count() })
    .from(workspaceMember)
    .where(eq(workspaceMember.workspaceId, ws.id))

  const [pulsesTodayRow] = await db
    .select({ value: count() })
    .from(pulse)
    .where(and(eq(pulse.workspaceId, ws.id), gte(pulse.createdAt, dayStart)))

  const [pulsesWeekRow] = await db
    .select({ value: count() })
    .from(pulse)
    .where(and(eq(pulse.workspaceId, ws.id), gte(pulse.createdAt, weekStart)))

  const recent = await db
    .select({
      id: pulse.id,
      mood: pulse.mood,
      body: pulse.body,
      createdAt: pulse.createdAt,
      authorId: pulse.authorId,
      authorName: user.name,
      authorImage: user.image,
    })
    .from(pulse)
    .innerJoin(user, eq(pulse.authorId, user.id))
    .where(eq(pulse.workspaceId, ws.id))
    .orderBy(desc(pulse.createdAt))
    .limit(10)

  return {
    workspace: {
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
    },
    stats: {
      members: Number(memberCountRow.value),
      pulsesToday: Number(pulsesTodayRow.value),
      pulsesThisWeek: Number(pulsesWeekRow.value),
    },
    recentPulses: recent.map((p) => ({
      id: p.id,
      mood: p.mood,
      body: p.body,
      createdAt: p.createdAt,
      author: {
        id: p.authorId,
        name: p.authorName,
        image: p.authorImage,
      },
    })),
  }
}

export async function listPulses() {
  const session = await requireSession()
  const ws = await ensurePersonalWorkspace(
    session.user.id,
    session.user.name || session.user.email
  )

  const rows = await db
    .select({
      id: pulse.id,
      mood: pulse.mood,
      body: pulse.body,
      createdAt: pulse.createdAt,
      authorId: pulse.authorId,
      authorName: user.name,
      authorImage: user.image,
    })
    .from(pulse)
    .innerJoin(user, eq(pulse.authorId, user.id))
    .where(eq(pulse.workspaceId, ws.id))
    .orderBy(desc(pulse.createdAt))
    .limit(50)

  return {
    workspaceId: ws.id,
    pulses: rows.map((p) => ({
      id: p.id,
      mood: p.mood,
      body: p.body,
      createdAt: p.createdAt,
      author: {
        id: p.authorId,
        name: p.authorName,
        image: p.authorImage,
      },
    })),
  }
}

export async function createPulse(data: { mood: PulseMood; body: string }) {
  const session = await requireSession()
  const ws = await ensurePersonalWorkspace(
    session.user.id,
    session.user.name || session.user.email
  )

  const id = createId("pulse")
  const [created] = await db
    .insert(pulse)
    .values({
      id,
      workspaceId: ws.id,
      authorId: session.user.id,
      mood: data.mood,
      body: data.body,
    })
    .returning()

  return {
    id: created.id,
    mood: created.mood,
    body: created.body,
    createdAt: created.createdAt,
    author: {
      id: session.user.id,
      name: session.user.name,
      image: session.user.image,
    },
  }
}

export async function renameWorkspace(data: { name: string }) {
  const session = await requireSession()
  const ws = await ensurePersonalWorkspace(
    session.user.id,
    session.user.name || session.user.email
  )

  const membership = await getMembership(session.user.id, ws.id)
  if (
    !membership ||
    (membership.role !== "owner" && membership.role !== "admin")
  ) {
    throw new Error("Only owners and admins can rename the workspace")
  }

  const [updated] = await db
    .update(workspace)
    .set({ name: data.name })
    .where(eq(workspace.id, ws.id))
    .returning()

  return {
    id: updated.id,
    name: updated.name,
    slug: updated.slug,
  }
}

export async function getWorkspaceSettings() {
  const session = await requireSession()
  const ws = await ensurePersonalWorkspace(
    session.user.id,
    session.user.name || session.user.email
  )
  const membership = await getMembership(session.user.id, ws.id)
  if (!membership) throw new Error("Membership missing")

  const members = await db
    .select({
      id: workspaceMember.id,
      role: workspaceMember.role,
      userId: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    })
    .from(workspaceMember)
    .innerJoin(user, eq(workspaceMember.userId, user.id))
    .where(eq(workspaceMember.workspaceId, ws.id))
    .orderBy(
      sql`case when ${workspaceMember.role} = 'owner' then 0 when ${workspaceMember.role} = 'admin' then 1 else 2 end`,
      user.name
    )

  return {
    workspace: {
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      createdAt: ws.createdAt,
    },
    role: membership.role,
    members: members.map((m) => ({
      id: m.id,
      role: m.role,
      user: {
        id: m.userId,
        name: m.name,
        email: m.email,
        image: m.image,
      },
    })),
  }
}
