import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

export async function generateBrief(repoData: { name: string; commits: any[]; tree: any[] }) {
  const prompt = `You are RepoWind, an expert code analyst. A developer is returning to their codebase after months away.
Analyze this and give a sharp, professional catchup brief.

Repo: ${repoData.name}
Recent commits: ${repoData.commits.map((c: any) => c.commit.message).join(", ")}
Files: ${repoData.tree.slice(0, 50).map((f: any) => f.path).join(", ")}

Respond in this format:
🔍 WHAT IS THIS:
⚡ STACK DETECTED:
🕐 LAST WORKING ON:
⚠️ LOOKS UNFINISHED:
🚀 YOUR NEXT STEP:`

  const result = await model.generateContent(prompt)
  return result.response.text()
}
