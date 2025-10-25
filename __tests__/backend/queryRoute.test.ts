import { describe, it, expect, vi } from "vitest";
import { OFFICIAL_SPECS } from "@/app/scripts/seedDocs";
import * as apiService from "@/app/services/apiService";
import { GoogleGenerativeAI } from "@google/generative-ai";

vi.mock("@google/generative-ai", () => {
  const mockEmbedContent = vi.fn().mockResolvedValue({
    embedding: { values: [1, 2, 3] }
  });

  const mockGenerateContent = vi.fn().mockResolvedValue({
    response: { text: () => "mock response" }
  });

  class MockGoogleGenerativeAI {
    constructor(apiKey?: string) {}
    
    getGenerativeModel(config: any) {
      return {
        embedContent: mockEmbedContent,
        generateContent: mockGenerateContent
      };
    }
  }

  return {
    GoogleGenerativeAI: MockGoogleGenerativeAI
  };
});

vi.mock("@/index", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          { id: 1, content: "doc1", vector: [1, 2, 3], source: "stripe" },
          { id: 2, content: "doc2", vector: [2, 3, 4], source: "github" }
        ])
      })
    })
  }
}));



describe("OFFICIAL_SPECS links", () => {
  it.each(Object.entries(OFFICIAL_SPECS))(
    "should load successfully for %s",
    async (name, [url]) => {
      const res = await fetch(url);
      expect(res.ok, `${name} link failed with ${res.status}`).toBe(true);
    },
    15000
  );
});

describe("Gemini API connection", () => {
  it("should instantiate GoogleGenerativeAI and get a model", () => {
    const apiKey = process.env.GEMINI_API_KEY || "fake-key";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    expect(model).toBeDefined();
    expect(typeof model.generateContent).toBe("function");
  });
});

describe("searchDocs", () => {
  it("returns array of docs with distance", async () => {
    const result = await apiService.searchDocs("q");
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]).toHaveProperty("distance");
    expect(result[0]).toHaveProperty("id");
  });
});
