import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/index";
import { sql } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    // 🧭 Step 1: Get top 5 most relevant API docs (semantic search)
    const results = await db.execute(sql`
      SELECT content
      FROM api_docs
      WHERE content ILIKE ${"%" + query + "%"}
      LIMIT 5
    `);

    const context = results.rows.map((r) => r.content).join("\n\n");

    // 🧠 Step 2: Build formatted prompt
    const prompt = `
You are an expert API documentation assistant.
Using the following API documentation context, answer the user's query **clearly** and **comprehensively**.

Rules for formatting:
- Use **bold** for section titles.
- Use bullet points (*) for lists.
- Use backticks (\`) for code paths and parameters.
- Always group endpoints by functionality if possible.
- Keep explanations concise but structured.

---
**Context:**
${context}
---
**User query:** ${query}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 🧾 Step 3: Return markdown-formatted response
    return NextResponse.json({ answer: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}
