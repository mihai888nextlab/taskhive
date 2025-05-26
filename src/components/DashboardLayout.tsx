import { useAuth } from "@/pages/_app"; // Adjust path
import { useRouter } from "next/router";
import { ReactNode, useState } from "react";
import { MdSpaceDashboard } from "react-icons/md";
import { MdSettings } from "react-icons/md";
import { FaUserClock } from "react-icons/fa6"; // Assuming FaUserClock is from fa6
import { FaTasks } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import AIWindow from "./AIWindow"; // Import the AIWindow component

import Link from "next/link";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, setUser } = useAuth();
  const router = useRouter();

  // State to toggle AI window - Initialized to 'false' so it's hidden by default.
  // Click the AI button to toggle its visibility.
  const [isAIWindowOpen, setIsAIWindowOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null); // Clear the user state
        router.push("/"); // Redirect to the home page
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (!user) {
    return null; // Or a spinner
  }

  const menu = [
    { name: "Dashboard", path: "/app", icon: MdSpaceDashboard },
    { name: "Users", path: "/app/users", icon: FaUserClock },
    { name: "Tasks", path: "/app/tasks", icon: FaTasks },
    { name: "Calendar", path: "/app/calendar", icon: FaCalendarAlt },
    { name: "Settings", path: "/app/settings", icon: MdSettings },
  ];

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-r from-gray-100 to-gray-200">
      {/* Sidebar - Reverted to original styling */}
      <aside className="w-[300px] bg-gradient-to-b from-gray-800 to-gray-900 text-white px-5 py-6 flex flex-col shadow-lg">
        <Link href="/app">
          <img
            src="http://localhost:3000/logo.png"
            className="w-[150px] mx-auto mb-8 cursor-pointer hover:opacity-90 transition-opacity duration-300"
            alt="Logo"
          />
        </Link>
        <nav>
          <p className="text-gray-400 font-semibold text-sm uppercase tracking-wider">
            Main Menu
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

        {/* Divider - Reverted to original placement */}
        <div className="mt-8 mb-4 border-t border-gray-700 opacity-50"></div>

        {/* Logout Button - Reverted to original placement and styling (after divider) */}
        <button
          onClick={handleLogout}
          className="mt-5 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          Logout
        </button>
      </aside>

      {/* Main Content - Reverted to original styling */}
      <main className="flex-1 bg-white p-8 rounded-tl-lg shadow-lg">
        {children}
      </main>

      {/* AI Button - Class name fixed here from "b-primary" to "bg-primary" */}
      <button
        onClick={() => setIsAIWindowOpen(!isAIWindowOpen)} // Toggle AI window
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* AI Window */}
      <AIWindow isOpen={isAIWindowOpen} onClose={() => setIsAIWindowOpen(false)}/>
    </div>
  );
};

export default DashboardLayout;