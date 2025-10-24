import { NextResponse } from "next/server";
import { listCollections, getCollection, createCollection } from "@/services/postmanService";

export async function GET() {
  const data = await listCollections();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    if (!process.env.POSTMAN_API_KEY) {
      return NextResponse.json({ error: "POSTMAN_API_KEY not configured" }, { status: 500 });
    }
    const body = await req.json();
    const data = await createCollection(body);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Postman API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
