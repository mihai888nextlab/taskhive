import { useAuth } from "../pages/_app"; // Adjust path
import { useRouter } from "next/router";
import { ReactNode, useState } from "react";
import { MdSpaceDashboard } from "react-icons/md";
import { MdSettings } from "react-icons/md";
import { FaUserClock } from "react-icons/fa6";
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

  const [isAIWindowOpen, setIsAIWindowOpen] = useState(false); // State to toggle AI window

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        router.push("/auth/login");
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
    { name: "Tasks", path: "/app/profile", icon: FaTasks },
    { name: "Calendar", path: "/app/calendar", icon: FaCalendarAlt },
    { name: "Settings", path: "/app/settings", icon: MdSettings },
  ];

  return (
    <div className="flex w-full min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-[300px] bg-gray-800 text-white px-5 py-6 flex flex-col">
        <img
          src="http://localhost:3000/logo.png"
          className="w-[150px] mx-auto mb-8"
          alt="Logo"
        />
        <nav>
          <p className="text-gray-400 font-semibold text-sm uppercase">
            Main Menu
          </p>
          <ul className="mt-4 space-y-2">
            {menu.map((item) => (
              <li
                key={item.name}
                className={`p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md ${
                  router.pathname === item.path
                    ? "bg-gray-700 text-white shadow-md"
                    : "hover:bg-gray-700 hover:text-white text-gray-300"
                }`}
              >
                <Link href={item.path} className="flex items-center">
                  {item.icon && (
                    <item.icon className="mr-3 text-xl text-primary" />
                  )}
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Divider */}
        <div className="mt-8 mb-4 border-t border-gray-700 opacity-50"></div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-auto bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white p-8 rounded-tl-lg shadow-lg">
        {children}
      </main>

      {/* AI Button */}
      <button
        onClick={() => setIsAIWindowOpen(!isAIWindowOpen)} // Toggle AI window
        className="fixed bottom-4 right-4 w-auto h-16 px-6 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all flex items-center justify-center space-x-2 active:scale-95"
      >
        <span className="text-lg font-semibold">AI</span> {/* Increased font size */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {isAIWindowOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          )}
        </svg>
      </button>

      {/* AI Window */}
      <AIWindow isOpen={isAIWindowOpen} onClose={() => setIsAIWindowOpen(false)} />
    </div>
  );
};

export default DashboardLayout;