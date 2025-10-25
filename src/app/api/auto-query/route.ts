import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/index";
import {
  getEmbedding,
  generateAnswer,
  cosineSimilarity,
} from "@/app/services/apiService";
import { api_docs } from "@/db/schema";
import { OFFICIAL_SPECS } from "@/app/scripts/seedDocs";

const queryCache: Record<string, string> = {};

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: "Missing query" }, { status: 400 });

    const libraries = Object.keys(OFFICIAL_SPECS);
    const foundLibrary = libraries.find(l => query.toLowerCase().includes(l));

    if (queryCache[query]) {
      return NextResponse.json({ answer: queryCache[query] });
    }

    const queryVector = await getEmbedding(query);

    const allRows = await db
      .select()
      .from(api_docs)
      .where(foundLibrary ? sql`library = ${foundLibrary}` : sql`TRUE`);

    const scored = (allRows as any[])
      .map(r => ({ ...r, distance: cosineSimilarity(r.vector, queryVector) }))
      .sort((a, b) => a.distance - b.distance);

    const withPaths = scored.filter(r => r.content.includes('"paths"') || r.content.includes('/'));
    const top = (withPaths.length ? withPaths : scored).slice(0, 4);

    const context = top
      .map(r => (r as any).content)
      .join("\n\n")
      .replace(/\\n/g, "\n")
      .slice(0, 40000);

    if (!context.includes('/')) {
      return NextResponse.json({
        answer: "⚠️ No endpoint definitions found in nearby docs.",
      });
    }

    const answer = await generateAnswer(query, context, foundLibrary);
    queryCache[query] = answer;
    return NextResponse.json({ answer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
