"use client";

import { useState } from "react";
import Link from "next/link";

type SearchResult = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  currentStage: { name: string };
  requisition: { reqNumber: string; title: string };
  source: { name: string } | null;
};

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSearch(q: string) {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setResults(data.data);
      setOpen(true);
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Search candidates across all reqs..."
        className="w-64 bg-denali-gray-800 border border-denali-gray-700 rounded-lg px-3 py-2 text-sm text-denali-gray-200 focus:outline-none focus:ring-1 focus:ring-denali-cyan placeholder:text-denali-gray-600"
      />
      {loading && (
        <div className="absolute right-3 top-2.5 text-xs text-denali-gray-500">...</div>
      )}

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-96 bg-denali-gray-900 border border-denali-gray-800 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs text-denali-gray-600 px-2 py-1">{results.length} results</p>
            {results.map((c) => (
              <button
                key={c.id}
                onClick={() => { setOpen(false); setQuery(""); }}
                className="w-full text-left p-2 rounded hover:bg-denali-gray-800 transition-colors"
              >
                <p className="text-sm text-denali-gray-200">{c.firstName} {c.lastName}</p>
                <p className="text-xs text-denali-gray-500">
                  {c.requisition.reqNumber} — {c.requisition.title} &middot;{" "}
                  <span className="text-denali-cyan">{c.currentStage.name}</span>
                  {c.source && <span> &middot; {c.source.name}</span>}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {open && results.length === 0 && query.length >= 2 && !loading && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-denali-gray-900 border border-denali-gray-800 rounded-lg shadow-xl z-50 p-4 text-center">
          <p className="text-xs text-denali-gray-600">No candidates found</p>
        </div>
      )}
    </div>
  );
}
