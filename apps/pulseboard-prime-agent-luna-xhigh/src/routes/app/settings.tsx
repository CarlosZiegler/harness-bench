import * as React from "react"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { getWorkspaceSettingsFn, renameWorkspaceFn } from "@/server/workspace"

export const Route = createFileRoute("/app/settings")({
  loader: () => getWorkspaceSettingsFn(),
  component: SettingsPage,
  pendingComponent: SettingsPending,
  errorComponent: () => (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <h2 className="font-medium">Could not load settings</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Try refreshing the page and check again.
      </p>
    </div>
  ),
})

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("")
}

function SettingsPage() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const renameWorkspace = useServerFn(renameWorkspaceFn)
  const [pending, setPending] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const nextName = String(formData.get("name") ?? "").trim()
    if (!nextName || nextName === data.workspace.name) return
    setPending(true)
    try {
      await renameWorkspace({ data: { name: nextName } })
      toast.success("Workspace renamed")
      await router.invalidate()
    } catch {
      toast.error("Could not rename workspace. Try again.")
    } finally {
      setPending(false)
    }
  }

  const canRename = data.role === "owner" || data.role === "admin"

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Settings</p>
        <h1 className="text-2xl font-semibold tracking-tight">Workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the name of your workspace and review members.
        </p>
      </div>

      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>
            Slug is fixed after creation. You can rename the display name
            anytime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Name</Label>
                <Input
                  id="workspace-name"
                  name="name"
                  defaultValue={data.workspace.name}
                  key={data.workspace.name}
                  disabled={!canRename}
                  minLength={2}
                  maxLength={80}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workspace-slug">Slug</Label>
                <Input
                  id="workspace-slug"
                  value={data.workspace.slug}
                  disabled
                />
              </div>
            </div>
            {canRename ? (
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2
                      className="animate-spin"
                      data-icon="inline-start"
                    />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Only owners and admins can rename this workspace.
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
          <CardDescription>
            People with access to this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar size="sm">
                  {member.user.image ? (
                    <AvatarImage
                      src={member.user.image}
                      alt={member.user.name}
                    />
                  ) : null}
                  <AvatarFallback>
                    {initials(member.user.name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {member.user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="capitalize">
                {member.role}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsPending() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-40" />
      </div>
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  )
}
