"use client";

import { Typewriter } from "@/components/ui/typewriter-text";
import DotGrid from "@/components/ui/DotGrid";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

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
    
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
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
          // Match both with and without backticks
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
            text={["What do you want to search for?"]}
            speed={60}
            className="text-3xl md:text-4xl font-bold text-center mb-10 text-white"
          />

          <form onSubmit={handleSearch} className="w-full max-w-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about an API..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white shadow-md"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 px-4 py-3 rounded-lg text-white shadow-md transition-colors ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

          <button
            onClick={handleGoogleSearch}
            disabled={googleLoading}
            className={`w-full max-w-md mt-2 px-4 py-3 rounded-lg text-white shadow-md transition-colors ${
              googleLoading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {googleLoading ? "Searching Google..." : "Search with Google"}
          </button>

          {hasSearched && (
            <div className="mt-8 w-full max-w-5xl text-left bg-[#0f0f0f]/80 p-6 rounded-lg border border-gray-800 shadow-xl backdrop-blur-md max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900">
              <h2 className="text-2xl font-bold text-purple-400 mb-4">API Endpoints</h2>

              {loading ? (
                <p className="text-gray-400 italic">Fetching results...</p>
              ) : endpoints.length === 0 ? (
                <p className="text-gray-500 italic">No REST endpoints found for your query.</p>
              ) : (
                methodOrder.filter(m => grouped[m]).map(method => (
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
                              className={`text-sm font-semibold px-2 py-1 rounded ${
                                ep.method === "GET"
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
                ))
              )}
            </div>
          )}

          {googleResults.length > 0 && (
            <div className="mt-8 max-w-3xl text-left bg-[#1a1a1a]/70 p-6 rounded-lg border border-green-700 shadow-md overflow-y-auto max-h-96">
              <h2 className="font-bold text-lg mb-2 text-green-400">Google Search Results</h2>
              <ul>
                {googleResults.map((item, idx) => (
                  <li key={idx} className="mb-3">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline"
                    >
                      {item.title}
                    </a>
                    <div className="text-gray-400 text-sm">{item.snippet}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
