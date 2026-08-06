import * as React from "react"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MOODS, moodConfig } from "@/lib/mood"
import { cn } from "@/lib/utils"
import type { PulseMood } from "@/db/schema"

type Props = {
  onSubmit: (input: {
    mood: PulseMood
    body: string
  }) => Promise<void>
  className?: string
}

export function PulseComposer({ onSubmit, className }: Props) {
  const [mood, setMood] = React.useState<PulseMood>("ok")
  const [body, setBody] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!body.trim()) {
      setError("Write a short note about how things are going.")
      return
    }
    setPending(true)
    try {
      await onSubmit({ mood, body: body.trim() })
      setBody("")
      setMood("ok")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post pulse")
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Share a pulse</CardTitle>
        <p className="text-sm text-muted-foreground">
          A quick status so teammates know how to support you.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">How are you?</legend>
            <div
              className="grid gap-2 sm:grid-cols-3"
              role="radiogroup"
              aria-label="Mood"
            >
              {MOODS.map((m) => {
                const cfg = moodConfig[m]
                const selected = mood === m
                return (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setMood(m)}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      selected
                        ? cfg.className
                        : "border-border bg-background hover:bg-muted/50",
                    )}
                  >
                    <span className="text-sm font-medium">
                      <span aria-hidden className="mr-1.5">
                        {cfg.emoji}
                      </span>
                      {cfg.label}
                    </span>
                    <span className="text-xs opacity-80">{cfg.description}</span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="pulse-body">Note</Label>
            <Textarea
              id="pulse-body"
              name="body"
              placeholder="Working on auth flows… waiting on design review…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={500}
              rows={3}
              disabled={pending}
              aria-invalid={!!error}
              aria-describedby={error ? "pulse-error" : "pulse-hint"}
            />
            <div className="flex items-center justify-between gap-2">
              <p id="pulse-hint" className="text-xs text-muted-foreground">
                Keep it short — one or two sentences.
              </p>
              <p className="text-xs tabular-nums text-muted-foreground">
                {body.length}/500
              </p>
            </div>
          </div>

          {error ? (
            <p id="pulse-error" className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={pending || !body.trim()}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              ) : (
                <Send className="size-4" data-icon="inline-start" />
              )}
              Post pulse
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
