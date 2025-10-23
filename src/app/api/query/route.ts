import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/index";
import { sql } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const embedModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));

  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid query text." },
        { status: 400 }
      );
    }


    const embedding = await embedModel.embedContent(query);
    const queryVector = embedding.embedding.values as number[];

    const allDocs = await db.execute(sql`
      SELECT id, content, vector
      FROM api_docs
      WHERE vector IS NOT NULL
    `);

    const docsWithScores = allDocs.rows.map((doc: any) => {
      const docVector = doc.vector as number[];
      const similarity = cosineSimilarity(queryVector, docVector);
      return { content: doc.content, similarity };
    });

    const topResults = docsWithScores
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    const context = topResults.map((r) => r.content).join("\n\n");

    const prompt = `
You are an API documentation assistant for developers.

Use the provided context to answer the user's query in a **clean, concise, and endpoint-focused** way.

**Rules:**
- ONLY describe relevant API endpoints, parameters, and example requests/responses.
- Ignore schema definitions, object property listings, or long enumerations unless directly relevant.
- Always format endpoints using Markdown:

### Endpoint
\`\`\`
POST /v1/payments
\`\`\`

**Description:** Creates a payment.

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| amount | integer | Amount in cents |
| currency | string | Currency code (e.g. USD) |

**Example Request:**
\`\`\`bash
curl -X POST https://api.stripe.com/v1/payments \\
  -u sk_test_123: \\
  -d amount=1000 \\
  -d currency=usd
\`\`\`

**Example Response:**
\`\`\`json
{
  "id": "pay_123",
  "status": "succeeded"
}
\`\`\`

- If the query is conceptual (like “What is Stripe?”), return a short 2–3 sentence summary — no tables or dumps.
- Keep output readable and developer-friendly.

---
**Context:**
${context}

**User Query:** ${query}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ answer: text });
  } catch (error) {
    console.error("❌ Query route error:", error);
    return NextResponse.json(
      {
        error: "Failed to process query.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
