import { useAuth } from "@/pages/_app";
import { useRouter } from "next/router";
import { ReactNode, useState, useEffect } from "react";
import SidebarNav from "@/components/SidebarNav";
import MobileSidebar from "@/components/MobileSidebar";
import DashboardSearch from "@/components/DashboardSearch";
import UserProfileModal from "@/components/modals/UserProfileModal";
import AIWindow from "./AIWindow";
import { FaBars } from "react-icons/fa";
import { menu } from "@/components/menuConfig"; // Your menu config

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, setUser } = useAuth() as { user: any; setUser: (user: any) => void };
  const router = useRouter();

  // State to toggle AI window
  const [isAIWindowOpen, setIsAIWindowOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [tasksCount, setTasksCount] = useState(0); // State for incomplete tasks count
  const [tasks, setTasks] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [storageFiles, setStorageFiles] = useState<any[]>([]);
  const [timeTracking, setTimeTracking] = useState<any[]>([]);
  const [financeRecords, setFinanceRecords] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [timeSessions, setTimeSessions] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

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

  useEffect(() => {
    // Fetch tasks
    fetch("/api/tasks")
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(() => {});

    // Fetch announcements
    fetch("/api/announcements")
      .then(res => res.json())
      .then(data => setAnnouncements(data.announcements || []))
      .catch(() => {});

    // Fetch calendar events
    fetch("/api/calendar")
      .then(res => res.json())
      .then(data => setCalendarEvents(data.events || []))
      .catch(() => {});

    // Fetch storage files
    fetch("/api/storage")
      .then(res => res.json())
      .then(data => setStorageFiles(data.files || []))
      .catch(() => {});

    // Fetch time tracking
    fetch("/api/time-tracking")
      .then(res => res.json())
      .then(data => setTimeTracking(data.entries || []))
      .catch(() => {});

    // Fetch finance records
    fetch("/api/finance")
      .then(res => res.json())
      .then(data => setFinanceRecords(data.records || []))
      .catch(() => {});

    // Fetch expenses
    fetch("/api/expenses")
      .then(res => res.json())
      .then(data => setExpenses(data || []))
      .catch(() => {});

    // Fetch incomes (if you have a separate endpoint)
    fetch("/api/incomes")
      .then(res => res.json())
      .then(data => setIncomes(data || []))
      .catch(() => {});

    // Fetch time sessions
    fetch("/api/time-sessions")
      .then(res => res.json())
      .then(data => setTimeSessions(Array.isArray(data) ? data : (data.sessions || [])))
      .catch(() => {});
  }, []);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      const data = await response.json();
      const incompleteTasks = data.filter((task: any) => !task.completed);
      setTasksCount(incompleteTasks.length);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Call fetchTasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Function to create a new task
  const createTask = async (taskData: { title: string; description: string; deadline: string }) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) {
        throw new Error("Failed to create task");
      }
      // Refetch tasks to update the count
      await fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  // Function to complete a task
  const completeTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH", // Assuming you have a PATCH endpoint for completing tasks
      });
      if (!response.ok) {
        throw new Error("Failed to complete task");
      }
      // Refetch tasks to update the count
      await fetchTasks();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  // Handler for logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
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
        users={users}
        tasks={tasks}
        announcements={announcements}
        calendarEvents={calendarEvents}
        storageFiles={storageFiles}
        timeTracking={timeTracking}
        financeRecords={financeRecords}
        expenses={expenses}
        incomes={incomes}
        timeSessions={timeSessions}
        onUserCardClick={(user) => {
          setSelectedUser(user);
          setProfileModalOpen(true);
        }}
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
