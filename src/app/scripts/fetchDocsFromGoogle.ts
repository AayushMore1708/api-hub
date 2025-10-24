import { googleCustomSearch } from "@/utils/googleSearch";
import pLimit from "p-limit";
import YAML from "yaml";
import { fetchRawFile, chunkText } from "./fetchDocs";
import { embedModel } from "../../db/embedModel";
import { api_docs } from "../../db/schema";
import { db } from "@/index";


export async function fetchDocsFromGoogle(library: string, maxChunks?: number) {
  const query = `${library} openapi OR swagger filetype:yaml OR filetype:json`;
  const results = await googleCustomSearch(query);

  if (!results || results.length === 0) {
    return;
  }

  const limit = pLimit(3);
  await Promise.all(
    results.map((result: any) =>
      limit(async () => {
        const url = result.link;
        const fileText = await fetchRawFile(url);
        if (!fileText) return;

        let parsed = fileText;
        try {
          if (url.endsWith(".yaml") || url.endsWith(".yml")) {
            const doc = YAML.parse(fileText);
            parsed = JSON.stringify(doc, null, 2);
          } else if (url.endsWith(".json")) {
            parsed = JSON.stringify(JSON.parse(fileText), null, 2);
          }
        } catch {}

        let chunks = chunkText(parsed);
        if (maxChunks && chunks.length > maxChunks) {
          chunks = chunks.slice(0, maxChunks);
        }

        for (const chunk of chunks) {
          try {
            const embedding = await embedModel.embedContent(chunk);
            await db.insert(api_docs).values({
              library,
              source: "google",
              url,
              content: chunk,
              vector: embedding.embedding.values,
            });
          } catch (err: any) {
            console.error("Embedding or DB insert error:", err);
          }
        }
      })
    )
  );
}
