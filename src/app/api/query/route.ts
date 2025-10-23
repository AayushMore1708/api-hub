import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/index";
import { sql } from "drizzle-orm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const results = await db.execute(sql`
      SELECT content
      FROM api_docs
      WHERE content ILIKE ${"%" + query + "%"}
    `);

    const context = results.rows.map((r) => r.content).join("\n\n");

    const prompt = `
You are an expert API documentation assistant.
Using the following API documentation context, answer the user's query **clearly** and **comprehensively**.

Rules for formatting:
- Use **bold** for section titles.
- Use bullet points (*) for lists.
- Use backticks (\`) for code paths and parameters.
- Always group endpoints by functionality if possible.
- Keep explanations concise but structured with examples
- Dont give like this Here is a comprehensive overview of the Stripe-related API endpoints based on the provided documentation:
just give proper endpoints and description and keep proper spacing and line breaks with numbered bullets
---
**Context:**
${context}
---
**User query:** ${query}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ answer: text });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}
