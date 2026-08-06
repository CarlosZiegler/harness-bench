import { createServerFn } from "@tanstack/react-start"
import { getSession } from "./session.server"

export const getSessionFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await getSession()
    if (!session) return null
    return {
      user: session.user,
      session: {
        id: session.session.id,
        expiresAt: session.session.expiresAt,
      },
    }
  },
)
