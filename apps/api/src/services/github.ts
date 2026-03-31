
const BASE_URL = "https://api.github.com"

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github.v3+json",
})

// Get all repos for the logged in user
export async function getUserRepos(token: string) {
  const res = await fetch(`${BASE_URL}/user/repos?sort=pushed&per_page=20`, {
    headers: headers(token),
  })
  const data = await res.json()
  return data
}

// Get recent commits for a repo
export async function getRecentCommits(owner: string, repo: string, token: string) {
  const res = await fetch(
    `${BASE_URL}/repos/${owner}/${repo}/commits?per_page=10`,
    { headers: headers(token) }
  )
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

// Get file tree of a repo
export async function getRepoTree(owner: string, repo: string, token: string) {
  const res = await fetch(
    `${BASE_URL}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    { headers: headers(token) }
  )
  const data = await res.json()
  return Array.isArray(data.tree) ? data.tree : []
} 