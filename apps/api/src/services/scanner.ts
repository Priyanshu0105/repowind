const BASE_URL = "https://api.github.com"

export interface Annotation {
  file: string
  line: number
  type: "repowind" | "todo" | "fixme"
  comment: string
}

const SKIP_DIRS = ["node_modules", "dist", ".git", ".next", "build", "vendor"]
const CODE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".java", ".cpp", ".c"]

export async function scanRepo(
  owner: string,
  repo: string,
  token: string,
  tree: any[]
): Promise<Annotation[]> {
  
  // 1. filter tree to only scannable files
  const files = tree.filter((f: any) => {
    if (f.type !== "blob") return false
    if (SKIP_DIRS.some(dir => f.path.includes(dir))) return false
    if (!CODE_EXTENSIONS.some(ext => f.path.endsWith(ext))) return false
    return true
  })

  // 2. fetch and scan each file (limit to 30 to avoid rate limits)
  const annotations: Annotation[] = []

  await Promise.all(
    files.slice(0, 30).map(async (file: any) => {
      const found = await scanFile(owner, repo, file.path, token)
      annotations.push(...found)
    })
  )

  return annotations
}

async function scanFile(
  owner: string,
  repo: string,
  path: string,
  token: string
): Promise<Annotation[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    )

    const data = await res.json() as any
    if (!data.content) return []

    // GitHub returns file content as base64
    const content = atob(data.content.replace(/\n/g, ""))
    const lines = content.split("\n")
    const annotations: Annotation[] = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()

      if (/\/\/\s*repowind[:\s]/i.test(trimmed)) {
        annotations.push({
          file: path,
          line: index + 1,
          type: "repowind",
          comment: trimmed.replace(/\/\/\s*repowind[:\s]*/i, "").trim(),
        })
      } else if (/\/\/\s*TODO[:\s]/i.test(trimmed) || /#\s*TODO[:\s]/i.test(trimmed)) {
        annotations.push({
          file: path,
          line: index + 1,
          type: "todo",
          comment: trimmed.replace(/\/\/\s*TODO[:\s]*/i, "").replace(/#\s*TODO[:\s]*/i, "").trim(),
        })
      } else if (/\/\/\s*FIXME[:\s]/i.test(trimmed) || /#\s*FIXME[:\s]/i.test(trimmed)) {
        annotations.push({
          file: path,
          line: index + 1,
          type: "fixme",
          comment: trimmed.replace(/\/\/\s*FIXME[:\s]*/i, "").replace(/#\s*FIXME[:\s]*/i, "").trim(),
        })
      }
    })

    return annotations
  } catch {
    return []  // if a file fails, skip it silently
  }
}