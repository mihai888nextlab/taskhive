import { useAuth } from "../pages/_app"; // Adjust path
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { MdSpaceDashboard, MdSettings } from "react-icons/md"; // Import the settings icon
import { FaUserClock, FaTasks, FaCalendarAlt } from "react-icons/fa"; // Import other icons

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, setUser } = useAuth();
  const router = useRouter();

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
      <aside className="w-[300px] bg-gray-800 text-white px-5 py-6 flex flex-col shadow-lg">
        {/* Logo */}
        <img
          src="logo.png"
          className="w-[180px] mx-auto mb-8 transition-shadow duration-300"
          alt="Logo"
        />

        {/* Navigation */}
        <nav>
          <p className="text-gray-400 font-semibold text-sm uppercase tracking-wider">Main Menu</p>
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
                <a href={item.path} className="flex items-center">
                  {item.icon && <item.icon className="mr-3 text-xl text-primary" />}
                  {item.name}
                </a>
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
    </div>
  );
};

export default DashboardLayout;