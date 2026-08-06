import * as React from "react"
import { useRouter } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { moodOptions } from "@/components/app/mood-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { createPulseFn } from "@/server/workspace"
import type { PulseMood } from "@/db/schema"

export function PulseComposer({
  onCreated,
  compact = false,
}: {
  onCreated?: () => void
  compact?: boolean
}) {
  const router = useRouter()
  const createPulse = useServerFn(createPulseFn)
  const [mood, setMood] = React.useState<PulseMood>("ok")
  const [pending, setPending] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const body = String(data.get("body") ?? "").trim()
    const moodValue = (String(data.get("mood") ?? mood) || "ok") as PulseMood

    if (!body) {
      toast.error("Add a short note before posting")
      return
    }

    setPending(true)
    try {
      await createPulse({ data: { mood: moodValue, body } })
      formRef.current?.reset()
      setMood("ok")
      toast.success("Pulse posted")
      await router.invalidate()
      onCreated?.()
    } catch (err) {
      toast.error("Could not post pulse. Try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <Card
      className={cn("border-border/70 shadow-sm", compact && "shadow-none")}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Share a pulse</CardTitle>
        <CardDescription>
          A quick check-in helps the team see energy and blockers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
          <input type="hidden" name="mood" value={mood} />
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Mood</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left transition-colors",
                    mood === option.value
                      ? "border-primary bg-primary/5 ring-1 ring-ring"
                      : "border-border hover:bg-muted/60"
                  )}
                  aria-pressed={mood === option.value}
                >
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.hint}
                  </div>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="pulse-body">Note</Label>
            <Textarea
              id="pulse-body"
              name="body"
              placeholder="What are you focused on? Anything blocked?"
              maxLength={500}
              rows={compact ? 3 : 4}
              required
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Keep it short and actionable.</span>
              <span>Max 500 characters</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="animate-spin" data-icon="inline-start" />
                  Posting…
                </>
              ) : (
                "Post pulse"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
