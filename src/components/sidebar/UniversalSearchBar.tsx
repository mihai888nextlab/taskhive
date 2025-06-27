import React, { useEffect, useState } from "react";
import Link from "next/link";
import UserProfileModal from "../modals/UserProfileModal";

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
      return `/app/finance`;
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
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

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
    <div className="mb-7 relative">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => search && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        placeholder="Search tasks, users, files, etc..."
        className="w-full px-5 py-2.5 rounded-xl bg-gray-700/80 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/60 shadow-lg border border-gray-700/40 text-base font-medium transition-all backdrop-blur-md"
        style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.10)' }}
      />
      {loading && (
        <div className="absolute right-4 top-2.5 animate-spin text-primary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
      )}
      {showDropdown && searchResults.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-gray-800/90 text-white rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto border border-primary/20 backdrop-blur-xl" style={{boxShadow:'0 8px 32px 0 rgba(31,38,135,0.15)'}}>
          {searchResults.map((result, idx) => {
            const tag = LABELS[result.type] || LABELS.page;
            let href = getResultUrl(result);
            if (result.type === "user") {
              return (
                <button
                  key={result._id ? result._id + idx : result.name + idx}
                  type="button"
                  className="block w-full text-left px-6 py-4 mb-2 rounded-xl shadow hover:shadow-xl transition-all border border-gray-700/30 hover:bg-primary/10 cursor-pointer"
                  onClick={() => {
                    setSelectedUser(result);
                    setUserProfileModalOpen(true);
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
                      <span className="text-xs text-gray-400">{result.email}</span>
                      <span className={`ml-3 text-xs ${tag.color} text-white px-3 py-1 rounded-full font-semibold shadow-sm`}>
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
                  className="block px-6 py-4 mb-2 rounded-xl shadow hover:shadow-xl transition-all border border-gray-700/30 hover:bg-primary/10 flex items-center"
                  onClick={() => {
                    setSearch("");
                    setShowDropdown(false);
                  }}
                >
                  <div className="flex-1">
                    <span className="font-semibold text-base">{result.title}</span>
                  </div>
                  <span className={`ml-4 text-xs ${tag.color} text-white px-3 py-1 rounded-full font-semibold shadow-sm`}>
                    {tag.label}
                  </span>
                </Link>
              );
            }
            return (
              <Link
                key={result._id ? result._id + idx : result.name + idx}
                href={href}
                className="block px-6 py-4 mb-2 rounded-xl shadow hover:shadow-xl transition-all border border-gray-700/30 hover:bg-primary/10 flex items-center"
                onClick={() => {
                  setSearch("");
                  setShowDropdown(false);
                }}
              >
                <div className="flex-1">
                  <span className="font-semibold text-base">{result.name || result.title || result.fullName}</span>
                  {result.description && !["task", "expense", "income"].includes(result.type) && (
                    <span className="block text-xs text-gray-400 mt-1">{result.description}</span>
                  )}
                </div>
                <span className={`ml-4 text-xs ${tag.color} text-white px-3 py-1 rounded-full font-semibold shadow-sm`}>
                  {tag.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
      <UserProfileModal
        open={userProfileModalOpen}
        onClose={() => setUserProfileModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default UniversalSearchBar;
