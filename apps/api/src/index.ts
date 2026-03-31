import { Hono } from "hono"
import { logger } from "hono/logger"
import { cors } from "hono/cors"
import { getRepoTree, getUserRepos ,getRecentCommits } from "./services/github"
import { requireAuth } from "./middleware/auth"
import { generateBrief } from "./services/gemini"
import { scanRepo } from "./services/scanner"
import auth from "./routes/auth"
import type { SessionUser } from "./lib/session" 

type Env = {
  Variables: {
    user: SessionUser  // ← tells TypeScript what c.get("user") returns
  }
}

const app = new Hono<Env>()  

app.use("*", logger())
app.use("*", cors({
  origin: process.env.WEB_URL || "http://localhost:3000",
  credentials: true,
}))
app.route("/auth", auth);
app.get("/health", (c) => {
  return c.json({ status: "ok", message: "RepoWind API is running" })
})
app.get("/api/brief/:owner/:repo",requireAuth, async (c) => {
  const { owner, repo } = c.req.param()
  const user = c.get("user")
  console.log("API KEY:", process.env.GEMINI_API_KEY ? "loaded" : "missing")
  const [commits, tree] = await Promise.all([
    getRecentCommits(owner, repo ,user.accessToken),
    getRepoTree(owner, repo, user.accessToken),
  ])
  const annotations = await scanRepo(owner, repo, user.accessToken, tree)
  const brief = await generateBrief({ name: repo, commits, tree , annotations })
  return c.json({ brief , annotations })
})
app.get("/api/repos",requireAuth, async (c) => {
  const user = c.get("user")
  const repos = await getUserRepos(user.accessToken)
  return c.json(repos)
})

export default {
  port: 8080,
  fetch: app.fetch,
}