// app/api/query/route.ts
import { NextResponse } from "next/server";
import { db } from "@/index";
import { sql } from "drizzle-orm";
import YAML from "yaml";
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api_docs } from "@/db/schema";

// 🔹 Initialize Gemini models once
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// 🔹 Simple in-memory cache to avoid re-fetching
const specCache: Record<string, any> = {};
const embedCache: Record<string, number[]> = {};

function chunkText(text: string, size = 15000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size));
  return chunks;
}

const OFFICIAL_SPECS: Record<string, string[]> = {
  stripe: ["https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.yaml"],
  openai: ["https://raw.githubusercontent.com/openai/openapi/master/openapi.yaml"],
  github: ["https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.yaml"],
  twilio: ["https://raw.githubusercontent.com/twilio/twilio-oai/main/spec/yaml/twilio_api_v2010.yaml"],
};

// 🔹 Embed text with caching
async function getEmbedding(text: string): Promise<number[]> {
  if (embedCache[text]) return embedCache[text];
  const res = await embedModel.embedContent(text);
  embedCache[text] = res.embedding.values;
  return embedCache[text];
}
// 🔹 Fetch and store docs (runs in background)
async function seedDocs(library: string) {
  try {
    const existing = await db.execute(sql`SELECT COUNT(*) FROM api_docs WHERE library = ${library}`);
    if (Number(existing.rows[0].count) > 0) return;

    if (specCache[library]) return; // already fetched
    const urls = OFFICIAL_SPECS[library];
    if (!urls) return;

    const res = await fetch(urls[0]);
    const text = await res.text();

    let spec;
    try {
      spec = urls[0].endsWith(".yaml") || urls[0].endsWith(".yml") ? YAML.parse(text) : JSON.parse(text);
    } catch {
      return;
    }

    if (!spec?.paths) return;
    specCache[library] = spec;

    const pathsContent = JSON.stringify({ paths: spec.paths }, null, 2);
    const chunks = chunkText(pathsContent, 15000).slice(0, 12);

    // Parallel embed with slight delay to avoid throttling
    const embeddings = await Promise.all(
      chunks.map((chunk, i) =>
        new Promise<number[]>(resolve =>
          setTimeout(async () => resolve(await getEmbedding(chunk)), i * 150)
        )
      )
    );

    await db.transaction(async (tx) => {
      for (let i = 0; i < chunks.length; i++) {
        await tx.insert(api_docs).values({
          library,
          source: "official",
          url: urls[0],
          content: chunks[i],
          vector: embeddings[i],
        });
      }
    });

    console.log(`✅ Seeded ${library} docs (${chunks.length} chunks)`);
  } catch (err) {
    console.error("Seed error:", err);
  }
}
function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return 1 - dot / (magA * magB); // lower = closer
}

// 🔹 Generate answer fast
async function generateAnswer(query: string, context: string, library?: string) {
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
  return result.response.text();
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    const libraries = Object.keys(OFFICIAL_SPECS);
    const foundLibrary = libraries.find(l => query.toLowerCase().includes(l));

    // 🚀 Start seeding in background immediately (non-blocking)
    if (foundLibrary) seedDocs(foundLibrary).catch(console.error);

    // 🚀 Embed query fast (cached)
    const queryVector = await getEmbedding(query);

    // 🚀 Try to fetch similar docs if already seeded
    const allRows = await db.select().from(api_docs)
      .where(foundLibrary ? sql`library = ${foundLibrary}` : sql`TRUE`);

    const rows = (allRows as any[])
      .map(r => ({
        ...r,
        distance: cosineSimilarity(r.vector, queryVector),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8);


    // ⚡ Return placeholder if no docs yet
    if (!rows || rows.length === 0) {
      return NextResponse.json({
        answer: `⏳ Preparing documentation for "${foundLibrary || query}"...  
Please retry in a few seconds.`,
        initializing: true
      });
    }

    const context = rows.map(r => (r as any).content).join("\n\n");
    const answer = await generateAnswer(query, context, foundLibrary);
    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error("Query error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
