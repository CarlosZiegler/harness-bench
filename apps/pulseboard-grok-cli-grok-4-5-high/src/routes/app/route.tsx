import { Outlet, createFileRoute } from "@tanstack/react-router"
import { AppShell } from "@/components/app/app-shell"
import { getAppBootstrap } from "@/server/session"

export const Route = createFileRoute("/app")({
  loader: async () => {
    return await getAppBootstrap()
  },
  component: AppLayout,
  pendingComponent: AppPending,
  errorComponent: AppError,
})

function AppLayout() {
  const data = Route.useLoaderData()

  return (
    <AppShell
      user={{ name: data.user.name, email: data.user.email }}
      workspaceName={data.workspace.name}
    >
      <Outlet />
    </AppShell>
  )
}

function AppPending() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="text-center">
        <div className="mx-auto mb-3 size-8 animate-pulse rounded-lg bg-muted" />
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </div>
    </div>
  )
}

function AppError({ error }: { error: Error }) {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "We could not load your workspace. Try signing in again."}
        </p>
        <a
          href="/sign-in"
          className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline"
        >
          Back to sign in
        </a>
      </div>
    </div>
  )
}
