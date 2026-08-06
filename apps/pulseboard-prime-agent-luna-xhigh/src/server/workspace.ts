import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import {
  createPulse,
  getBootstrap,
  getDashboard,
  getWorkspaceSettings,
  listPulses,
  renameWorkspace,
} from "./workspace.server"

export const getBootstrapFn = createServerFn({ method: "GET" }).handler(
  async () => getBootstrap()
)

export const getDashboardFn = createServerFn({ method: "GET" }).handler(
  async () => getDashboard()
)

export const listPulsesFn = createServerFn({ method: "GET" }).handler(
  async () => listPulses()
)

const createPulseSchema = z.object({
  mood: z.enum(["great", "ok", "blocked"]),
  body: z.string().trim().min(1).max(500),
})

export const createPulseFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createPulseSchema.parse(data))
  .handler(async ({ data }) => createPulse(data))

const renameWorkspaceSchema = z.object({
  name: z.string().trim().min(2).max(80),
})

export const renameWorkspaceFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => renameWorkspaceSchema.parse(data))
  .handler(async ({ data }) => renameWorkspace(data))

export const getWorkspaceSettingsFn = createServerFn({ method: "GET" }).handler(
  async () => getWorkspaceSettings()
)
