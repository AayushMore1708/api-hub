"use client";

import { Typewriter } from "@/components/ui/typewriter-text";
import DotGrid from "@/components/ui/DotGrid";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Search() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setAnswer(data.answer || "No response found.");
    } catch (error) {
      console.error(error);
      setAnswer("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="w-full h-full flex flex-col items-center text-gray-800 bg-black">
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
        <div className=" absolute inset-0 flex flex-col items-center mt-12">
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
              className={`w-full mt-4 px-4 py-3 rounded-lg text-white shadow-md transition-colors ${loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

{answer && (
  <div className="mt-8 max-w-3xl text-left text-gray-200 bg-[#1a1a1a]/70 p-6 rounded-lg shadow-md backdrop-blur-md border border-gray-700 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 max-h-96 prose prose-invert">
    <ReactMarkdown>{answer}</ReactMarkdown>
  </div>
)}



        </div>
      </div>
    </section>
  );
}