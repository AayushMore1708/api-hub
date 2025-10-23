import { NextResponse } from "next/server";
import { googleCustomSearch } from "@/utils/googleSearch";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }
    
    console.log('📨 Search API received query:', query);
    const results = await googleCustomSearch(query);
    
    return NextResponse.json({ 
      results,
      count: results.length 
    });
  } catch (error: any) {
    console.error('❌ Search route error:', error.message);
    return NextResponse.json({ 
      error: error.message || "Google Search API error",
      results: [] 
    }, { status: 500 });
  }
}