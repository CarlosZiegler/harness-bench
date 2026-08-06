import { useState } from "react"
import { createFileRoute, useRouter } from "@tanstack/react-router"

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
import { useAppData } from "@/components/pulseboard/app-shell"
import { renameWorkspace } from "@/server/workspace.functions"

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  const data = useAppData()
  const router = useRouter()
  const [name, setName] = useState(data.workspace.name)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)
    setSaving(true)
    try {
      await renameWorkspace({ data: name })
      setFeedback("Workspace name updated.")
      await router.invalidate()
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "We could not update your workspace."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-stack page-stack-narrow">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Make it yours</p>
          <h1 className="mt-2">Workspace settings</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            A few quiet controls for the space where your team checks in.
          </p>
        </div>
      </section>
      <Card>
        <CardHeader>
          <CardTitle>Workspace identity</CardTitle>
          <CardDescription>
            Keep the name recognizable when it appears across your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="workspace-name">Workspace name</Label>
              <Input
                id="workspace-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={48}
                required
              />
              <p className="text-xs text-muted-foreground">
                Your private workspace slug is{" "}
                <span className="font-mono text-foreground/70">
                  {data.workspace.slug}
                </span>
                .
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                disabled={saving || name.trim() === data.workspace.name}
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
              {feedback && (
                <span className="text-sm text-muted-foreground" role="status">
                  {feedback}
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
