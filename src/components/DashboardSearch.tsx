import { useEffect, useState } from "react";
import Link from "next/link";
import { useDebouncedSearch } from "@/hooks/useDebounceSearch";

interface DashboardSearchProps {
  menu: any[];
  users: any[];
  tasks: any[];
  announcements: any[];
  calendarEvents: any[];
  storageFiles: any[];
  timeTracking: any[];
  financeRecords: any[];
  expenses: any[];
  incomes: any[];
  timeSessions: any[];
  onUserCardClick: (user: any) => void;
}

const DashboardSearch: React.FC<DashboardSearchProps> = ({
  menu,
  users,
  tasks,
  announcements,
  calendarEvents,
  storageFiles,
  timeTracking,
  financeRecords,
  expenses,
  incomes,
  timeSessions,
  onUserCardClick,
}) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const lower = search.toLowerCase();

    // Menu pages
    const pageResults = menu.filter((m) =>
      m.name.toLowerCase().includes(lower)
    );

    // // Users
    // const userResults = users.filter(
    //   (u) =>
    //     (u.userId.firstName &&
    //       u.userId.firstName.toLowerCase().includes(lower)) ||
    //     (u.userId.lastName &&
    //       u.userId.lastName.toLowerCase().includes(lower)) ||
    //     (u.userId.email && u.userId.email.toLowerCase().includes(lower))
    // ).map((u) => ({
    //   type: "user",
    //   name: `${u.userId.firstName || ""} ${u.userId.lastName || ""}`.trim() || "Unknown User",
    //   email: u.userId.email,
    //   _id: u.userId._id,
    //   firstName: u.userId.firstName,
    //   lastName: u.userId.lastName,
    //   profileImage: u.userId.profileImage,
    //   description: u.userId.description,
    //   role: u.role,
    // }));

    // // Tasks
    // const taskResults = tasks
    //   .filter(
    //     (t) =>
    //       (t.title && t.title.toLowerCase().includes(lower)) ||
    //       (t.description && t.description.toLowerCase().includes(lower))
    //   )
    //   .map((t) => ({
    //     type: "task",
    //     name: t.title,
    //     _id: t._id,
    //   }));

    // // Announcements
    // const announcementResults = announcements.filter(
    //   (a) =>
    //     (a.title && a.title.toLowerCase().includes(lower)) ||
    //     (a.content && a.content.toLowerCase().includes(lower))
    // ).map((a) => ({
    //   type: "announcement",
    //   name: a.title,
    //   _id: a._id,
    // }));

    // // Calendar Events
    // const calendarResults = calendarEvents.filter(
    //   (e) =>
    //     (e.title && e.title.toLowerCase().includes(lower)) ||
    //     (e.description && e.description.toLowerCase().includes(lower))
    // ).map((e) => ({
    //   type: "calendar",
    //   name: e.title,
    //   _id: e._id,
    // }));

    // // Storage Files
    // const storageResults = storageFiles.filter(
    //   (f) =>
    //     (f.name && f.name.toLowerCase().includes(lower)) ||
    //     (f.description && f.description.toLowerCase().includes(lower))
    // ).map((f) => ({
    //   type: "storage",
    //   name: f.name,
    //   _id: f._id,
    // }));

    // // Time Tracking
    // const timeTrackingResults = timeTracking.filter(
    //   (tt) =>
    //     (tt.task && tt.task.toLowerCase().includes(lower)) ||
    //     (tt.notes && tt.notes.toLowerCase().includes(lower))
    // ).map((tt) => ({
    //   type: "timetracking",
    //   name: tt.task,
    //   _id: tt._id,
    // }));

    // // Finance
    // const financeResults = financeRecords.filter(
    //   (fr) =>
    //     (fr.title && fr.title.toLowerCase().includes(lower)) ||
    //     (fr.description && fr.description.toLowerCase().includes(lower))
    // ).map((fr) => ({
    //   type: "finance",
    //   name: fr.title,
    //   _id: fr._id,
    // }));

    // // Expenses
    // const expenseResults = expenses
    //   .filter(
    //     (e) =>
    //       e.type === "expense" &&
    //       (
    //         (e.title && e.title.toLowerCase().includes(lower)) ||
    //         (e.description && e.description.toLowerCase().includes(lower))
    //       )
    //   )
    //   .map((e) => ({
    //     type: "expense",
    //     name: e.title,
    //     _id: e._id,
    //   }));

    // // Incomes
    // const incomeResults = expenses
    //   .filter(
    //     (i) =>
    //       i.type === "income" &&
    //       (
    //         (i.title && i.title.toLowerCase().includes(lower)) ||
    //         (i.description && i.description.toLowerCase().includes(lower))
    //       )
    //   )
    //   .map((i) => ({
    //     type: "income",
    //     name: i.title,
    //     _id: i._id,
    //   }));

    // // Time Sessions
    // const timeSessionResults = timeSessions.filter(
    //   (ts) =>
    //     (ts.name && ts.name.toLowerCase().includes(lower)) ||
    //     (ts.description && ts.description.toLowerCase().includes(lower)) ||
    //     (ts.tag && ts.tag.toLowerCase().includes(lower))
    // ).map((ts) => ({
    //   type: "timesession",
    //   name: ts.name,
    //   description: ts.description,
    //   tag: ts.tag,
    //   _id: ts._id,
    // }));

    // setSearchResults([
    //   ...pageResults.map((r) => ({ type: "page", ...r })),
    //   ...userResults,
    //   ...taskResults,
    //   ...announcementResults,
    //   ...calendarResults,
    //   ...storageResults,
    //   ...timeTrackingResults,
    //   ...financeResults,
    //   ...expenseResults,
    //   ...incomeResults,
    //   ...timeSessionResults,
    // ]);
    setShowDropdown(true);
  }, [
    search,
    users,
    tasks,
    announcements,
    calendarEvents,
    storageFiles,
    timeTracking,
    financeRecords,
    expenses,
    incomes,
    timeSessions,
    menu,
  ]);

  return (
    <div className="mb-6 relative">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => search && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        placeholder="Search pages or users..."
        className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary shadow"
      />
      {showDropdown && searchResults.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white text-gray-900 rounded-lg shadow-lg z-50 max-h-72 overflow-y-auto border border-primary/30">
          {searchResults.map((result, idx) => {
            let color = "";
            let label = "";
            switch (result.type) {
              case "user":
                color = "bg-secondary";
                label = "User";
                break;
              case "task":
                color = "bg-blue-500";
                label = "Task";
                break;
              case "announcement":
                color = "bg-yellow-500";
                label = "Announcement";
                break;
              case "calendar":
                color = "bg-green-500";
                label = "Calendar";
                break;
              case "storage":
                color = "bg-gray-500";
                label = "Storage";
                break;
              case "timetracking":
                color = "bg-purple-500";
                label = "Time Tracking";
                break;
              case "finance":
                color = "bg-pink-500";
                label = "Finance";
                break;
              case "expense":
                color = "bg-red-500";
                label = "Expense";
                break;
              case "income":
                color = "bg-green-600";
                label = "Income"; // <-- Corrected here
                break;
              case "timesession":
                color = "bg-indigo-500";
                label = "Time Session";
                break;
              default:
                color = "bg-primary";
                label = "Page";
            }

            // Choose the correct link for each type
            let href = "#";
            switch (result.type) {
              case "user":
                href = `/app/users/${result._id}`;
                break;
              case "task":
                href = `/app/tasks#${result._id}`;
                break;
              case "announcement":
                href = `/app/announcements#${result._id}`;
                break;
              case "calendar":
                href = `/app/calendar#${result._id}`;
                break;
              case "storage":
                href = `/app/storage#${result._id}`;
                break;
              case "timetracking":
                href = `/app/time-tracking#${result._id}`;
                break;
              case "finance":
                href = `/app/finance#${result._id}`;
                break;
              case "expense":
                href = `/app/finance#${result._id}`;
                break;
              case "income":
                href = `/app/finance#${result._id}`;
                break;
              case "timesession":
                href = `/app/time-tracking#${result._id}`;
                break;
              case "page":
                href = result.path;
                break;
            }

            if (result.type === "user") {
              return (
                <button
                  key={result._id ? result._id + idx : result.name + idx}
                  type="button"
                  className="block w-full text-left px-5 py-4 mb-2 rounded-lg shadow hover:shadow-lg transition-all border border-gray-200 hover:bg-primary/10 cursor-pointer"
                  onClick={() => {
                    setSearch("");
                    setShowDropdown(false);
                    onUserCardClick({
                      _id: result._id,
                      firstName: result.firstName,
                      lastName: result.lastName,
                      email: result.email,
                      profileImage: result.profileImage,
                      description: result.description,
                      role: result.role,
                    });
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-base">
                      {result.name}
                    </span>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {result.email}
                      </span>
                      <span className="ml-3 text-xs bg-secondary text-white px-3 py-1 rounded-full">
                        User
                      </span>
                    </div>
                  </div>
                </button>
              );
            }

            // Generic card for other types
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
                  {/* Only render description for types you want, not for tasks, expenses, incomes */}
                  {result.description &&
                    !["task", "expense", "income"].includes(result.type) && (
                      <span className="block text-xs text-gray-500 mt-1">
                        {result.description}
                      </span>
                    )}
                </div>
                <span
                  className={`ml-4 text-xs ${color} text-white px-3 py-1 rounded-full`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardSearch;
