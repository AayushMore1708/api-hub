import { db } from "@/index";
import { api_docs } from "@/db/schema";
import { eq } from "drizzle-orm";
import fetch from "node-fetch";
import YAML from "yaml";
import pLimit from "p-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

function chunkText(text: string, size = 25000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

// --- helper: fetch raw content safely
async function fetchRawFile(htmlUrl: string): Promise<string | null> {
  const rawUrl = htmlUrl
    .replace("https://github.com/", "https://raw.githubusercontent.com/")
    .replace("/blob/", "/");

  try {
    const res = await fetch(rawUrl, { timeout: 10000 });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    return null;
  }
}

async function fetchDocs(library: string) {

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
        const fileText = await fetchRawFile(htmlUrl);
        if (!fileText) return;

        let parsed = fileText;
        try {
          if (htmlUrl.endsWith(".yaml") || htmlUrl.endsWith(".yml")) {
            const doc = YAML.parse(fileText);
            parsed = JSON.stringify(doc, null, 2);
          } else if (htmlUrl.endsWith(".json")) {
            parsed = JSON.stringify(JSON.parse(fileText), null, 2);
          }
        } catch {
        }

        const chunks = chunkText(parsed);
        for (const chunk of chunks) {
          try {
            const embedding = await embedModel.embedContent(chunk);

            await db.insert(api_docs).values({
              library,
              source: "github",
              url: htmlUrl,
              content: chunk,
              vector: embedding.embedding,
            });

          } catch (err: any) {
            if (err.message.includes("payload size exceeds")) {
            }
          }
        }
      })
    )
  );

}

await fetchDocs("stripe");
await fetchDocs("notion");
await fetchDocs("openai");
