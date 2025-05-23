import { useAuth } from "../pages/_app"; // Adjust path
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { MdSpaceDashboard } from "react-icons/md";
import { FaUserClock } from "react-icons/fa6";
import { FaTasks } from "react-icons/fa";

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
  ];

  return (
    <div className="flex w-full min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-[300px] bg-gray-800 text-white px-5 py-6 flex flex-col">
        <img src="logo.png" className="w-[150px] mx-auto mb-8" alt="Logo" />
        <nav>
          <p className="text-gray-400 font-semibold text-sm uppercase">Main Menu</p>
          <ul className="mt-4 space-y-2">
            {menu.map((item) => (
              <li
                key={item.name}
                className={`p-3 rounded-lg transition-colors duration-300 ${
                  router.pathname === item.path
                    ? "bg-gray-700 text-white"
                    : "hover:bg-gray-700 text-gray-300"
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
        <button
          onClick={handleLogout}
          className="mt-auto bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
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