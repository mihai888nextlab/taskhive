import React, { useEffect, useState } from "react";
import Link from "next/link";

const API_ENDPOINTS = {
  users: "/api/users",
  tasks: "/api/tasks",
  announcements: "/api/announcements",
  calendarEvents: "/api/calendar",
  storageFiles: "/api/getFiles",
  timeTracking: "/api/time-tracking",
  financeRecords: "/api/finance",
  expenses: "/api/expenses",
  timeSessions: "/api/time-sessions",
};

const LABELS: Record<string, { label: string; color: string }> = {
  user: { label: "User", color: "bg-secondary" },
  task: { label: "Task", color: "bg-blue-500" },
  announcement: { label: "Announcement", color: "bg-yellow-500" },
  calendar: { label: "Calendar", color: "bg-green-500" },
  storage: { label: "Storage", color: "bg-gray-500" },
  timetracking: { label: "Time Tracking", color: "bg-purple-500" },
  finance: { label: "Finance", color: "bg-pink-500" },
  expense: { label: "Expense", color: "bg-red-500" },
  income: { label: "Income", color: "bg-green-600" },
  timesession: { label: "Time Session", color: "bg-indigo-500" },
  page: { label: "Page", color: "bg-primary" },
};

const getResultUrl = (item: any) => {
  switch (item.type) {
    case "user":
      return `/app/users/${item._id}`;
    case "task":
      return `/app/tasks#${item._id}`;
    case "announcement":
      return `/app/announcements#${item._id}`;
    case "calendar":
      return `/app/calendar#${item._id}`;
    case "storage":
      return `/app/storage#${item._id}`;
    case "timetracking":
      return `/app/time-tracking#${item._id}`;
    case "finance":
      return `/app/finance#${item._id}`;
    case "expense":
      return `/app/finance#${item._id}`;
    case "income":
      return `/app/finance#${item._id}`;
    case "timesession":
      return `/app/time-tracking#${item._id}`;
    case "page":
      return item.path || "#";
    default:
      return "#";
  }
};

const getItemTitle = (item: any) =>
  item.title ||
  item.name ||
  item.fullName ||
  item.email ||
  (item.description ? item.description.substring(0, 50) + "..." : "N/A");

const safeArray = (arr: any) => (Array.isArray(arr) ? arr : []);

const UniversalSearchBar: React.FC = () => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // All data states
  const [data, setData] = useState({
    users: [],
    tasks: [],
    announcements: [],
    calendarEvents: [],
    storageFiles: [],
    timeTracking: [],
    financeRecords: [],
    expenses: [],
    timeSessions: [],
  });

  // Fetch all data on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [
          usersRes,
          tasksRes,
          announcementsRes,
          calendarRes,
          storageRes,
          timeTrackingRes,
          financeRes,
          expensesRes,
          timeSessionsRes,
        ] = await Promise.all([
          fetch(API_ENDPOINTS.users).then((r) => r.json()),
          fetch(API_ENDPOINTS.tasks).then((r) => r.json()),
          fetch(API_ENDPOINTS.announcements).then((r) => r.json()),
          fetch(API_ENDPOINTS.calendarEvents).then((r) => r.json()).catch(() => ({ events: [] })),
          fetch(API_ENDPOINTS.storageFiles).then((r) => r.json()),
          fetch(API_ENDPOINTS.timeTracking).then((r) => r.json()).catch(() => ({ timeTracking: [] })),
          fetch(API_ENDPOINTS.financeRecords).then((r) => r.json()).catch(() => ({ financeRecords: [] })),
          fetch(API_ENDPOINTS.expenses).then((r) => r.json()),
          fetch(API_ENDPOINTS.timeSessions).then((r) => r.json()),
        ]);
        setData({
          users: usersRes.users || usersRes,
          tasks: tasksRes.tasks || tasksRes,
          announcements: announcementsRes.announcements || announcementsRes,
          calendarEvents: calendarRes.events || calendarRes,
          storageFiles: storageRes.files || storageRes,
          timeTracking: timeTrackingRes.timeTracking || timeTrackingRes,
          financeRecords: financeRes.financeRecords || financeRes,
          expenses: expensesRes.expenses || expensesRes,
          timeSessions: timeSessionsRes.timeSessions || timeSessionsRes,
        });
      } catch (err) {
        // Optionally handle error
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Debounce search
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      const lower = search.toLowerCase();

      // Users
      const userResults = safeArray(data.users).filter(
        (u: any) =>
          (u.firstName && u.firstName.toLowerCase().includes(lower)) ||
          (u.lastName && u.lastName.toLowerCase().includes(lower)) ||
          (u.email && u.email.toLowerCase().includes(lower))
      ).map((u: any) => ({
        type: "user",
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown User",
        email: u.email,
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        profileImage: u.profileImage,
        description: u.description,
        role: u.role,
      }));

      // Tasks
      const taskResults = safeArray(data.tasks)
        .filter(
          (t: any) =>
            (t.title && t.title.toLowerCase().includes(lower)) ||
            (t.description && t.description.toLowerCase().includes(lower))
        )
        .map((t: any) => ({
          type: "task",
          name: t.title,
          _id: t._id,
        }));

      // Announcements
      const announcementResults = safeArray(data.announcements).filter(
        (a: any) =>
          (a.title && a.title.toLowerCase().includes(lower)) ||
          (a.content && a.content.toLowerCase().includes(lower))
      ).map((a: any) => ({
        type: "announcement",
        name: a.title,
        _id: a._id,
      }));

      // Calendar Events
      const calendarResults = safeArray(data.calendarEvents).filter(
        (e: any) =>
          (e.title && e.title.toLowerCase().includes(lower)) ||
          (e.description && e.description.toLowerCase().includes(lower))
      ).map((e: any) => ({
        type: "calendar",
        name: e.title,
        _id: e._id,
      }));

      // Storage Files
      const storageResults = safeArray(data.storageFiles).filter(
        (f: any) =>
          (f.fileName && f.fileName.toLowerCase().includes(lower)) ||
          (f.name && f.name.toLowerCase().includes(lower)) ||
          (f.description && f.description.toLowerCase().includes(lower))
      ).map((f: any) => ({
        type: "storage",
        name: f.fileName || f.name,
        _id: f._id,
      }));

      // Time Tracking
      const timeTrackingResults = safeArray(data.timeTracking).filter(
        (tt: any) =>
          (tt.task && tt.task.toLowerCase().includes(lower)) ||
          (tt.notes && tt.notes.toLowerCase().includes(lower))
      ).map((tt: any) => ({
        type: "timetracking",
        name: tt.task,
        _id: tt._id,
      }));

      // Finance
      const financeResults = safeArray(data.financeRecords).filter(
        (fr: any) =>
          (fr.title && fr.title.toLowerCase().includes(lower)) ||
          (fr.description && fr.description.toLowerCase().includes(lower))
      ).map((fr: any) => ({
        type: "finance",
        name: fr.title,
        _id: fr._id,
      }));

      // Expenses
      const expenseResults = safeArray(data.expenses)
        .filter(
          (e: any) =>
            e.type === "expense" &&
            (
              (e.title && e.title.toLowerCase().includes(lower)) ||
              (e.description && e.description.toLowerCase().includes(lower))
            )
        )
        .map((e: any) => ({
          type: "expense",
          name: e.title,
          _id: e._id,
          amount: e.amount,
        }));

      // Incomes (from expenses with type === "income")
      const incomeResults = safeArray(data.expenses)
        .filter(
          (i: any) =>
            i.type === "income" &&
            (
              (i.title && i.title.toLowerCase().includes(lower)) ||
              (i.description && i.description.toLowerCase().includes(lower))
            )
        )
        .map((i: any) => ({
          type: "income",
          name: i.title,
          _id: i._id,
          amount: i.amount,
        }));

      // Time Sessions
      const timeSessionResults = safeArray(data.timeSessions).filter(
        (ts: any) =>
          (ts.name && ts.name.toLowerCase().includes(lower)) ||
          (ts.description && ts.description.toLowerCase().includes(lower)) ||
          (ts.tag && ts.tag.toLowerCase().includes(lower))
      ).map((ts: any) => ({
        type: "timesession",
        name: ts.name,
        description: ts.description,
        tag: ts.tag,
        _id: ts._id,
      }));

      setSearchResults([
        ...userResults,
        ...taskResults,
        ...announcementResults,
        ...calendarResults,
        ...storageResults,
        ...timeTrackingResults,
        ...financeResults,
        ...expenseResults,
        ...incomeResults,
        ...timeSessionResults,
      ]);
      setShowDropdown(true);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, data]);

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
                    <span className="font-semibold text-base">{result.name}</span>
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
                  <span className="font-semibold text-base">{result.name}</span>
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
    </div>
  );
};

export default UniversalSearchBar;
