import { Link, useRouterState } from "@tanstack/react-router"
import {
  Activity,
  LayoutDashboard,
  LogOut,
  Radio,
  Settings2,
} from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/pulses", label: "Pulses", icon: Radio, exact: false },
  { to: "/app/settings", label: "Settings", icon: Settings2, exact: false },
] as const

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("")
}

export function AppSidebar({
  user,
  workspaceName,
}: {
  user: { name: string; email: string; image?: string | null }
  workspaceName: string
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  async function handleSignOut() {
    await authClient.signOut()
    window.location.href = "/sign-in"
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border/70 bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            Pulseboard
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {workspaceName}
          </p>
        </div>
      </div>

      <Separator />

      <nav
        aria-label="Primary navigation"
        className="flex flex-1 flex-col gap-1 p-3"
      >
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(`${item.to}/`)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto space-y-3 p-3">
        <div className="flex items-center justify-between gap-2">
          <ModeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut data-icon="inline-start" />
            Sign out
          </Button>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-2.5 py-2">
          <Avatar size="sm">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name} />
            ) : null}
            <AvatarFallback>{initials(user.name || "U")}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export function AppMobileNav({
  user,
  workspaceName,
}: {
  user: { name: string; email: string; image?: string | null }
  workspaceName: string
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  async function handleSignOut() {
    await authClient.signOut()
    window.location.href = "/sign-in"
  }

  return (
    <div className="sticky top-0 z-20 border-b border-border/70 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Pulseboard</p>
          <p className="truncate text-xs text-muted-foreground">
            {workspaceName}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <ModeToggle />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleSignOut}
            aria-label="Sign out"
          >
            <LogOut />
          </Button>
          <Avatar size="sm">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name} />
            ) : null}
            <AvatarFallback>{initials(user.name || "U")}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <nav
        aria-label="Mobile navigation"
        className="flex gap-1 overflow-x-auto px-3 pb-3"
      >
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(`${item.to}/`)
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
