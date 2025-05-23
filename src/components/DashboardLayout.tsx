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
  const { user, setUser } = useAuth(); // useAuth hook already returns AuthContextType
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null); // Clear user state in context
        router.push("/auth/login"); // Redirect to login
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (!user) {
    // This case should ideally be handled by _app.tsx redirecting,
    // but a fallback is good.
    return null; // Or a simple spinner if the redirect hasn't completed
  }

  const menu = [
    { name: "Dashboard", path: "/app", icon: MdSpaceDashboard },
    { name: "Users", path: "/app/users", icon: FaUserClock },
    { name: "Tasks", path: "/app/profile", icon: FaTasks },
  ];

  return (
    <div className="flex w-full min-h-screen">
      <aside className="w-[350px] px-5 py-6">
        <img src="logo.png" className="w-[175px]" alt="" />
        <nav className="mt-10">
          <p className="text-primary font-semibold text-sm">Main menu</p>
          <ul className="mt-2">
            {menu.map((item) => (
              <li
                key={item.name}
                className="hover:bg-[#393E46] p-3 rounded-xl duration-300"
              >
                <a
                  href={item.path}
                  className="flex items-center text-secondary transition-colors duration-300"
                >
                  {item.icon && (
                    <item.icon className="mr-3 text-2xl text-primary" />
                  )}
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="bg-white w-full">{children}</main>
    </div>
  );
};

export default DashboardLayout;
