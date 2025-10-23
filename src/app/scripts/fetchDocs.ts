import { db } from "@/index";
import { api_docs } from "@/db/schema";
import fetch from "node-fetch";
import YAML from "yaml";
import pLimit from "p-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

function chunkText(text: string, size = 10000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

// Official OpenAPI spec URLs for popular APIs
const OFFICIAL_SPECS: Record<string, string[]> = {
  stripe: [
    "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.yaml",
  ],
  notion: [
    "https://raw.githubusercontent.com/notionhq/notion-openapi/main/notion-openapi.yaml",
  ],
  openai: [
    "https://raw.githubusercontent.com/openai/openai-openapi/master/openapi.yaml",
  ],
  github: [
    "https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.yaml",
  ],
};

// --- helper: fetch raw content safely
async function fetchRawFile(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { 
      timeout: 30000,
      headers: {
        "User-Agent": "API-Hub",
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    console.error(`Failed to fetch ${url}:`, err);
    return null;
  }
}

// Fetch official API specs and store with embeddings
async function fetchOfficialDocs(library: string, maxChunks?: number) {
  const urls = OFFICIAL_SPECS[library];
  if (!urls || urls.length === 0) {
    console.log(`No official specs defined for ${library}`);
    return;
  }

  console.log(`Fetching official docs for ${library}...`);

  for (const url of urls) {
    console.log(`  Fetching: ${url}`);
    const fileText = await fetchRawFile(url);
    if (!fileText) {
      console.log(`  ❌ Failed to fetch ${url}`);
      continue;
    }

    let parsed = fileText;
    try {
      if (url.endsWith(".yaml") || url.endsWith(".yml")) {
        const doc = YAML.parse(fileText);
        parsed = JSON.stringify(doc, null, 2);
      } else if (url.endsWith(".json")) {
        parsed = JSON.stringify(JSON.parse(fileText), null, 2);
      }
    } catch (err) {
      console.error(`  ⚠️  Failed to parse ${url}:`, err);
    }

    // Split into smaller chunks for better semantic search
    let chunks = chunkText(parsed);
    
    // Limit chunks if maxChunks is specified
    if (maxChunks && chunks.length > maxChunks) {
      console.log(`  ⚡ Quick mode: Limiting to first ${maxChunks} chunks (out of ${chunks.length})`);
      chunks = chunks.slice(0, maxChunks);
    }
    
    console.log(`  Processing ${chunks.length} chunks with parallel processing...`);

    // Process chunks in parallel with rate limiting (10 concurrent requests)
    const limit = pLimit(10);
    let processed = 0;

    await Promise.all(
      chunks.map((chunk, i) =>
        limit(async () => {
          try {
            // Get embedding for chunk
            const embedding = await embedModel.embedContent(chunk);

            await db.insert(api_docs).values({
              library,
              source: "official",
              url,
              content: chunk,
              vector: embedding.embedding.values, // Store the values array as JSONB
            });
            
            processed++;
            if (processed % 50 === 0) {
              console.log(`    Processed ${processed}/${chunks.length} chunks`);
            }
          } catch (err: any) {
            console.error(`  ⚠️  Error processing chunk ${i + 1}:`, err.message);
          }
        })
      )
    );
    
    console.log(`  ✅ Completed ${url} - ${processed}/${chunks.length} chunks processed`);
  }
}

// Legacy function: Fetch from GitHub search
async function fetchDocsFromGitHub(library: string) {
  console.log(`Searching GitHub for ${library} API specs...`);
  const githubSearch = await fetch(
    `https://api.github.com/search/code?q=openapi+${library}+in:file+filename:openapi.yaml+filename:swagger.yaml+filename:spec.yaml+extension:yaml+extension:json`,
    {
      headers: {
        "User-Agent": "API-Hub",
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    }
  );

  const data = await githubSearch.json();
  const items = data.items?.slice(0, 15) || [];
  const limit = pLimit(3);

  await Promise.all(
    items.map((item: any) =>
      limit(async () => {
        const htmlUrl = item.html_url;
        const rawUrl = htmlUrl
          .replace("https://github.com/", "https://raw.githubusercontent.com/")
          .replace("/blob/", "/");
          
        const fileText = await fetchRawFile(rawUrl);
        if (!fileText) return;

        let parsed = fileText;
        try {
          if (htmlUrl.endsWith(".yaml") || htmlUrl.endsWith(".yml")) {
            const doc = YAML.parse(fileText);
            parsed = JSON.stringify(doc, null, 2);
          } else if (htmlUrl.endsWith(".json")) {
            parsed = JSON.stringify(JSON.parse(fileText), null, 2);
          }
        } catch {}

        const chunks = chunkText(parsed);
        for (const chunk of chunks) {
          try {
            // Get embedding for chunk
            const embedding = await embedModel.embedContent(chunk);

            await db.insert(api_docs).values({
              library,
              source: "github",
              url: htmlUrl,
              content: chunk,
              vector: embedding.embedding.values, // Store the values array as JSONB
            });
          } catch (err: any) {
            if (err.message?.includes("payload size exceeds")) {
              // Optionally log or handle oversized chunks
            }
          }
        }
      })
    )
  );
}

// Main execution: Fetch official docs for multiple libraries
console.log("🚀 Starting API documentation fetch...\n");

// Get command line arguments for quick testing
const args = process.argv.slice(2);
const quickMode = args.includes("--quick");
const library = args.find(arg => !arg.startsWith("--"));
const maxChunks = quickMode ? 50 : undefined;

if (quickMode) {
  console.log("⚡ Quick mode: Processing first 50 chunks only per API\n");
}

// Fetch specific library or all
if (library && OFFICIAL_SPECS[library]) {
  console.log(`📚 Fetching only: ${library}\n`);
  await fetchOfficialDocs(library, maxChunks);
} else {
  // Fetch all libraries
  await fetchOfficialDocs("stripe", maxChunks);
  await fetchOfficialDocs("notion", maxChunks);
  await fetchOfficialDocs("openai", maxChunks);
  await fetchOfficialDocs("github", maxChunks);
}

console.log("\n✅ All documentation fetched successfully!");