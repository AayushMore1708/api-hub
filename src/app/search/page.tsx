"use client";

import { Typewriter } from "@/components/ui/typewriter-text";
import DotGrid from "@/components/ui/DotGrid";
import { useState } from "react";

export default function Search() {
  const [query, setQuery] = useState("");

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
          <form className="w-full max-w-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your search query..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white shadow-md"
            />
            <button
              type="submit"
              className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}