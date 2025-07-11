import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { ReactNode, useState, useEffect } from "react";
import SidebarNav from "@/components/sidebar/SidebarNav";
import MobileSidebar from "@/components/sidebar/MobileSidebar";
import UserProfileModal from "@/components/modals/UserProfileModal";
import AIWindow from "../AIWindow";
import { FaBars } from "react-icons/fa";
import { menu } from "@/components/menuConfig"; // Your menu config
import PersistentTimer from "@/components/time-tracking/PersistentTimer";
import { useTimeTracking } from "@/components/time-tracking/TimeTrackingContext";
import { useAIWindow } from "@/contexts/AIWindowContext";
import Link from "next/link";
import HeaderNavBar from "@/components/header/HeaderNavBar";
import { useTranslations, useLocale } from "next-intl";

interface DashboardLayoutProps {
  children: React.ReactNode;
  locale?: string;
  requireAuth?: boolean; // <-- Add this prop, default true
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, locale, requireAuth = true }) => {
  const { user, loadingUser, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const currentLocale = locale || useLocale() || "en";
  const t = useTranslations("Navigation"); // This will use the correct locale automatically

  const { isRunning, pomodoroMode, pomodoroRunning, ...timerContext } =
    useTimeTracking();
  const { isAIWindowOpen, setIsAIWindowOpen, toggleAIWindow } = useAIWindow();
  const [showPersistentTimer, setShowPersistentTimer] = useState(false);
  const [timerClosed, setTimerClosed] = useState(false);

  // Show persistent timer only if time > 0, not on time-tracking page, and not closed
  const shouldShowPersistentTimer =
    !timerClosed &&
    router.pathname !== "/app/time-tracking" &&
    (
      (pomodoroMode
        ? timerContext.pomodoroTime > 0
        : timerContext.elapsedTime > 0)
    );

  // State to toggle AI window - now managed by context
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Responsive check for desktop
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Only redirect to login if requireAuth is true
  useEffect(() => {
    if (requireAuth && !loadingUser && !isAuthenticated) {
      if (router.pathname !== "/login") {
        router.push("/login");
      }
    }
  }, [requireAuth, loadingUser, isAuthenticated, router]);

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

  // Only block rendering if requireAuth and no user
  if (requireAuth && !user) {
    // Fix: Only pass user if not null, else pass a fallback user object or skip rendering SidebarNav
    return null; // Or a spinner
  }

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const incompleteTasksCount = incompleteTasks.length;

  const menuWithNotifications = menu.map((item) => {
    if (item.name === t("tasks") && incompleteTasksCount > 0) {
      return { ...item, notification: incompleteTasksCount };
    }
    return { ...item, notification: undefined };
  });

  return (
    <div className="flex w-full min-h-screen bg-gray-100">
      {/* Header NavBar */}
      <HeaderNavBar t={t} />
      {/* Sidebar for desktop */}
      {user && (
        <SidebarNav menu={menuWithNotifications} user={user} router={router} t={t} />
      )}
      {/* Sidebar drawer for mobile */}
      {user && (
        <MobileSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          menu={menu}
          user={user}
          router={router}
          t={t}
        />
      )}
      {/* Main Content */}
      <div
        className="flex-1 flex flex-col bg-gray-100"
        style={{
          marginLeft: 300, // width of the fixed sidebar
          marginTop: 42,   // height of the absolute header (14 * 4)
          marginRight: isDesktop && isAIWindowOpen ? 420 : 0,
        }}
      >
        <main className="flex-1 bg-gray-100 rounded-tl-lg shadow-lg min-h-screen">
          {children}
        </main>
        {/* Persistent Timer - Only show timer, no form */}
        {shouldShowPersistentTimer && (
          <PersistentTimer
            elapsedTime={timerContext.elapsedTime}
            isRunning={pomodoroMode ? pomodoroRunning : isRunning}
            onStart={timerContext.startTimer}
            onStop={timerContext.stopTimer}
            onReset={timerContext.resetTimer}
            onClose={() => setTimerClosed(true)}
            pomodoroMode={pomodoroMode}
            pomodoroPhase={timerContext.pomodoroPhase}
            pomodoroTime={timerContext.pomodoroTime}
            pomodoroCycles={timerContext.pomodoroCycles}
            workDuration={timerContext.WORK_DURATION}
            breakDuration={timerContext.BREAK_DURATION}
          />
        )}
      </div>
      {/* AI Button (hide on desktop if open) */}
      {!(
        sidebarOpen &&
        typeof window !== "undefined" &&
        window.innerWidth < 768
      ) &&
        (!isDesktop || !isAIWindowOpen) && (
          <button
            onClick={toggleAIWindow}
            className="fixed bottom-4 right-4 w-auto h-16 px-6 bg-primary to-primary-dark text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 active:scale-95 z-50"
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
        )}
      {/* AI Window: right panel on desktop, modal on mobile */}
      <AIWindow
        isOpen={isAIWindowOpen}
        onClose={() => setIsAIWindowOpen(false)}
        isDesktop={isDesktop}
        locale={currentLocale}
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
