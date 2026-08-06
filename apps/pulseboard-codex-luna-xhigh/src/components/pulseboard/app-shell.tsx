import { createContext, useContext, useState } from "react"
import { Link, useLocation, useNavigate } from "@tanstack/react-router"
import {
  BarChart3,
  ChevronDown,
  LogOut,
  Menu,
  MessageCircleMore,
  Settings2,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { BrandMark } from "@/components/pulseboard/brand-mark"
import { ThemeToggle } from "@/components/pulseboard/theme-toggle"
import { getInitials } from "@/lib/pulseboard"
import { authClient } from "@/lib/auth-client"
import type { DashboardSnapshot } from "@/db/schema"

const AppDataContext = createContext<DashboardSnapshot | null>(null)

export function AppDataProvider({
  data,
  children,
}: {
  data: DashboardSnapshot
  children: React.ReactNode
}) {
  return (
    <AppDataContext.Provider value={data}>{children}</AppDataContext.Provider>
  )
}

export function useAppData() {
  const data = useContext(AppDataContext)
  if (!data) throw new Error("useAppData must be used inside AppDataProvider")
  return data
}

const navItems = [
  { to: "/app", label: "Overview", icon: BarChart3, exact: true },
  { to: "/app/pulses", label: "Pulses", icon: MessageCircleMore, exact: false },
  { to: "/app/settings", label: "Settings", icon: Settings2, exact: false },
] as const

export function AppShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const data = useAppData()

  async function handleSignOut() {
    await authClient.signOut()
    await navigate({ to: "/sign-in" })
  }

  return (
    <div className="app-frame">
      <aside className={`app-sidebar ${menuOpen ? "app-sidebar-open" : ""}`}>
        <div className="flex items-center justify-between">
          <BrandMark />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          >
            <X />
          </Button>
        </div>

        <div className="mt-9 rounded-xl border border-border/80 bg-background/40 p-2">
          <p className="px-2 pb-1 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Workspace
          </p>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium hover:bg-accent"
            aria-label="Current workspace"
          >
            <span className="grid size-6 place-items-center rounded-md bg-primary/15 text-[11px] font-semibold text-primary">
              {data.workspace.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate">
              {data.workspace.name}
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        </div>

        <nav
          className="mt-7 flex flex-1 flex-col gap-1"
          aria-label="Workspace navigation"
        >
          <p className="px-2 pb-2 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Workspace view
          </p>
          {navItems.map(({ to, label, icon: Icon, exact }) => {
            const isActive = exact
              ? location.pathname === to
              : location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
                activeProps={{ "aria-current": "page" }}
              >
                <Icon className="size-4" />
                {label}
                {label === "Pulses" && data.pulsesToday > 0 && (
                  <span className="ml-auto rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold text-primary">
                    {data.pulsesToday}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-border/70 pt-4">
          <div className="flex items-center gap-2.5 px-2">
            <div className="avatar avatar-sm">
              {data.currentUser.image ? (
                <img src={data.currentUser.image} alt="" />
              ) : (
                getInitials(data.currentUser.name)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">
                {data.currentUser.name}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {data.currentUser.email}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-muted-foreground transition hover:text-foreground"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Menu />
            </Button>
            <div className="md:hidden">
              <BrandMark compact />
            </div>
            <span className="hidden text-xs text-muted-foreground md:inline">
              {data.workspace.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-2 hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
              <span className="status-dot" /> All systems calm
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
      {menuOpen && (
        <button
          type="button"
          className="sidebar-scrim md:hidden"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  )
}
