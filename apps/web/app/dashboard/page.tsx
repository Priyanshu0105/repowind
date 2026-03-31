"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { LayoutDashboard, History, Settings, RefreshCw, LogOut, Wind } from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

interface User { username: string; avatarUrl: string }
interface Repo {
  id: number; name: string; full_name: string
  description: string | null; language: string | null
  pushed_at: string; stargazers_count: number; private: boolean
}
interface Annotation {
  file: string; line: number
  type: "repowind" | "todo" | "fixme"; comment: string
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
  Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", "C++": "#f34b7d",
  Ruby: "#701516", CSS: "#563d7c", HTML: "#e34c26",
}

const TODO_COLORS: Record<string, string> = {
  repowind: "#f87171", todo: "#f5a623", fixme: "#888"
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 30) return `${Math.floor(days / 30)}mo ago`
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return `${mins}m ago`
}

function parseBriefSections(content: string) {
  const sections: { title: string; body: string }[] = []
  const lines = content.split("\n")
  let current: { title: string; body: string } | null = null
  for (const line of lines) {
    if (/^[🔍⚡🕐⚠️🚀📌💀🔥📊]/.test(line.trim())) {
      if (current) sections.push(current)
      current = { title: line.trim(), body: "" }
    } else if (current && line.trim()) {
      current.body += (current.body ? "\n" : "") + line.replace(/^[\*\-]\s*/, "").trim()
    }
  }
  if (current) sections.push(current)
  return sections
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [repos, setRepos] = useState<Repo[]>([])
  const [filtered, setFiltered] = useState<Repo[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null)
  const [briefLoading, setBriefLoading] = useState(false)
  const [brief, setBrief] = useState<string | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeNav, setActiveNav] = useState("dashboard")

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch(`${API}/auth/me`, { credentials: "include" })
        const meData = await meRes.json()
        if (!meData.user) { router.push("/"); return }
        setUser(meData.user)
        const repoRes = await fetch(`${API}/api/repos`, { credentials: "include" })
        const repoData = await repoRes.json()
        const list = Array.isArray(repoData) ? repoData : []
        setRepos(list)
        setFiltered(list)
      } catch {
        setError("Failed to connect to API.")
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(repos.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.description || "").toLowerCase().includes(q)
    ))
  }, [search, repos])

  async function generateBrief(repo: Repo) {
    const [owner, name] = repo.full_name.split("/")
    setSelectedRepo(repo)
    setBriefLoading(true)
    setBrief(null)
    setAnnotations([])
    setError(null)
    try {
      const res = await fetch(`${API}/api/brief/${owner}/${name}`, { credentials: "include" })
      const data = await res.json()
      setBrief(data.brief)
      setAnnotations(data.annotations || [])
    } catch {
      setError("Failed to generate brief.")
    } finally {
      setBriefLoading(false)
    }
  }

  async function logout() {
    await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" })
    router.push("/")
  }

  const sections = brief ? parseBriefSections(brief) : []

  return (
    <div style={{ fontFamily: "'Geist', sans-serif", background: "#0a0a0a", color: "#ededed", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid #1f1f1f", background: "#0a0a0a", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, letterSpacing: "-0.3px" }}>
          <div style={{ width: 26, height: 26, background: "#fff", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Wind size={13} color="#0a0a0a" />
          </div>
          repowind
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* API status chip */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#555", padding: "4px 10px", background: "#111", border: "1px solid #1f1f1f", borderRadius: 20, fontFamily: "'Geist Mono', monospace" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#3dd68c", display: "inline-block" }} />
            api connected
          </div>
          {user && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, border: "1px solid #222", background: "#111", fontSize: 12, color: "#888" }}>
                <img src={user.avatarUrl} alt="" style={{ width: 18, height: 18, borderRadius: "50%" }} />
                {user.username}
              </div>
              <button
                onClick={logout}
                style={{ padding: "6px 10px", borderRadius: 6, fontSize: 12, fontFamily: "inherit", cursor: "pointer", border: "1px solid #2a2a2a", background: "transparent", color: "#666", display: "flex", alignItems: "center", gap: 5 }}
              >
                <LogOut size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>

        {/* Sidebar */}
        <div style={{ width: 220, borderRight: "1px solid #1a1a1a", padding: "20px 12px", display: "flex", flexDirection: "column", gap: 2, background: "#0a0a0a", flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 10px 8px" }}>Menu</div>
          {[
            { id: "dashboard", icon: <LayoutDashboard size={14} />, label: "Dashboard" },
            { id: "history", icon: <History size={14} />, label: "History", badge: "soon" },
            { id: "settings", icon: <Settings size={14} />, label: "Settings", badge: "soon" },
          ].map(item => (
            <div
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                borderRadius: 6, fontSize: 13, color: activeNav === item.id ? "#ededed" : "#888",
                cursor: "pointer", transition: "all 0.15s", border: `1px solid ${activeNav === item.id ? "#2a2a2a" : "transparent"}`,
                background: activeNav === item.id ? "#161616" : "transparent",
              }}
            >
              <span style={{ opacity: activeNav === item.id ? 1 : 0.7 }}>{item.icon}</span>
              {item.label}
              {item.badge && (
                <span style={{ marginLeft: "auto", background: "#1f1f1f", color: "#555", fontSize: 11, padding: "1px 6px", borderRadius: 10, fontFamily: "'Geist Mono', monospace" }}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: 28, overflowY: "auto" }}>

          {/* Page header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.4px" }}>Dashboard</div>
              <div style={{ fontSize: 13, color: "#555", marginTop: 3 }}>
                {loading ? "Loading repositories..." : `${repos.length} repositories connected`}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Repositories", value: loading ? "—" : repos.length, sub: "connected" },
              { label: "Briefs generated", value: "—", sub: "this session" },
              { label: "Annotations", value: loading ? "—" : annotations.length || "—", sub: "scanned" },
              { label: "Last scanned", value: selectedRepo ? timeAgo(selectedRepo.pushed_at) : "—", sub: selectedRepo?.name || "none selected" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 8, padding: "16px 18px" }}>
                <div style={{ fontSize: 12, color: "#555", marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.5px", fontFamily: "'Geist Mono', monospace" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Two col layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>

            {/* Repo list */}
            <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #1a1a1a" }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Repositories</span>
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ height: 28, width: 160, fontSize: 12, background: "#111", border: "1px solid #222", color: "#888", borderRadius: 6, padding: "0 10px" }}
                />
              </div>
              <div>
                {loading ? (
                  <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} style={{ height: 48, background: "#1a1a1a", borderRadius: 6 }} />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div style={{ padding: "40px 20px", textAlign: "center", color: "#333", fontSize: 13 }}>No repositories found</div>
                ) : (
                  filtered.map(repo => (
                    <div
                      key={repo.id}
                      onClick={() => generateBrief(repo)}
                      style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "13px 18px", borderBottom: "1px solid #141414",
                        cursor: "pointer", transition: "all 0.15s",
                        background: selectedRepo?.id === repo.id ? "#131a13" : "transparent",
                        borderLeft: selectedRepo?.id === repo.id ? "2px solid #3dd68c" : "2px solid transparent",
                      }}
                      onMouseEnter={e => { if (selectedRepo?.id !== repo.id) (e.currentTarget as HTMLElement).style.background = "#111" }}
                      onMouseLeave={e => { if (selectedRepo?.id !== repo.id) (e.currentTarget as HTMLElement).style.background = "transparent" }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: repo.language ? (LANG_COLORS[repo.language] || "#555") : "#333" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: selectedRepo?.id === repo.id ? "#ededed" : "#ccc" }}>
                          {repo.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#555", marginTop: 2, fontFamily: "'Geist Mono', monospace" }}>
                          {repo.language || "unknown"} · {timeAgo(repo.pushed_at)}
                        </div>
                      </div>
                      {selectedRepo?.id === repo.id ? (
                        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, border: "1px solid #2a3a2a", color: "#3dd68c", background: "#0d1a0d", fontFamily: "'Geist Mono', monospace" }}>
                          selected
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, border: "1px solid #222", color: "#555", fontFamily: "'Geist Mono', monospace" }}>
                          {repo.language || "—"}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Brief panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div
                style={{
                  background: "#0f0f0f",
                  border: `1px solid ${brief ? "#2a3a2a" : "#1a1a1a"}`,
                  borderRadius: 10, overflow: "hidden",
                  transition: "border-color 0.2s"
                }}
              >
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {selectedRepo ? selectedRepo.name : "Brief"}
                  </span>
                  {brief && !briefLoading && (
                    <span style={{ marginLeft: "auto", fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "#1a2a1a", border: "1px solid #2a3a2a", color: "#3dd68c", fontFamily: "'Geist Mono', monospace" }}>
                      latest brief
                    </span>
                  )}
                  {selectedRepo && !briefLoading && (
                    <button
                      onClick={() => generateBrief(selectedRepo)}
                      style={{ marginLeft: brief ? 0 : "auto", padding: "4px 8px", borderRadius: 5, fontSize: 11, fontFamily: "inherit", cursor: "pointer", border: "1px solid #2a2a2a", background: "transparent", color: "#666", display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <RefreshCw size={10} />
                      regenerate
                    </button>
                  )}
                </div>

                <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14, minHeight: 200 }}>

                  {/* No selection */}
                  {!selectedRepo && !briefLoading && (
                    <div style={{ padding: "40px 20px", textAlign: "center", color: "#333", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Wind size={16} color="#333" />
                      </div>
                      <div>Select a repo to generate a brief</div>
                    </div>
                  )}

                  {/* Loading */}
                  {briefLoading && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#555" }}>
                        <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#3dd68c", animation: "pulse 2s infinite" }} />
                        Scanning with Gemini AI...
                      </div>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} style={{ height: 12, background: "#1a1a1a", borderRadius: 4, width: i % 2 === 0 ? "100%" : "70%" }} />
                      ))}
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid #3a1a1a", background: "#1a0a0a", fontSize: 12, color: "#f87171" }}>
                      {error}
                    </div>
                  )}

                  {/* Brief sections */}
                  {brief && !briefLoading && sections.map((section, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 10, fontWeight: 500, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                        {section.title}
                      </div>
                      <div style={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
                        {section.body}
                      </div>
                    </div>
                  ))}

                  {/* Stack tags */}
                  {brief && !briefLoading && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 500, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Stack</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {selectedRepo?.language && (
                          <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 4, border: "1px solid #1f1f1f", color: "#666", background: "#0a0a0a", fontFamily: "'Geist Mono', monospace" }}>
                            {selectedRepo.language}
                          </span>
                        )}
                        <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 4, border: "1px solid #1f1f1f", color: "#666", background: "#0a0a0a", fontFamily: "'Geist Mono', monospace" }}>Gemini</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Annotations panel */}
              {annotations.length > 0 && !briefLoading && (
                <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 10, overflow: "hidden", marginTop: 16 }}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Annotations</span>
                    <span style={{ marginLeft: "auto", background: "#1f1f1f", color: "#666", fontSize: 11, padding: "1px 6px", borderRadius: 10, fontFamily: "'Geist Mono', monospace" }}>
                      {annotations.length}
                    </span>
                  </div>
                  <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {annotations.map((a, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "#777", padding: "4px 0" }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", marginTop: 5, flexShrink: 0, background: TODO_COLORS[a.type] }} />
                        <div>
                          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "#444" }}>{a.file}:{a.line} </span>
                          {a.comment}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&family=Geist:wght@300;400;500;600&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 3px; }
      `}</style>
    </div>
  )
}