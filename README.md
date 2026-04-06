# RepoWind 🌬️

> Instantly resume any codebase with AI-generated context briefs.

RepoWind scans your GitHub repositories — commits, file trees, and your own `// repowind` tags — and generates a structured brief so you always know what you were building and where to start.

## Features

- **AI-powered briefs** — Gemini AI analyzes your commits and files to generate an instant context summary
- **Code scanner** — Automatically extracts `// repowind` tags, TODOs, and FIXMEs from your codebase
- **GitHub OAuth** — Secure login with GitHub, access your own repositories
- **Complexity hints** — Flags large files and untouched code automatically
- **Clean dashboard** — Vercel-inspired dark UI built with Next.js and shadcn/ui

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Bun + Hono |
| Frontend | Next.js + Tailwind + shadcn/ui |
| AI | Google Gemini 2.5 Flash |
| Auth | GitHub OAuth 2.0 + JWT |
| Deployment | Railway |

## Getting Started

### Prerequisites
- Bun installed
- GitHub OAuth App credentials
- Gemini API key

### Setup
```bash
# Clone the repo
git clone https://github.com/yourusername/repowind
cd repowind

# Install dependencies
bun install

# Setup environment variables
cp apps/api/.env.example apps/api/.env
# Fill in your keys
```

### Environment Variables

**`apps/api/.env`**
```
GEMINI_API_KEY=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
SESSION_SECRET=
API_URL=http://localhost:8080
WEB_URL=http://localhost:3000
NODE_ENV=development
PORT=8080
```

**`apps/web/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Run locally
```bash
# Terminal 1 — API
cd apps/api && bun run dev

# Terminal 2 — Frontend  
cd apps/web && bun run dev
```

Visit `http://localhost:3000`

## How it works

1. Login with GitHub
2. Select any repository from your dashboard
3. RepoWind fetches recent commits and file tree
4. Gemini AI generates a structured brief
5. Code scanner extracts `// repowind`, TODO, and FIXME annotations
6. You know exactly where you left off

## The `// repowind` tag

Leave breadcrumbs in your own code:
```ts
// repowind: auth flow is half done, JWT needs rotating
// repowind: this component breaks on mobile, fix before launch
```

RepoWind picks these up automatically and surfaces them in your brief.

## Project Structure
```
repowind/
├── apps/
│   ├── api/          # Hono + Bun backend
│   │   └── src/
│   │       ├── lib/            # JWT session helpers
│   │       ├── middleware/     # Auth middleware
│   │       ├── routes/         # API routes
│   │       └── services/       # GitHub, Gemini, Scanner
│   └── web/          # Next.js frontend
│       └── app/
│           ├── page.tsx        # Landing page
│           └── dashboard/      # Main dashboard
└── package.json
```

## License

MIT
