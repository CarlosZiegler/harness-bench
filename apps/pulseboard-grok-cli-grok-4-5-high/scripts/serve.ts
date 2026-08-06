/**
 * Production server for TanStack Start (Bun runtime).
 * Serves SSR via the built fetch handler and static client assets.
 */
// @ts-nocheck — Bun-only production entry; not part of the app type graph.
import { join } from "node:path"
import app from "../dist/server/server.js"

const port = Number(process.env.PORT || 3000)
const hostname = process.env.HOSTNAME || "0.0.0.0"
const clientDir = join(import.meta.dir, "../dist/client")

function contentType(path: string): string {
  if (path.endsWith(".js")) return "application/javascript; charset=utf-8"
  if (path.endsWith(".css")) return "text/css; charset=utf-8"
  if (path.endsWith(".html")) return "text/html; charset=utf-8"
  if (path.endsWith(".svg")) return "image/svg+xml"
  if (path.endsWith(".png")) return "image/png"
  if (path.endsWith(".ico")) return "image/x-icon"
  if (path.endsWith(".woff2")) return "font/woff2"
  if (path.endsWith(".json")) return "application/json"
  if (path.endsWith(".webmanifest")) return "application/manifest+json"
  return "application/octet-stream"
}

async function serveStatic(pathname: string): Promise<Response | null> {
  const relative = pathname === "/" ? "/index.html" : pathname
  const filePath = join(clientDir, relative)
  if (!filePath.startsWith(clientDir)) return null

  const file = Bun.file(filePath)
  if (!(await file.exists())) return null

  return new Response(file, {
    headers: {
      "Content-Type": contentType(filePath),
      "Cache-Control": pathname.startsWith("/assets/")
        ? "public, max-age=31536000, immutable"
        : "public, max-age=0",
    },
  })
}

const server = Bun.serve({
  port,
  hostname,
  async fetch(request: Request) {
    const url = new URL(request.url)

    if (request.method === "GET" || request.method === "HEAD") {
      const staticResponse = await serveStatic(url.pathname)
      if (staticResponse) {
        if (request.method === "HEAD") {
          return new Response(null, {
            status: staticResponse.status,
            headers: staticResponse.headers,
          })
        }
        return staticResponse
      }
    }

    return app.fetch(request)
  },
})

console.log(`Pulseboard listening on http://${server.hostname}:${server.port}`)
