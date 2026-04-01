"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Wind, Zap, GitBranch, Search, ArrowRight, Lock } from "lucide-react"

const API = process.env.API_URL 

const FEATURES = [
  {
    icon: <Zap size={16} className="text-yellow-500" />,
    title: "AI-powered briefs",
    desc: "Gemini scans your commits and files to generate an instant context summary.",
  },
  {
    icon: <Search size={16} className="text-blue-400" />,
    title: "Code scanner",
    desc: "Extracts // repowind tags, TODOs, and complexity hotspots automatically.",
  },
  {
    icon: <GitBranch size={16} className="text-green-400" />,
    title: "Diff-aware",
    desc: "Shows exactly what changed since you last opened the repo.",
  },
  {
    icon: <Lock size={16} className="text-purple-400" />,
    title: "Your repos only",
    desc: "OAuth login means RepoWind only ever sees your own repositories.",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-zinc-950">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center">
            <Wind size={14} className="text-black" />
          </div>
          <span className="font-semibold text-sm tracking-tight">RepoWind</span>
        </div>
        <a href={`${API}/auth/github`}>
          <Button size="sm" className="h-8 text-xs bg-white text-black hover:bg-zinc-200 gap-1.5">
            Login with GitHub
            <ArrowRight size={12} />
          </Button>
        </a>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <Badge
          variant="outline"
          className="mb-6 text-xs border-zinc-700 text-zinc-400 bg-zinc-900"
        >
          Powered by Gemini AI
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl">
          Resume any codebase
          <br />
          <span className="text-zinc-500">in seconds.</span>
        </h1>

        <p className="mt-6 text-sm text-zinc-500 max-w-md leading-relaxed">
          RepoWind scans your GitHub repos — commits, files, and your own{" "}
          <code className="mx-1 px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-mono">
            // repowind
          </code>{" "}
          tags — and generates an AI brief so you always know where you left off.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <a href={`${API}/auth/github`}>
            <Button className="h-9 px-5 text-sm bg-white text-black hover:bg-zinc-200 gap-2">
              <Wind size={14} />
              Get started free
            </Button>
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            <Button
              variant="outline"
              className="h-9 px-5 text-sm border-zinc-700 bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white"
            >
              View on GitHub
            </Button>
          </a>
        </div>

        <Separator className="my-16 bg-zinc-800 max-w-lg w-full" />

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full text-left">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  {f.icon}
                </div>
                <span className="text-sm font-medium">{f.title}</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Sample brief preview */}
        <div className="mt-12 max-w-2xl w-full rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-left">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-zinc-500 font-mono">sample brief output</span>
          </div>
          <div className="space-y-2 font-mono text-xs">
            <p className="text-white">🔍 WHAT IS THIS:</p>
            <p className="text-zinc-400 pl-3">A full-stack developer tool that generates AI context briefs for GitHub repos.</p>
            <p className="text-white mt-3">⚡ STACK DETECTED:</p>
            <p className="text-zinc-400 pl-3">• Bun + Hono (API)</p>
            <p className="text-zinc-400 pl-3">• Next.js + Tailwind (Web)</p>
            <p className="text-zinc-400 pl-3">• Google Gemini AI</p>
            <p className="text-white mt-3">🕐 LAST WORKING ON:</p>
            <p className="text-zinc-400 pl-3">GitHub OAuth flow and JWT session management</p>
            <p className="text-white mt-3">🚀 YOUR NEXT STEP:</p>
            <p className="text-zinc-400 pl-3">Complete the code scanner service and wire it into the brief pipeline.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-4 flex items-center justify-between bg-zinc-950">
        <span className="text-xs text-zinc-600">Built by Priyanshu</span>
        <span className="text-xs text-zinc-700">RepoWind © 2025</span>
      </footer>
    </div>
  )
}