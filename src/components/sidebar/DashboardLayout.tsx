import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { ReactNode, useState, useEffect } from "react";
import SidebarNav from "@/components/sidebar/SidebarNav";
import MobileSidebar from "@/components/sidebar/MobileSidebar";
import UserProfileModal from "@/components/modals/UserProfileModal";
import AIWindow from "../AIWindow";
import { FaBars } from "react-icons/fa";
import { menu } from "@/components/menuConfig"; // Your menu config

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, loadingUser, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // State to toggle AI window
  const [isAIWindowOpen, setIsAIWindowOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [search, setSearch] = useState("");
  // type PageResult = {
  //   type: "page";
  //   name: string;
  //   path: string;
  //   icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  //   notification?: number | null;
  // };
  // type UserResult = { type: "user"; name: string; email: string; _id: string };
  // type SearchResult = PageResult | UserResult;
  // const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  interface UserId {
    firstName?: string;
    lastName?: string;
    email?: string;
    _id?: string;
  }

  interface User {
    userId: UserId;
    _id: string;
    [key: string]: unknown; // Use unknown instead of any for additional properties
  }

  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    if (!loadingUser && !isAuthenticated) {
      // Asigură-te că nu redirecționezi la infinit dacă pagina curentă este deja pagina de login
      if (router.pathname !== "/login") {
        router.push("/login");
      }
    }
  }, [loadingUser, isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;
    // Fetch tasks
    fetch("/api/tasks")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setTasks(data))
      .catch(() => {});
  }, [user]);

  const handleLogout = async () => {
    try {
      logout(); // Call the logout function from useAuth
      // Clear sensitive state
      setTasks([]);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Ensure hooks are called consistently
  if (!user) {
    return null; // Or a spinner
  }

  const incompleteTasksCount = tasks.filter((t) => !t.completed).length;

  const menuWithNotifications = menu.map((item) => {
    if (item.name === "Tasks" && incompleteTasksCount > 0) {
      return { ...item, notification: incompleteTasksCount };
    }
    return { ...item, notification: undefined };
  });

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
      <SidebarNav
        menu={menuWithNotifications}
        user={user}
        router={router}
        handleLogout={handleLogout}
      />
      {/* Sidebar drawer for mobile */}
      <MobileSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        menu={menu}
        user={user}
        router={router}
        handleLogout={handleLogout}
      />
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
      <UserProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default DashboardLayout;
