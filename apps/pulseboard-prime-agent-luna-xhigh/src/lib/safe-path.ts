import { isAbsolute, relative, resolve, sep } from "node:path"

/** Resolve a URL path under a directory without allowing traversal. */
export function safeJoin(base: string, requestPath: string) {
  let decoded: string
  try {
    decoded = decodeURIComponent(requestPath.split("?")[0] ?? "")
  } catch {
    return null
  }

  const fullPath = resolve(base, decoded.replace(/^\/+/, ""))
  const relativePath = relative(resolve(base), fullPath)
  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  ) {
    return null
  }

  return fullPath
}
