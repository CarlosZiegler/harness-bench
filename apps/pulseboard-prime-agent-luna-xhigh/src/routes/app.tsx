import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { AppMobileNav, AppSidebar } from "@/components/layout/app-sidebar"
import { getBootstrapFn } from "@/server/workspace"

export const Route = createFileRoute("/app")({
  loader: async () => {
    try {
      return await getBootstrapFn()
    } catch {
      throw redirect({ to: "/sign-in" })
    }
  },
  component: AppLayout,
  pendingComponent: AppPending,
  errorComponent: AppError,
})

function AppLayout() {
  const data = Route.useLoaderData()

  return (
    <div className="flex min-h-svh bg-background">
      <div className="hidden md:block">
        <div className="sticky top-0 h-svh">
          <AppSidebar user={data.user} workspaceName={data.workspace.name} />
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppMobileNav user={data.user} workspaceName={data.workspace.name} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function AppPending() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="text-sm text-muted-foreground">Loading workspace…</div>
    </div>
  )
}

function AppError() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        We could not load your workspace. Try refreshing the page.
      </p>
      <a
        href="/sign-in"
        className="text-sm font-medium underline-offset-4 hover:underline"
      >
        Back to sign in
      </a>
    </div>
  )
}
