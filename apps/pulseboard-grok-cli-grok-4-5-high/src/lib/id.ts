import { nanoid } from "nanoid"

export function createId(prefix?: string) {
  const id = nanoid(21)
  return prefix ? `${prefix}_${id}` : id
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
}
