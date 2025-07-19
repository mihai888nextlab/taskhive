import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useTheme } from "@/components/ThemeContext";
import Link from "next/link";
import UserProfileModal from "../modals/UserProfileModal";
import { useTranslations } from "next-intl"; // <-- Add this import

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

  // Add a ref to the input
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("UniversalSearchBar"); // <-- Use a dedicated namespace
  const { theme } = useTheme();

  // Focus input on Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowDropdown(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Memoize result click handler
  const handleResultClick = useCallback((result: any) => {
    if (result.type === "user") {
      setSelectedUser(result);
      setUserProfileModalOpen(true);
      setShowDropdown(false);
    } else {
      const url = getResultUrl(result);
      if (url && url !== "#") {
        window.location.href = url;
      }
      setShowDropdown(false);
    }
  }, []);

  // Memoize renderResult
  const renderResult = useCallback((result: any, idx: number) => {
    let preview = "";
    if (result.description) {
      const words = result.description.split(/\s+/).slice(0, 8);
      preview = words.join(" ");
      if (result.description.split(/\s+/).length > 8) preview += "...";
    }
    return (
      <li
        key={result._id || result.id || idx}
        className="px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors rounded"
        onMouseDown={() => handleResultClick(result)}
      >
        <span className="font-medium">{result.title || result.name || result.fullName}</span>
        {/* Show email for users */}
        {result.type === "user" && result.email && (
          <span className="ml-2 text-xs text-gray-500">{result.email}</span>
        )}
        {/* Show preview for other types if description exists */}
        {preview && result.type !== "user" && (
          <span className="ml-2 text-xs text-gray-500">{preview}</span>
        )}
      </li>
    );
  }, [handleResultClick]);

  // Fetch search results
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        // Fetch universal search results (users, tasks, etc.)
        const res = await fetch(`/api/universal-search?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        let results = flattenResults(data.results);

        // Fetch files separately and add to results
        const filesRes = await fetch(`/api/getFiles`);
        const filesData = await filesRes.json();
        if (Array.isArray(filesData.files)) {
          const fileMatches = filesData.files
            .filter((file: any) =>
              (file.fileName || "").toLowerCase().includes(search.toLowerCase())
            )
            .map((file: any) => ({
              ...file,
              type: "file",
              title: file.fileName,
              name: file.fileName,
              description: file.description || "",
            }));
          results = [...results, ...fileMatches];
        }

        setSearchResults(results);
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
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => search && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        placeholder={t("placeholder", { default: "Search tasks, users, files, etc..." })}
        className={`w-full px-5 py-2 rounded-3xl text-base font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/60 border ${theme === 'dark' ? 'bg-gray-900 text-white placeholder-gray-400 border-gray-700' : 'bg-white text-gray-900 placeholder-gray-400 border-gray-200'}`}
      />
      {loading && (
        <div className="absolute right-4 top-2.5 animate-spin text-primary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
      )}
      {showDropdown && (
        <div
          className={`absolute left-0 right-0 mt-2 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto border backdrop-blur-xl transition-colors duration-200 ${
            theme === 'dark'
              ? 'bg-gray-900 text-white border-gray-700'
              : 'bg-white text-gray-900 border-primary/20'
          }`}
          style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.15)' }}
        >
          {loading ? (
            <div className={`flex flex-col items-center justify-center py-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="text-base font-medium">{t("searching", { default: "Searching..." })}</span>
            </div>
          ) : (() => {
            // Define the categories you want to show
            const CATEGORY_ORDER = [
              { key: "users", label: "Users" },
              { key: "tasks", label: "Tasks" },
              { key: "time-tracking", label: "Time Tracking" },
              { key: "finance", label: "Incomes & Expenses" },
              { key: "announcements", label: "Announcements" },
              { key: "storage", label: "Files in Storage" },
            ];

            // Group results by category
            const grouped: Record<string, any[]> = {};
            for (const result of searchResults) {
              // Map result.type to your categories
              let cat = "";
              switch (result.type) {
                case "user":
                  cat = "users";
                  break;
                case "task":
                  cat = "tasks";
                  break;
                case "timesession":
                case "timetracking":
                  cat = "time-tracking";
                  break;
                case "income":
                case "expense":
                case "finance":
                  cat = "finance";
                  break;
                case "announcement":
                  cat = "announcements";
                  break;
                case "storage":
                case "file":
                  cat = "storage";
                  break;
                default:
                  cat = "Other";
              }
              if (!grouped[cat]) grouped[cat] = [];
              grouped[cat].push(result);
            }

            // Only show categories with results, in the specified order
            const categoriesWithResults = CATEGORY_ORDER.filter(cat => grouped[cat.key] && grouped[cat.key].length > 0);

            if (categoriesWithResults.length === 0) {
              return (
                <div className={`flex flex-col items-center justify-center py-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span className="text-base font-medium">{t("noResults", { default: "No results found" })}</span>
                  <span className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t("tryDifferent", { default: "Try a different search term" })}</span>
                </div>
              );
            }

            return (
              <div>
                {categoriesWithResults.map(cat => (
                  <div key={cat.key} className="mb-2">
                    <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b rounded-t-lg ${theme === 'dark' ? 'text-primary/80 bg-gray-800 border-gray-700' : 'text-primary/80 bg-primary/5 border-primary/10'}` }>
                      {t(`category.${cat.key}`, { default: cat.label })}
                    </div>
                    <ul>
                      {grouped[cat.key].map(renderResult)}
                    </ul>
                  </div>
                ))}
              </div>
            );
          })()}
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