import { db } from "@/index";
import { api_docs } from "@/db/schema";
import fetch from "node-fetch";
import YAML from "yaml";
import pLimit from "p-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export function chunkText(text: string, size = 10000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

const OFFICIAL_SPECS: Record<string, string[]> = {
  stripe: [
    "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.yaml",
  ],
  openai: [
    "https://raw.githubusercontent.com/openai/openai-openapi/master/openapi.yaml",
  ],
  github: [
    "https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.yaml",
  ],
  twilio: [
    "https://raw.githubusercontent.com/twilio/twilio-oai/main/spec/yaml/twilio_api_v2010.yaml",
  ],
};

 export async function fetchRawFile(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      timeout: 30000,
      headers: {
        "User-Agent": "API-Hub",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    console.error(`Failed to fetch ${url}:`, err);
    return null;
  }
}

async function fetchOfficialDocs(library: string, maxChunks?: number) {
  const urls = OFFICIAL_SPECS[library];
  if (!urls || urls.length === 0) {
    return;
  }

  for (const url of urls) {
    const fileText = await fetchRawFile(url);
    if (!fileText) {
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

    let chunks = chunkText(parsed);
    if (maxChunks && chunks.length > maxChunks) {
      chunks = chunks.slice(0, maxChunks);
    }

    const limit = pLimit(10);
    let processed = 0;

    await Promise.all(
      chunks.map((chunk, i) =>
        limit(async () => {
          try {
            const embedding = await embedModel.embedContent(chunk);
            await db.insert(api_docs).values({
              library,
              source: "official",
              url,
              content: chunk,
              vector: embedding.embedding.values,
            });
            processed++;
            if (processed % 50 === 0) {
            }
          } catch (err: any) {
            console.error(`  ⚠️  Error processing chunk ${i + 1}:`, err.message);
          }
        })
      )
    );
  }
}

async function fetchDocsFromGitHub(library: string) {
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
            const embedding = await embedModel.embedContent(chunk);
            await db.insert(api_docs).values({
              library,
              source: "github",
              url: htmlUrl,
              content: chunk,
              vector: embedding.embedding.values,
            });
          } catch (err: any) {
            if (err.message?.includes("payload size exceeds")) {}
          }
        }
      })
    )
  );
}


const args = process.argv.slice(2);
const quickMode = args.includes("--quick");
const library = args.find(arg => !arg.startsWith("--"));
const maxChunks = quickMode ? 50 : undefined;

if (quickMode) {
}

if (library && OFFICIAL_SPECS[library]) {
  await fetchOfficialDocs(library, maxChunks);
} else {
  await fetchOfficialDocs("stripe", maxChunks);
  await fetchOfficialDocs("notion", maxChunks);
  await fetchOfficialDocs("openai", maxChunks);
  await fetchOfficialDocs("github", maxChunks);
}

