import { useState } from "react";
import { searchAPI } from "@/services/search";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await searchAPI(query);
      setResults(res);
    } catch (e) {
      alert("Search failed");
    }
    setLoading(false);
  };

  return (
    <div>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search API docs..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>
      <ul>
        {results.map((item, idx) => (
          <li key={idx}>
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}