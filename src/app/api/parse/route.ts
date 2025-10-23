import { NextResponse } from "next/server";
import YAML from "yaml";
import fetch from "node-fetch";

function extractEndpoints(spec: any) {
  const endpoints: { method: string; path: string; desc: string; params: string[] }[] = [];
  if (!spec.paths) return endpoints;

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, details] of Object.entries(methods as any)) {
      const upperMethod = method.toUpperCase();
      if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(upperMethod)) continue;

      const desc = (details as any).summary || (details as any).description || '';
      const params = ((details as any).parameters || []).map((p: any) => `${p.name}: ${p.description || p.type || 'unknown'}`);
      endpoints.push({ method: upperMethod, path, desc, params });
    }
  }
  return endpoints;
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const res = await fetch(url);
    const text = await res.text();
    let spec;
    try {
      spec = url.endsWith('.yaml') || url.endsWith('.yml') ? YAML.parse(text) : JSON.parse(text);
    } catch (e) {
      return NextResponse.json({ error: "Failed to parse spec" }, { status: 500 });
    }

    const endpoints = extractEndpoints(spec);
    return NextResponse.json({ endpoints });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}