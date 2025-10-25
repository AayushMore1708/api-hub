import { describe, it, expect, vi, beforeEach } from "vitest";
import { getPopularRepos } from "@/app/services/repoService";

describe("getPopularRepos", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an array of repositories", async () => {
    const mockData = {
      items: [
        { id: 1, name: "react", stargazers_count: 210000 },
        { id: 2, name: "next.js", stargazers_count: 120000 },
      ],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const repos = await getPopularRepos(1);

    expect(Array.isArray(repos)).toBe(true);
    expect(repos).toHaveLength(2);
    expect(repos[0].name).toBe("react");
  });

  it("calls the correct GitHub API URL with page parameter", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    });

    await getPopularRepos(2);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.github.com/search/repositories?q=stars:>10000&sort=stars&order=desc&per_page=20&page=2"
    );
  });
});
