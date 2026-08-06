import type { TaskDefinition } from "../types/index.ts";

/**
 * Pulseboard — recommended default "Task grande" (medium-hard).
 *
 * Why this project:
 * - Real fullstack surface (auth, db, CRUD, dashboard UI)
 * - Frontend is first-class (cards, empty/loading states, responsive shell)
 * - DevOps mandatory (Postgres + app via docker compose)
 * - Not TodoMVC; not enterprise ERP
 * - Fits TanStack Start + Drizzle + Better Auth + shadcn/reui
 *
 * Scope target: strong agent finishes in ~30-90 minutes.
 */
export const pulseboardTask: TaskDefinition = {
  id: "pulseboard",
  title: "Pulseboard — team pulse / status dashboard",
  difficulty: "large",
  summary:
    "A small multi-user 'team pulse' web app: auth, workspaces, status updates, dashboard UI, Postgres, Docker Compose.",
  stack: [
    "TanStack Start",
    "Drizzle ORM",
    "PostgreSQL",
    "Better Auth",
    "shadcn/ui",
    "re-ui patterns",
    "Tailwind CSS v4",
    "Docker + Compose",
  ],
  mustHave: [
    "Scaffold via bunx shadcn init --preset b0 --template start --pointer",
    "Better Auth email/password",
    "Postgres via Drizzle",
    "Workspace/team concept",
    "Pulse updates: mood + note",
    "Dashboard with summary cards + recent pulses",
    "App shell responsive + dark mode",
    "Protected routes",
    "Dockerfile + docker-compose.yml",
    ".env.example + README",
    "Some tests",
  ],
  niceToHave: [
    "re-ui richer dashboard blocks",
    "Simple chart",
    "Invite code",
    "Optimistic UI",
    "Seed script",
  ],
  forbidden: [
    "No real secrets committed",
    "No Next.js",
    "Do not skip docker-compose",
    "Do not leave stock placeholder as only UI",
    "Stay inside assigned app directory",
  ],
  scaffold: {
    command:
      "bunx --bun shadcn@latest init --preset b0 --template start --pointer --yes --force -n app",
    createsInPlace: true,
  },
  prompts: {
    build: "tasks/pulseboard.build.md",
    validate: "tasks/pulseboard.validate.md",
  },
  runtimeChecks: ["install", "typecheck", "build", "docker_build", "compose_up"],
  scoringProfile: "fullstack-webdev",
};
