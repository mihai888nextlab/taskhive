import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { ReactNode, useState, useEffect } from "react";
import Sidebar from "@/components/sidebar/SidebarNav";
import MobileSidebar from "@/components/sidebar/MobileSidebar";
import UserProfileModal from "@/components/modals/UserProfileModal";
import AIWindow from "../AIWindow";
import { FaBars } from "react-icons/fa";
import { menu } from "@/constants/menuConfig"; // Your menu config
import PersistentTimer from "@/components/time-tracking/PersistentTimer";
import { useTimeTracking } from "@/components/time-tracking/TimeTrackingContext";
import { useAIWindow } from "@/contexts/AIWindowContext";
import Link from "next/link";
import HeaderNavBar from "@/components/header/HeaderNavBar";
import { useTranslations, useLocale } from "next-intl";
import React from "react";
import SidebarNav from "@/components/sidebar/SidebarNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  locale?: string;
  requireAuth?: boolean; // <-- Add this prop, default true
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  locale,
  requireAuth = true,
}) => {
  const { user, loadingUser, isAuthenticated, hasCompany } = useAuth();
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
    (pomodoroMode
      ? timerContext.pomodoroTime > 0
      : timerContext.elapsedTime > 0);

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
    } else if (!hasCompany && !loadingUser) {
      router.push("/app/select-company");
    }
  }, [requireAuth, loadingUser, isAuthenticated, router]);

  useEffect(() => {
    if (!user || !hasCompany) return;
    // Fetch tasks
    fetch("/api/tasks")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setTasks(data))
      .catch(() => {});
  }, [user]);

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const incompleteTasksCount = incompleteTasks.length;

  const menuWithNotifications = menu.map((item) => {
    if (item.name === t("tasks") && incompleteTasksCount > 0) {
      return { ...item, notification: incompleteTasksCount };
    }
    return { ...item, notification: undefined };
  });

  // if (requireAuth && !user) {
  //   // Fix: Only pass user if not null, else pass a fallback user object or skip rendering SidebarNav
  //   return null; // Or a spinner
  // }

  return (
    <div className="flex w-full min-h-screen bg-gray-100 relative">
      {/* Header NavBar (desktop only) */}
      <div className="hidden md:block">
        <HeaderNavBar t={t} />
      </div>
      {/* Hamburger button for mobile */}
      {user && (
        !sidebarOpen ? (
          <button
            className="fixed top-4 left-4 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label={t("openSidebar", { default: "Open sidebar" })}
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        ) : (
          <button
            className="fixed top-4 left-4 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 text-white shadow-lg md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label={t("closeSidebar", { default: "Close sidebar" })}
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )
      )}
      {/* Sidebar for desktop */}
      {user && (
        <aside className="hidden md:block">
          <SidebarNav
            menu={menuWithNotifications}
            user={user}
            router={router}
            t={t}
          />
        </aside>
      )}
      {/* Sidebar drawer for mobile, pass header as prop */}
      {user && (
        <aside className="block md:hidden">
          <MobileSidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            menu={menu}
            user={user}
            router={router}
            t={t}
            header={<HeaderNavBar t={t} />}
          />
        </aside>
      )}
      {/* Main Content */}
      <div
        className="flex-1 flex flex-col bg-gray-100"
        style={{
          marginLeft: isDesktop ? 300 : 0, // Only add margin on desktop
          marginTop: 42, // height of the absolute header (14 * 4)
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
