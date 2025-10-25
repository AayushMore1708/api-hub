import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/postman/route";
import * as postmanService from "@/services/postmanService";
import { NextResponse } from "next/server";

describe("Postman Route Handlers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv("POSTMAN_API_KEY", "test-key");
    vi.spyOn(console, "error").mockImplementation(() => {}); 
  });

  it("GET should return JSON response from listCollections", async () => {
    const mockData = [{ id: "1", name: "Test Collection" }];
    const jsonSpy = vi.spyOn(NextResponse, "json").mockReturnValue("response" as any);
    vi.spyOn(postmanService, "listCollections").mockResolvedValue(mockData as any);

    const result = await GET();

    expect(postmanService.listCollections).toHaveBeenCalled();
    expect(jsonSpy).toHaveBeenCalledWith(mockData);
    expect(result).toBe("response");
  });


  it("POST should create a new collection when POSTMAN_API_KEY is set", async () => {
    const body = { name: "New Collection" };
    const mockData = { id: "123", name: "New Collection" };
    const jsonSpy = vi.spyOn(NextResponse, "json").mockReturnValue("response" as any);
    vi.spyOn(postmanService, "createCollection").mockResolvedValue(mockData as any);

    const mockRequest = {
      json: vi.fn().mockResolvedValue(body),
    } as unknown as Request;

    const result = await POST(mockRequest);

    expect(postmanService.createCollection).toHaveBeenCalledWith(body);
    expect(jsonSpy).toHaveBeenCalledWith(mockData);
    expect(result).toBe("response");
  });

  it("POST should return error if POSTMAN_API_KEY is missing", async () => {
    vi.stubEnv("POSTMAN_API_KEY", ""); // unset API key
    const jsonSpy = vi.spyOn(NextResponse, "json").mockReturnValue("errorResponse" as any);

    const mockRequest = {
      json: vi.fn(),
    } as unknown as Request;

    const result = await POST(mockRequest);

    expect(jsonSpy).toHaveBeenCalledWith(
      { error: "POSTMAN_API_KEY not configured" },
      { status: 500 }
    );
    expect(result).toBe("errorResponse");
  });

  it("POST should handle errors gracefully", async () => {
    const error = new Error("Something went wrong");
    vi.spyOn(postmanService, "createCollection").mockRejectedValue(error);
    const jsonSpy = vi.spyOn(NextResponse, "json").mockReturnValue("errorResponse" as any);

    const mockRequest = {
      json: vi.fn().mockResolvedValue({ name: "Fail Collection" }),
    } as unknown as Request;

    const result = await POST(mockRequest);

    expect(jsonSpy).toHaveBeenCalledWith({ error: "Something went wrong" }, { status: 500 });
    expect(result).toBe("errorResponse");
  });
});
