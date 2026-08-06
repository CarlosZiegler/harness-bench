import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { redirect } from "@tanstack/react-router"
import { auth } from "@/lib/auth"
import {
  createPulse,
  ensurePersonalWorkspace,
  getUserWorkspace,
  getWorkspaceStats,
  listPulses,
  renameWorkspace,
} from "@/lib/workspace"
import type { PulseMood } from "@/db/schema"

function toIso(value: Date | string | null | undefined) {
  if (!value) return null
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function serializeUser(user: {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image?: string | null
  createdAt: Date | string
  updatedAt: Date | string
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image ?? null,
    createdAt: toIso(user.createdAt)!,
    updatedAt: toIso(user.updatedAt)!,
  }
}

async function getSessionFromRequest() {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })
  return session
}

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSessionFromRequest()
    if (!session) return null
    return {
      user: serializeUser(session.user),
      session: {
        id: session.session.id,
        expiresAt: toIso(session.session.expiresAt)!,
      },
    }
  },
)

export const requireSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSessionFromRequest()
    if (!session) {
      throw redirect({ to: "/sign-in" })
    }
    return {
      user: serializeUser(session.user),
      session: {
        id: session.session.id,
        expiresAt: toIso(session.session.expiresAt)!,
      },
    }
  },
)

export const getAppBootstrap = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSessionFromRequest()
    if (!session) {
      throw redirect({ to: "/sign-in" })
    }

    const ws = await ensurePersonalWorkspace(
      session.user.id,
      session.user.name,
    )

    const membership = await getUserWorkspace(session.user.id)
    const [stats, pulses] = await Promise.all([
      getWorkspaceStats(ws.id),
      listPulses(ws.id, 30),
    ])

    return {
      user: serializeUser(session.user),
      workspace: {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        createdAt: toIso(ws.createdAt)!,
        role: membership?.role ?? "owner",
      },
      stats,
      pulses,
    }
  },
)

export const getDashboardData = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSessionFromRequest()
    if (!session) {
      throw redirect({ to: "/sign-in" })
    }

    const membership = await getUserWorkspace(session.user.id)
    if (!membership) {
      const ws = await ensurePersonalWorkspace(
        session.user.id,
        session.user.name,
      )
      const stats = await getWorkspaceStats(ws.id)
      const pulses = await listPulses(ws.id, 30)
      return {
        workspace: {
          id: ws.id,
          name: ws.name,
          slug: ws.slug,
          createdAt: toIso(ws.createdAt)!,
          role: "owner" as const,
        },
        stats,
        pulses,
      }
    }

    const [stats, pulses] = await Promise.all([
      getWorkspaceStats(membership.workspace.id),
      listPulses(membership.workspace.id, 30),
    ])

    return {
      workspace: {
        id: membership.workspace.id,
        name: membership.workspace.name,
        slug: membership.workspace.slug,
        createdAt: toIso(membership.workspace.createdAt)!,
        role: membership.role,
      },
      stats,
      pulses,
    }
  },
)

export const getPulsesData = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSessionFromRequest()
    if (!session) {
      throw redirect({ to: "/sign-in" })
    }

    let membership = await getUserWorkspace(session.user.id)
    if (!membership) {
      const ws = await ensurePersonalWorkspace(
        session.user.id,
        session.user.name,
      )
      membership = { workspace: ws, role: "owner" }
    }

    const pulses = await listPulses(membership.workspace.id, 100)
    return {
      workspace: {
        id: membership.workspace.id,
        name: membership.workspace.name,
        slug: membership.workspace.slug,
      },
      pulses,
    }
  },
)

export const submitPulse = createServerFn({ method: "POST" })
  .validator((data: { mood: PulseMood; body: string }) => {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid input")
    }
    if (!["great", "ok", "blocked"].includes(data.mood)) {
      throw new Error("Invalid mood")
    }
    if (typeof data.body !== "string") {
      throw new Error("Body must be a string")
    }
    return data
  })
  .handler(async ({ data }) => {
    const session = await getSessionFromRequest()
    if (!session) {
      throw redirect({ to: "/sign-in" })
    }

    let membership = await getUserWorkspace(session.user.id)
    if (!membership) {
      const ws = await ensurePersonalWorkspace(
        session.user.id,
        session.user.name,
      )
      membership = { workspace: ws, role: "owner" }
    }

    return createPulse({
      workspaceId: membership.workspace.id,
      authorId: session.user.id,
      mood: data.mood,
      body: data.body,
    })
  })

export const updateWorkspaceName = createServerFn({ method: "POST" })
  .validator((data: { name: string }) => {
    if (!data || typeof data.name !== "string") {
      throw new Error("Name is required")
    }
    return { name: data.name }
  })
  .handler(async ({ data }) => {
    const session = await getSessionFromRequest()
    if (!session) {
      throw redirect({ to: "/sign-in" })
    }

    let membership = await getUserWorkspace(session.user.id)
    if (!membership) {
      const ws = await ensurePersonalWorkspace(
        session.user.id,
        session.user.name,
      )
      membership = { workspace: ws, role: "owner" }
    }

    const updated = await renameWorkspace(
      membership.workspace.id,
      session.user.id,
      data.name,
    )

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      createdAt: toIso(updated.createdAt)!,
    }
  })
