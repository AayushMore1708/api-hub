import { NextResponse } from "next/server";
import { googleCustomSearch } from "@/utils/googleSearch";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }
    const results = await googleCustomSearch(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Google Search API error" }, { status: 500 });
  }
}