import { db } from "@/index";
import { sql } from "drizzle-orm";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api_docs } from "@/db/schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const embedCache: Record<string, number[]> = {};

export async function getEmbedding(text: string): Promise<number[]> {
  if (embedCache[text]) {
    return embedCache[text];
  }
  const res = await embedModel.embedContent(text);
  embedCache[text] = res.embedding.values;
  return embedCache[text];
}

export function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return 1 - dot / (magA * magB);
}

export async function searchDocs(query: string, library?: string) {
  const queryVector = await getEmbedding(query);
  const allRows = await db
    .select()
    .from(api_docs)
    .where(library ? sql`library = ${library}` : sql`TRUE`);
  const rows = (allRows as any[])
    .map(r => ({
      ...r,
      distance: cosineSimilarity(r.vector, queryVector),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 8);
  return rows;
}

export async function generateAnswer(query: string, context: string, library?: string) {
  const prompt = `You are an API documentation extractor.
From the OpenAPI specification paths context below, extract and output all REST API endpoints grouped by HTTP method in markdown format.

For each method, list endpoints with:
* **Path:** \`/path\`
* **Description:** short description
* **Key Parameters:**
  * name: description (type)

No summaries or JSON. Only markdown.

# ${library?.toUpperCase() || "API"} REST Endpoints
${context}
Question: ${query}`;
  const result = await chatModel.generateContent(prompt);
  const answer = result.response.text();
  return answer;
}
