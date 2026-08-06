import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth, type Session } from "@/lib/auth"

export async function getSession(): Promise<Session | null> {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })
  return session
}

export async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}
