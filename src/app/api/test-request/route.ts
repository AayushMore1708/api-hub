import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    let { url, method, body, headers } = await req.json();
    if (!url || !method) {
      return NextResponse.json({ error: "Missing URL or method" }, { status: 400 });
    }

    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

    const requestHeaders: Record<string, string> = {};
    if (headers && Array.isArray(headers)) {
      headers.forEach((h: { key: string; value: string }) => {
        if (h.key && h.value) requestHeaders[h.key] = h.value;
      });
    }

    const res = await fetch(url, {
      method,
      headers: requestHeaders,
      body: method !== "GET" && body ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const text = await res.text();

    return NextResponse.json({
      status: res.status,
      contentType,
      data: isJson ? JSON.parse(text) : text,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
