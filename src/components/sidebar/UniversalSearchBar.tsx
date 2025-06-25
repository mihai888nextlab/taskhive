import React, { useEffect, useState } from "react";
import Link from "next/link";

const LABELS: Record<string, { label: string; color: string }> = {
  user: { label: "User", color: "bg-secondary" },
  task: { label: "Task", color: "bg-blue-500" },
  announcement: { label: "Announcement", color: "bg-yellow-500" },
  calendar: { label: "Calendar", color: "bg-green-500" },
  timesession: { label: "Time Session", color: "bg-indigo-500" },
  storage: { label: "Storage", color: "bg-gray-500" },
  timetracking: { label: "Time Tracking", color: "bg-purple-500" },
  finance: { label: "Finance", color: "bg-pink-500" },
  expense: { label: "Expense", color: "bg-red-500" },
  income: { label: "Income", color: "bg-green-600" },
  page: { label: "Page", color: "bg-primary" },
};

const getResultUrl = (item: any) => {
  switch (item.type) {
    case "user":
      return `/app/users/${item._id || item.userId || ""}`;
    case "task":
      return `/app/tasks`;
    case "announcement":
      return `/app/announcements`;
    case "calendar":
      return `/app/calendar`;
    case "storage":
      return `/app/storage`;
    case "expense":
      return `/app/finance`;
    case "income":
      return `/app/finance}`;
    case "timesession":
      return `/app/time-tracking`;
    case "page":
      return item.path || "#";
    default:
      return "#";
  }
};

const flattenResults = (results: any) => {
  // Flatten the results object into a single array with type info
  if (!results) return [];
  return Object.values(results)
    .flat()
    .map((item: any) => ({
      ...item,
      type: item.type || "unknown",
    }));
};

const UniversalSearchBar: React.FC = () => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/universal-search?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        setSearchResults(flattenResults(data.results));
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
        setShowDropdown(false);
      }
      setLoading(false);
    }, 250);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="mb-6 relative">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => search && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        placeholder="Search tasks, users, files, etc..."
        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary shadow"
      />
      {showDropdown && searchResults.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white text-gray-900 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto border border-primary/30">
          {searchResults.map((result, idx) => {
            const tag = LABELS[result.type] || LABELS.page;
            let href = getResultUrl(result);

            if (result.type === "user") {
              return (
                <button
                  key={result._id ? result._id + idx : result.name + idx}
                  type="button"
                  className="block w-full text-left px-5 py-4 mb-2 rounded-lg shadow hover:shadow-lg transition-all border border-gray-200 hover:bg-primary/10 cursor-pointer"
                  onClick={() => {
                    setSearch("");
                    setShowDropdown(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-base">
                      {result.fullName ||
                        `${result.firstName || ""} ${result.lastName || ""}`.trim() ||
                        "Unknown User"}
                    </span>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500">{result.email}</span>
                      <span className={`ml-3 text-xs ${tag.color} text-white px-3 py-1 rounded-full`}>
                        {tag.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            }

            if (result.type === "task") {
              return (
                <Link
                  key={result._id ? result._id + idx : result.name + idx}
                  href={getResultUrl(result)}
                  className="block px-5 py-4 mb-2 rounded-lg shadow hover:shadow-lg transition-all border border-gray-200 hover:bg-primary/10 flex items-center"
                  onClick={() => {
                    setSearch("");
                    setShowDropdown(false);
                  }}
                >
                  <div className="flex-1">
                    <span className="font-semibold text-base">{result.title}</span>
                  </div>
                  <span className={`ml-4 text-xs ${tag.color} text-white px-3 py-1 rounded-full`}>
                    {tag.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={result._id ? result._id + idx : result.name + idx}
                href={href}
                className="block px-5 py-4 mb-2 rounded-lg shadow hover:shadow-lg transition-all border border-gray-200 hover:bg-primary/10 flex items-center"
                onClick={() => {
                  setSearch("");
                  setShowDropdown(false);
                }}
              >
                <div className="flex-1">
                  <span className="font-semibold text-base">{result.name || result.title || result.fullName}</span>
                  {result.description && !["task", "expense", "income"].includes(result.type) && (
                    <span className="block text-xs text-gray-500 mt-1">{result.description}</span>
                  )}
                </div>
                <span className={`ml-4 text-xs ${tag.color} text-white px-3 py-1 rounded-full`}>
                  {tag.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
      {/* Remove or comment out the loading animation below */}
      {/* 
      {loading && (
        <div className="absolute left-0 right-0 mt-2 bg-white text-gray-900 rounded-lg shadow-lg z-50 p-4 text-center">
          Searching...
        </div>
      )} */}
    </div>
  );
};

export default UniversalSearchBar;
