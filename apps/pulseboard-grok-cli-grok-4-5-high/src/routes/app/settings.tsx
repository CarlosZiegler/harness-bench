import * as React from "react"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { getRouteApi } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
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
import { updateWorkspaceName } from "@/server/session"

const appRoute = getRouteApi("/app")

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  const parent = appRoute.useLoaderData()
  const router = useRouter()
  const [name, setName] = React.useState(parent.workspace.name)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setName(parent.workspace.name)
  }, [parent.workspace.name])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await updateWorkspaceName({ data: { name } })
      toast.success("Workspace renamed")
      await router.invalidate()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update workspace")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your workspace details.
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Workspace</CardTitle>
          <CardDescription>
            Rename the workspace that holds your team&apos;s pulses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Name</Label>
              <Input
                id="workspace-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={80}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-slug">Slug</Label>
              <Input
                id="workspace-slug"
                value={parent.workspace.slug}
                readOnly
                disabled
                aria-describedby="slug-hint"
              />
              <p id="slug-hint" className="text-xs text-muted-foreground">
                Slug is generated automatically and can&apos;t be changed yet.
              </p>
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={pending || name.trim() === parent.workspace.name}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              ) : null}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Your account</CardTitle>
          <CardDescription>Signed-in profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between gap-4 border-b py-2">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{parent.user.name}</span>
          </div>
          <div className="flex justify-between gap-4 py-2">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{parent.user.email}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
