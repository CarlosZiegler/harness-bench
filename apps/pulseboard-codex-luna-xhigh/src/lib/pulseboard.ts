import { z } from "zod"

export const moodSchema = z.enum(["great", "ok", "blocked"])
export type Mood = z.infer<typeof moodSchema>

export const pulseBodySchema = z.string().trim().min(1).max(280)

export const pulseInputSchema = z.object({
  body: pulseBodySchema,
  mood: moodSchema,
})

export const workspaceNameSchema = z.string().trim().min(2).max(48)

export function createWorkspaceSlug(name: string) {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || "my-workspace"
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

export function formatRelativeTime(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value
  const diff = Date.now() - date.getTime()
  const minutes = Math.max(0, Math.floor(diff / 60_000))

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export const moodMeta: Record<
  Mood,
  { label: string; description: string; className: string }
> = {
  great: {
    label: "Great",
    description: "Moving with momentum",
    className: "mood-great",
  },
  ok: {
    label: "Okay",
    description: "Steady, keeping pace",
    className: "mood-ok",
  },
  blocked: {
    label: "Blocked",
    description: "Could use a hand",
    className: "mood-blocked",
  },
}
