import { GoogleGenerativeAI } from "@google/generative-ai"
import type { Annotation } from "./scanner"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

export async function generateBrief(repoData: {
  name: string
  commits: any[]
  tree: any[]
  annotations: Annotation[]
}) {
  try {
    const commits = repoData.commits
      .slice(0, 10)
      .map((c: any) => `- ${c.commit.message}`)
      .join("\n")

    const files = repoData.tree
      .slice(0, 40)
      .map((f: any) => f.path)
      .join(", ")

    const annotationText = repoData.annotations.length > 0
      ? repoData.annotations
          .map(a => `- [${a.type.toUpperCase()}] ${a.file}:${a.line} → ${a.comment}`)
          .join("\n")
      : "None found"

    const prompt = `
You are RepoWind, an expert senior software engineer helping a developer resume work.

Your job:
- Be concise, specific, and actionable
- Avoid generic statements
- Infer intent from commits + files + annotations

Repo Name: ${repoData.name}

Recent Commits:
${commits}

Project Files:
${files}

Developer Annotations:
${annotationText}

Return STRICTLY in this format:

🔍 WHAT IS THIS:
(1-2 sentence clear description)

⚡ STACK DETECTED:
(bullet points)

🕐 LAST WORKING ON:
(specific feature or area)

⚠️ LOOKS UNFINISHED:
(bullet points of gaps or risks)

🚀 YOUR NEXT STEP:
(1 clear actionable step)
`

    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (err) {
    console.error("AI Error:", err)
    return "Failed to generate brief. Please try again."
  }
}