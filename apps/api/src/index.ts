import { Hono } from "hono"
import { logger } from "hono/logger"
import { cors } from "hono/cors"
import { getRepoTree, getUserRepos ,getRecentCommits } from "./services/github"
import { generateBrief } from "./services/gemini"
import auth from "./routes/auth"

const app = new Hono()

app.use("*", logger())
app.use("*", cors({
  origin: "http://localhost:3000",
  credentials: true,
}))
app.route("/auth", auth);
app.get("/health", (c) => {
  return c.json({ status: "ok", message: "RepoWind API is running" })
})
app.get("/api/brief/:owner/:repo", async (c) => {
  const { owner, repo } = c.req.param()
  console.log("API KEY:", process.env.GEMINI_API_KEY ? "loaded" : "missing")
  const [commits, tree] = await Promise.all([
    getRecentCommits(owner, repo),
    getRepoTree(owner, repo),
  ])

  const brief = await generateBrief({ name: repo, commits, tree })
  return c.json({ brief })
})
app.get("/api/repos", async (c) => {
  const repos = await getUserRepos()
  return c.json(repos)
})

export default {
  port: 8080,
  fetch: app.fetch,
}