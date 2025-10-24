import { POST } from "../src/app/api/query/route";
import { NextResponse } from "next/server";

describe("/api/query POST (integration)", () => {
  beforeAll(() => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY missing — add it in .env.local before running tests.");
    }
  });

  it("should respond with initializing message for first-time query", async () => {
    const req = new Request("http://localhost/api/query", {
      method: "POST",
      body: JSON.stringify({ query: "stripe list customers" }),
      headers: { "Content-Type": "application/json" },
    });

    const res = (await POST(req)) as NextResponse;
    const json = await res.json();

    expect(res.status).toBeLessThan(500);
    expect(json).toHaveProperty("answer");
    expect(typeof json.answer).toBe("string");
  }, 60000); // 1-minute timeout because Gemini & DB may be slow

  it("should return 400 for missing query", async () => {
    const req = new Request("http://localhost/api/query", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const res = (await POST(req)) as NextResponse;
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toMatch(/missing/i); // ✅ case-insensitive match

  });
});
