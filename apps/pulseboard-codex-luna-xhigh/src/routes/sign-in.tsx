import { useState } from "react"
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowRight, LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/pulseboard/auth-layout"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/sign-in")({ component: SignInPage })

function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const result = await authClient.signIn.email({ email, password })
      if (result.error)
        throw new Error(result.error.message ?? "That sign-in did not work.")
      await navigate({ to: "/app" })
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "That sign-in did not work."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout mode="sign-in">
      <div className="mb-8">
        <span className="mb-5 inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-primary">
          Welcome back
        </span>
        <h2 className="text-3xl font-semibold tracking-[-0.06em]">
          Back to the pulse.
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Sign in to see what your team is carrying this week.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="sign-in-email">Email</Label>
          <Input
            id="sign-in-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="sign-in-password">Password</Label>
            <span className="text-[11px] text-muted-foreground">
              At least 8 characters
            </span>
          </div>
          <Input
            id="sign-in-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            minLength={8}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          className="mt-2 h-11 rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <ArrowRight />
          )}
          {isLoading ? "Opening your workspace…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Need a workspace?{" "}
        <Link
          to="/sign-up"
          className="font-semibold text-foreground underline decoration-primary/60 underline-offset-4 hover:text-primary"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  )
}
