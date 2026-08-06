import * as React from "react"
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router"
import { Activity, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { getSessionFn } from "@/server/session"

export const Route = createFileRoute("/sign-in")({
  loader: async () => {
    const session = await getSessionFn()
    if (session) {
      throw redirect({ to: "/app" })
    }
    return null
  },
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  const [pending, setPending] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const email = String(data.get("email") ?? "").trim()
    const password = String(data.get("password") ?? "")

    if (!email || !password) {
      toast.error("Email and password are required")
      return
    }

    setPending(true)
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })
      if (result.error) {
        toast.error(result.error.message || "Could not sign in")
        return
      }
      toast.success("Welcome back")
      await navigate({ to: "/app" })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="from-background to-muted/30 flex min-h-svh items-center justify-center bg-linear-to-b px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-xl">
            <Activity className="size-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to check the team pulse.
          </p>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Sign in</CardTitle>
            <CardDescription>
              Use the email and password for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="animate-spin" data-icon="inline-start" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-muted-foreground text-sm">
              New here?{" "}
              <Link
                to="/sign-up"
                className="text-foreground font-medium underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
