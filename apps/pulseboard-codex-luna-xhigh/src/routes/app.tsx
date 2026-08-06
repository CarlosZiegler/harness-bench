import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { AppDataProvider, AppShell } from "@/components/pulseboard/app-shell"
import { getSession } from "@/server/auth.functions"
import { getDashboard } from "@/server/pulse.functions"
import { ensureWorkspace } from "@/server/workspace.functions"

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) throw redirect({ to: "/sign-in" })
    await ensureWorkspace()
  },
  loader: () => getDashboard(),
  component: AppRoute,
})

function AppRoute() {
  const data = Route.useLoaderData()
  return (
    <AppDataProvider data={data}>
      <AppShell>
        <Outlet />
      </AppShell>
    </AppDataProvider>
  )
}
