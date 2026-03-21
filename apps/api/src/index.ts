import { Hono } from "hono"
import { logger } from "hono/logger"
import { cors } from "hono/cors"
import { getUserRepos } from "./services/github"

const app = new Hono()

app.use("*", logger())
app.use("*", cors({
  origin: "http://localhost:3000",
  credentials: true,
}))

app.get("/health", (c) => {
  return c.json({ status: "ok", message: "RepoWind API is running" })
})

app.get("/api/repos", async (c) => {
  const repos = await getUserRepos()
  return c.json(repos)
})

export default {
  port: 8080,
  fetch: app.fetch,
}