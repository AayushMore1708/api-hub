import { db } from "@/index";
import { sql } from "drizzle-orm";
import YAML from "yaml";
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { api_docs } from "@/db/schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

const embedCache: Record<string, number[]> = {};

// Official sources of OpenAPI specs
export const OFFICIAL_SPECS: Record<string, string[]> = {
  stripe: ["https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json"],
  github: ["https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.yaml"],
  twilio: ["https://raw.githubusercontent.com/twilio/twilio-oai/main/spec/yaml/twilio_api_v2010.yaml"],
};

// Utility: chunk large text into ~15k-character parts
function chunkText(text: string, size = 15000): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

// Generate embeddings with caching
async function getEmbedding(text: string): Promise<number[]> {
  if (embedCache[text]) return embedCache[text];
  const res = await embedModel.embedContent(text);
  embedCache[text] = res.embedding.values;
  return embedCache[text];
}

// Normalize Stripe-like specs that use `x-stripeOperations`
function normalizeSpec(spec: any) {
  if (!spec.paths && Array.isArray(spec["x-stripeOperations"])) {
    const paths: Record<string, any> = {};
    for (const op of spec["x-stripeOperations"]) {
      const path = op.path;
      const method = op.method?.toLowerCase?.() || "get";
      if (!paths[path]) paths[path] = {};
      paths[path][method] = {
        summary: op.operationId || "",
        description: op.description || "",
      };
    }
    spec.paths = paths;
  }
  return spec;
}

// Main seeding function
export async function seedDocs(library: string) {
  console.log(`\n🚀 Seeding docs for: ${library}`);

  // Check if library already seeded
  const existing = await db.execute(
    sql`SELECT COUNT(*) FROM api_docs WHERE library = ${library}`
  );
  const count = Number(existing.rows[0].count);
  if (count > 0) {
    console.log(`⏩ ${library} docs already exist (${count} rows) — skipping.`);
    return;
  }

  // Get official URLs
  const urls = OFFICIAL_SPECS[library];
  if (!urls) {
    console.warn(`⚠️ No official spec found for ${library}`);
    return;
  }

  console.log(`🌐 Fetching spec from ${urls[0]} ...`);
  const res = await fetch(urls[0]);
  const text = await res.text();

  // Parse JSON or YAML
  let spec: any;
  try {
    if (urls[0].endsWith(".yaml") || urls[0].endsWith(".yml")) {
      spec = YAML.parse(text);
    } else {
      spec = JSON.parse(text);
    }
  } catch (err) {
    console.error(`❌ Failed to parse spec for ${library}:`, err);
    return;
  }

  // Normalize (Stripe etc.)
  spec = normalizeSpec(spec);
  if (!spec.paths) {
    console.warn(`⚠️ No paths found in ${library} spec — skipping.`);
    return;
  }

  const pathsContent = JSON.stringify({ paths: spec.paths }, null, 2);
  const chunks = chunkText(pathsContent, 15000).slice(0, 12);

  console.log(`✂️ Split into ${chunks.length} chunks for embedding...`);

  const embeddings = await Promise.all(
    chunks.map((chunk, i) =>
      new Promise<number[]>(resolve =>
        setTimeout(async () => {
          console.log(`🧠 Embedding chunk ${i + 1}/${chunks.length}...`);
          resolve(await getEmbedding(chunk));
        }, i * 200)
      )
    )
  );

  // Insert into DB
  console.log(`💾 Inserting ${chunks.length} chunks into database...`);
  await db.transaction(async (tx) => {
    for (let i = 0; i < chunks.length; i++) {
      await tx.insert(api_docs).values({
        library,
        source: "official",
        url: urls[0],
        content: chunks[i],
        vector: embeddings[i],
      });
      console.log(`✅ Inserted chunk ${i + 1}/${chunks.length} for ${library}`);
    }
  });

  console.log(`🎉 Done seeding ${library} docs.\n`);
}

// Run multiple libraries at once
export async function seedAll() {
  for (const lib of Object.keys(OFFICIAL_SPECS)) {
    await seedDocs(lib);
  }
  console.log("🌍 All official specs seeded.");
}
