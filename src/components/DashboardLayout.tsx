import { useAuth } from "@/pages/_app"; // Adjust path
import { useRouter } from "next/router";
import { ReactNode, useState, useEffect } from "react";
import { MdSpaceDashboard } from "react-icons/md";
import { MdSettings } from "react-icons/md";
import { FaUserClock } from "react-icons/fa6"; // Assuming FaUserClock is from fa6
import { FaTasks } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import { FaBullhorn } from "react-icons/fa";
import { IoIosChatboxes } from "react-icons/io";
import AIWindow from "./AIWindow"; // Import the AIWindow component
import { FaBars, FaTimes } from "react-icons/fa";
import { FaMoneyBillWave } from "react-icons/fa"; // Correct import for the finance icon
import { FaSignOutAlt } from "react-icons/fa"; // Import the logout icon

import Link from "next/link";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, setUser } = useAuth();
  const router = useRouter();

  // State to toggle AI window
  const [isAIWindowOpen, setIsAIWindowOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch users
  useEffect(() => {
    fetch("/api/get-users")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        setUsers(data.users || []);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Ensure hooks are called consistently
  const menu = [
    { name: "Dashboard", path: "/app", icon: MdSpaceDashboard },
    { name: "Users", path: "/app/users", icon: FaUserClock },
    { name: "Tasks", path: "/app/tasks", icon: FaTasks },
    { name: "Announcements", path: "/app/announcements", icon: FaBullhorn },
    { name: "Communication", path: "/app/communication", icon: IoIosChatboxes },
    { name: "Finance", path: "/app/finance", icon: FaMoneyBillWave },
    { name: "Calendar", path: "/app/calendar", icon: FaCalendarAlt },
    { name: "Settings", path: "/app/settings", icon: MdSettings },
    // Add Finance link
  ];

  // Search logic
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const lower = search.toLowerCase();
    const pageResults = menu.filter((m) =>
      m.name.toLowerCase().includes(lower)
    );

    // Filter users based on the search input
    const userResults = users.filter(
      (u) =>
        (u.userId.firstName &&
          u.userId.firstName.toLowerCase().includes(lower)) ||
        (u.userId.lastName &&
          u.userId.lastName.toLowerCase().includes(lower)) ||
        (u.userId.email && u.userId.email.toLowerCase().includes(lower))
    );

    // Set search results
    setSearchResults([
      ...pageResults.map((r) => ({ type: "page", ...r })),
      ...userResults.map((u) => ({
        type: "user",
        name:
          `${u.userId.firstName || ""} ${u.userId.lastName || ""}`.trim() ||
          "Unknown User",
        ...u,
      })),
    ]);
    setShowDropdown(true);
  }, [search, users]);

  // Check user at the end to ensure hooks are called consistently
  if (!user) {
    return null; // Or a spinner
  }

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-r from-gray-100 to-gray-200">
      {/* Hamburger button for mobile */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 text-white p-2 rounded-lg shadow-lg focus:outline-none"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <FaBars className="text-2xl" />
      </button>
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-[300px] bg-gradient-to-b from-gray-800 to-gray-900 text-white px-5 py-6 flex-col shadow-lg">
        <Link href="/app">
          <img
            src="http://localhost:3000/logo.png"
            className="w-[150px] mx-auto mb-8 cursor-pointer hover:opacity-90 transition-opacity duration-300"
            alt="Logo"
          />
        </Link>
        {/* Search Bar */}
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
              {searchResults.map((result, idx) =>
                result.type === "page" ? (
                  <Link
                    key={result.name + idx}
                    href={result.path}
                    className="block px-4 py-3 hover:bg-primary/10 transition-colors flex items-center"
                    onClick={() => {
                      setSearch("");
                      setShowDropdown(false);
                    }}
                  >
                    {result.icon && (
                      <result.icon className="mr-2 text-primary text-lg" />
                    )}
                    <span className="font-semibold">{result.name}</span>
                    <span className="ml-auto text-xs bg-primary text-white px-2 py-0.5 rounded">
                      Page
                    </span>
                  </Link>
                ) : (
                  <Link
                    key={result.email + idx}
                    href={`/app/users#${result._id}`}
                    className="block px-4 py-3 hover:bg-primary/10 transition-colors flex items-center"
                    onClick={() => {
                      setSearch("");
                      setShowDropdown(false);
                    }}
                  >
                    <span className="font-semibold">
                      {result.name || "Unknown User"}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {result.email}
                    </span>
                    <span className="ml-auto text-xs bg-secondary text-white px-2 py-0.5 rounded">
                      User
                    </span>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
        {/* End Search Bar */}
        <nav>
          <p className="text-gray-400 font-semibold text-sm uppercase tracking-wider">
            MAIN MENU
          </p>
          <ul className="mt-4 space-y-2">
            {menu.map((item) => (
              <li
                key={item.name}
                className={`p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md ${
                  router.pathname === item.path
                    ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-md"
                    : "hover:bg-gray-700 hover:text-white text-gray-300"
                }`}
              >
                <Link href={item.path} className="flex items-center">
                  {item.icon && (
                    <item.icon className="mr-3 text-xl text-primary-light" />
                  )}
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* Separator before user info */}
        <div className="mt-8 mb-4 border-t border-gray-700 opacity-50"></div>
        
        {/* User Profile Section */}
        <Link href="/app/settings" className="flex items-center space-x-3 px-3 py-2 mt-4 mb-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors duration-300 cursor-pointer">
            {/* Placeholder for profile picture, using first letter of name */}
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 font-bold text-lg">
                {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
            </div>
            <div>
                <p className="font-semibold text-white">
                    {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-400">
                    {user.email}
                </p>
            </div>
        </Link>

        <button
          onClick={handleLogout}
          className="mt-5 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center"
        >
          <FaSignOutAlt className="mr-2" />
          <span className="text-center">Logout</span>
        </button>
      </aside>
      {/* Sidebar drawer for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          ></div>
          {/* Drawer */}
          <aside className="relative w-64 max-w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 text-white px-5 py-6 flex flex-col shadow-lg animate-slideInLeft">
            <button
              className="absolute top-4 right-4 text-white text-2xl focus:outline-none"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <FaTimes />
            </button>
            <Link href="/app">
              <img
                src="http://localhost:3000/logo.png"
                className="w-[120px] mx-auto mb-8 cursor-pointer hover:opacity-90 transition-opacity duration-300"
                alt="Logo"
                onClick={() => setSidebarOpen(false)}
              />
            </Link>
            {/* Search Bar Mobile */}
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
                  {searchResults.map((result, idx) =>
                    result.type === "page" ? (
                      <Link
                        key={result.name + idx}
                        href={result.path}
                        className="block px-4 py-3 hover:bg-primary/10 transition-colors flex items-center"
                        onClick={() => {
                          setSearch("");
                          setShowDropdown(false);
                          setSidebarOpen(false);
                        }}
                      >
                        {result.icon && (
                          <result.icon className="mr-2 text-primary text-lg" />
                        )}
                        <span className="font-semibold">{result.name}</span>
                        <span className="ml-auto text-xs bg-primary text-white px-2 py-0.5 rounded">
                          Page
                        </span>
                      </Link>
                    ) : (
                      <Link
                        key={result.email + idx}
                        href={`/app/users#${result._id}`}
                        className="block px-4 py-3 hover:bg-primary/10 transition-colors flex items-center"
                        onClick={() => {
                          setSearch("");
                          setShowDropdown(false);
                          setSidebarOpen(false);
                        }}
                      >
                        <span className="font-semibold">
                          {result.name || "Unknown User"}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          {result.email}
                        </span>
                        <span className="ml-auto text-xs bg-secondary text-white px-2 py-0.5 rounded">
                          User
                        </span>
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
            {/* End Search Bar Mobile */}
            <nav>
              <p className="text-gray-400 font-semibold text-sm uppercase tracking-wider">
                MAIN MENU
              </p>
              <ul className="mt-4 space-y-2">
                {menu.map((item) => (
                  <li
                    key={item.name}
                    className={`p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md ${
                      router.pathname === item.path
                        ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-md"
                        : "hover:bg-gray-700 hover:text-white text-gray-300"
                    }`}
                  >
                    <Link
                      href={item.path}
                      className="flex items-center"
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.icon && (
                        <item.icon className="mr-3 text-xl text-primary-light" />
                      )}
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {/* Separator before user info */}
            <div className="mt-8 mb-4 border-t border-gray-700 opacity-50"></div>

            {/* User Profile Section Mobile */}
            <Link href="/app/settings" className="flex items-center space-x-3 px-3 py-2 mt-4 mb-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors duration-300 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 font-bold text-lg">
                    {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                </div>
                <div>
                    <p className="font-semibold text-white">
                        {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-400">
                        {user.email}
                    </p>
                </div>
            </Link>

            <button
              onClick={() => {
                setSidebarOpen(false);
                handleLogout();
              }}
              className="mt-5 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <FaSignOutAlt className="mr-2" />
              <span className="text-center">Logout</span>
            </button>
          </aside>
        </div>
      )}
      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-100 rounded-tl-lg shadow-lg min-h-screen">
        {children}
      </main>
      {/* AI Button */}
      <button
        onClick={() => setIsAIWindowOpen(!isAIWindowOpen)}
        className="fixed bottom-4 right-4 w-auto h-16 px-6 bg-primary to-primary-dark text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 active:scale-95"
      >
        <span className="text-lg font-semibold">AI</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transform transition-transform duration-300 ${
            isAIWindowOpen ? "rotate-45" : "rotate-0"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
      <AIWindow
        isOpen={isAIWindowOpen}
        onClose={() => setIsAIWindowOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;