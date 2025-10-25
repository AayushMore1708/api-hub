"use client";

import { Typewriter } from "@/components/ui/typewriter-text";
import DotGrid from "@/components/ui/DotGrid";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";


export default function Search() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleResults, setGoogleResults] = useState<any[]>([]);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setAnswer("");
    setGoogleResults([]);
    setHasSearched(true);

    try {
      const res = await fetch("/api/auto-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setAnswer(data.answer || "No endpoints found.");
    } catch (error) {
      console.error(error);
      setAnswer("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSearch = async () => {
    if (!query.trim()) return;
    setGoogleLoading(true);
    setGoogleResults([]);
    setGoogleError("");
    setHasSearched(true);

    try {
      const searchQuery = `${query} api endpoints official`;
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();

      if (!res.ok) {
        setGoogleError(data.error || "Failed to fetch search results");
        setGoogleResults([]);
      } else {
        setGoogleResults(data.results || []);
        if (!data.results || data.results.length === 0) {
          setGoogleError("No results found. Try a different search term.");
        }
      }
    } catch (error: any) {
      console.error(error);
      setGoogleError("Network error. Please check your connection and try again.");
      setGoogleResults([]);
    } finally {
      setGoogleLoading(false);
    }
  };

  function formatEndpoints(markdown: string) {
    const endpoints: { method: string; path: string; desc: string; params: string[] }[] = [];

    // Try multiple format patterns
    let sections = markdown.split(/### (\w+)\s*\n/);

    // Fallback to format: # GET Endpoints
    if (sections.length <= 1) {
      sections = markdown.split(/# (\w+) Endpoints/);
    }

    // Fallback to old format: ### **GET**
    if (sections.length <= 1) {
      sections = markdown.split(/### \*\*(\w+)\*\*/);
    }

    for (let i = 1; i < sections.length; i += 2) {
      const method = sections[i];
      const content = sections[i + 1];
      if (!content) continue;

      const lines = content.split('\n').map(line => line.trim()).filter(line => line);

      let currentPath = '';
      let currentDesc = '';
      let currentParams: string[] = [];
      let inParams = false;

      for (const line of lines) {
        if (line.startsWith('*   **Path:**')) {
          if (currentPath) {
            endpoints.push({ method, path: currentPath, desc: currentDesc, params: currentParams });
          }
          const pathMatch = line.match(/\*\*Path:\*\*\s*`?([^`\n]+)`?/) ||
            line.match(/\*\*Path:\*\*\s*(.+)/);
          currentPath = pathMatch ? pathMatch[1].trim() : '';
          currentDesc = '';
          currentParams = [];
          inParams = false;
        } else if (line.startsWith('*   **Description:**')) {
          currentDesc = line.replace(/\*   \*\*Description:\*\* /, '').trim();
        } else if (line.startsWith('*   **Key Parameters:**')) {
          inParams = true;
        } else if (inParams && line.startsWith('*')) {
          const param = line.replace(/^\*   /, '').trim();
          if (param && !param.startsWith('**Path:**') && !param.startsWith('**Description:**')) {
            currentParams.push(param);
          }
        }
      }
      if (currentPath) {
        endpoints.push({ method, path: currentPath, desc: currentDesc, params: currentParams });
      }
    }
    return endpoints;
  }

  const endpoints = formatEndpoints(answer);

  const grouped = endpoints.reduce((acc, ep) => {
    if (!acc[ep.method]) acc[ep.method] = [];
    acc[ep.method].push(ep);
    return acc;
  }, {} as Record<string, typeof endpoints>);

  const methodOrder = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  return (
    <section className="w-full h-full flex flex-col items-center bg-black text-gray-200">
      <div className="absolute left-6 top-6 z-50 flex gap-2">
        <Link
          href="/"
          className="px-4 py-2 bg-gray-800 text-white rounded-md shadow hover:bg-gray-700 transition"
        >
          Home
        </Link>
        <Link
          href="/api-testing"
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
        >
          API Testing
        </Link>
        <Link
          href="/postman-collections"
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
        >
          Postman
        </Link>
      </div>

      <div className="relative w-full h-[100vh] flex items-center justify-center overflow-hidden">
        <DotGrid
          dotSize={7}
          baseColor="#5227FF"
          activeColor="#5227FF"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1}
          style={{}}
        />

        <div className="absolute inset-0 flex flex-col items-center mt-12">
          <Typewriter
            text={[
              "What API do you want to explore?",
              "Search for API endpoints and documentation",
              "Find the perfect API for your project",
              "Discover RESTful APIs effortlessly",
              "Query APIs with ease",
              "Uncover API secrets and parameters",
              "Browse API hubs and repositories",
              "Get API insights instantly",
              "Search APIs by functionality",
              "Explore API integrations",
              "Find API authentication methods",
              "Discover API rate limits and quotas",
              "Search for API examples and code",
              "Locate API testing tools",
              "Find API versioning details",
              "Explore API error handling",
              "Search for API webhooks",
              "Discover API SDKs and libraries",
              "Find API changelog and updates",
              "Query APIs for specific features"
            ]}
            speed={60}
            delay={1000}
            loop={true}
            className="text-3xl md:text-4xl font-bold text-center mb-10 text-white"
          />

          <div className="w-full flex flex-col items-center">
            <form onSubmit={handleSearch} className="w-full max-w-md flex flex-col items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything about an API..."
                  className="w-full px-4 py-3 pr-20 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white shadow-md"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                    title="Search"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleGoogleSearch}
                    disabled={googleLoading}
                    className="p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                    title="Search with Google"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {hasSearched && (
            <div className="mt-8 w-full h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900">
              <div className=" lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-6">
                {/* API Endpoints Card */}
                {(loading || endpoints.length > 0 || answer) && (
                  <div className="lg:col-span-1 text-left bg-[#0f0f0f]/80 p-6 rounded-lg border border-gray-800 shadow-xl backdrop-blur-md">
                    <h2 className="text-2xl font-bold text-purple-400 mb-4">API Endpoints</h2>

                    {loading ? (
                      <p className="text-gray-400 italic">Fetching results...</p>
                    ) : endpoints.length === 0 ? (
                      <p className="text-gray-500 italic">No REST endpoints found for your query.</p>
                    ) : (
                      <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto">
                        {methodOrder.filter(m => grouped[m]).map(method => (
                          <details key={method} className="mb-4">
                            <summary className="text-lg font-semibold text-purple-400 cursor-pointer">
                              {method} ({grouped[method].length})
                            </summary>
                            <div className="mt-2">
                              {grouped[method].map((ep, i) => (
                                <div
                                  key={i}
                                  className="mb-5 border border-gray-700 rounded-lg p-4 bg-[#1a1a1a]/70 hover:bg-[#2a2a2a]/80 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`text-sm font-semibold px-2 py-1 rounded ${ep.method === "GET"
                                        ? "bg-green-700 text-green-200"
                                        : ep.method === "POST"
                                          ? "bg-blue-700 text-blue-200"
                                          : ep.method === "DELETE"
                                            ? "bg-red-700 text-red-200"
                                            : "bg-yellow-700 text-yellow-200"
                                        }`}
                                    >
                                      {ep.method}
                                    </span>
                                    <code className="text-sm font-mono text-gray-100 ml-3">{ep.path}</code>
                                  </div>
                                  {ep.desc && <p className="mt-2 text-gray-300 text-sm">{ep.desc}</p>}
                                  {ep.params.length > 0 && (
                                    <div className="mt-3">
                                      <p className="text-gray-400 text-xs font-semibold mb-1">Parameters:</p>
                                      <ul className="pl-4 list-disc text-gray-400 text-xs space-y-1">
                                        {ep.params.slice(0, 10).map((p, idx) => (
                                          <li key={idx}>{p}</li>
                                        ))}
                                        {ep.params.length > 10 && (
                                          <li className="text-gray-500 italic">...and more</li>
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </details>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Google Search Results Card */}
                {(googleLoading || googleResults.length > 0 || googleError) && (
                  <div className="lg:col-span-2 text-left bg-[#1a1a1a]/70 p-6 rounded-lg border border-green-700 shadow-md">
                    <h2 className="font-bold text-lg mb-4 text-green-400">Google Search Results</h2>
                    
                    {googleLoading ? (
                      <p className="text-gray-400 italic">Searching Google...</p>
                    ) : googleError ? (
                      <p className="text-red-400 italic">{googleError}</p>
                    ) : googleResults.length > 0 ? (
                      <ul className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                        {googleResults.map((item, idx) => (
                          <li key={idx} className="border border-gray-700 rounded p-3 bg-[#1a1a1a]/50 hover:bg-[#2a2a2a]/50 transition-colors">
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 underline font-semibold line-clamp-2"
                            >
                              {item.title}
                            </a>
                            <div className="text-gray-400 text-sm mt-2 line-clamp-3">{item.snippet}</div>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
