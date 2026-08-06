import { Link, useRouterState } from "@tanstack/react-router"
import {
  Activity,
  LayoutDashboard,
  LogOut,
  Menu,
  Radio,
  Settings,
} from "lucide-react"
import * as React from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/auth-client"

type NavItem = {
  to: "/app" | "/app/pulses" | "/app/settings"
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/pulses", label: "Pulses", icon: Activity },
  { to: "/app/settings", label: "Settings", icon: Settings },
]

function NavLinks({
  onNavigate,
  pathname,
}: {
  onNavigate?: () => void
  pathname: string
}) {
  return (
    <nav className="flex flex-col gap-1" aria-label="App">
      {navItems.map((item) => {
        const active =
          item.to === "/app"
            ? pathname === "/app" || pathname === "/app/"
            : pathname.startsWith(item.to)
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <item.icon className="size-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AppShell({
  user,
  workspaceName,
  children,
}: {
  user: { name: string; email: string }
  workspaceName: string
  children: React.ReactNode
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [open, setOpen] = React.useState(false)
  const [signingOut, setSigningOut] = React.useState(false)

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
      window.location.href = "/"
    } finally {
      setSigningOut(false)
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-3 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Radio className="size-4" aria-hidden />
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
      <div className="flex-1 p-3">
        <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
      </div>
      <Separator />
      <div className="space-y-3 p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex-1 justify-start"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <LogOut className="size-4" data-icon="inline-start" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open navigation"
                />
              }
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              {sidebar}
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Radio className="size-4 text-primary" aria-hidden />
            <span className="text-sm font-semibold">Pulseboard</span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
