import { Hono } from "hono"
import { cors } from "hono/cors"
import type { AppContext } from "../../composition-root.js"

export function createHttpApp(ctx: AppContext) {
  const app = new Hono()

  app.use(
    "*",
    cors({
      origin: (origin) => origin ?? "*",
      allowMethods: ["GET", "OPTIONS"],
    })
  )

  app.get("/health", async (c) => {
    const chainOk = await ctx.chainRead.isHealthy()
    return c.json({ ok: true, chain: chainOk ? "up" : "degraded" })
  })

  app.get("/v1/projects", async (c) => {
    const projects = await ctx.listProjects.execute()
    return c.json({ data: projects })
  })

  app.get("/v1/projects/:id", async (c) => {
    const id = c.req.param("id")
    const project = await ctx.getProjectById.execute(id)
    if (project == null) {
      return c.json({ error: "not_found" }, 404)
    }
    return c.json({ data: project })
  })

  return app
}
