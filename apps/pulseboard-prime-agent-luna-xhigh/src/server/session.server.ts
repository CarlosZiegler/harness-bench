import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/lib/auth"
import type { Session } from "@/lib/auth"

type SessionOptions = {
  disableCookieCache?: boolean
}

export async function getSession(
  options: SessionOptions = {}
): Promise<Session | null> {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({
    headers,
    query: options.disableCookieCache
      ? { disableCookieCache: true }
      : undefined,
  })
  return session
}

export async function requireSession(): Promise<Session> {
  const session = await getSession({ disableCookieCache: true })
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}
