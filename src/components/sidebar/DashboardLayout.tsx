import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { ReactNode, useState, useEffect } from "react";
import SidebarNav from "@/components/sidebar/SidebarNav";
import MobileSidebar from "@/components/sidebar/MobileSidebar";
import UserProfileModal from "@/components/modals/UserProfileModal";
import AIWindow from "../AIWindow";
import { FaBars } from "react-icons/fa";
import { menu } from "@/components/menuConfig"; // Your menu config
import UniversalSearchBar from "@/components/sidebar/UniversalSearchBar";
import TimerAndFormPanel from "@/components/time-tracking/TimerAndFormPanel";
import { useTimeTracking } from "@/components/time-tracking/TimeTrackingContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, loadingUser, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const { isRunning, pomodoroMode, pomodoroRunning, ...timerContext } = useTimeTracking();
  const showPersistent =
    (isRunning || pomodoroRunning) &&
    router.pathname !== "/app/time-tracking";

  // State to toggle AI window
  const [isAIWindowOpen, setIsAIWindowOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Responsive check for desktop
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

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

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const incompleteTasksCount = incompleteTasks.length;

  const menuWithNotifications = menu.map((item) => {
    if (item.name === "Tasks" && incompleteTasksCount > 0) {
      return { ...item, notification: incompleteTasksCount };
    }
    return { ...item, notification: undefined };
  });

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-r from-gray-100 to-gray-200">
      {/* Hamburger button for mobile */}
      {!sidebarOpen && (
        <button
          className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 text-white p-2 rounded-lg shadow-lg focus:outline-none"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <FaBars className="text-2xl" />
        </button>
      )}
      {/* Sidebar for desktop */}
      <SidebarNav menu={menuWithNotifications} user={user} router={router} />
      {/* Sidebar drawer for mobile */}
      <MobileSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        menu={menu}
        user={user}
        router={router}
      />
      {/* Main Content */}
      <div
        className="flex-1 flex flex-col bg-gray-100"
        style={isAIWindowOpen && isDesktop ? { marginRight: 420, transition: 'margin 0.3s' } : {}}
      >
        {/* Universal Search Bar at the top, centered between sidebar and right edge */}
        <div className="w-full flex justify-center items-center mt-7">
          <div className="w-full max-w-3xl px-2 pointer-events-auto">
            <UniversalSearchBar />
          </div>
        </div>
        <main className="flex-1 bg-gray-100 rounded-tl-lg shadow-lg min-h-screen">
          {children}
        </main>
        {showPersistent && (
          <div 
            className={`fixed top-6 z-[100] max-w-full transition-all duration-300 ${isAIWindowOpen && isDesktop ? 'w-64' : 'w-96'}`}
            style={{
              right: isAIWindowOpen && isDesktop ? '440px' : '24px'
            }}
          >
            <TimerAndFormPanel
              {...timerContext}
              isRunning={pomodoroMode ? pomodoroRunning : isRunning}
              onStart={timerContext.startTimer}
              onStop={timerContext.stopTimer}
              onReset={timerContext.resetTimer}
              theme="light"
              sessionName={timerContext.sessionName}
              sessionDescription={timerContext.sessionDescription}
              sessionTag={timerContext.sessionTag}
              setSessionTag={timerContext.setSessionTag}
              onNameChange={timerContext.setSessionName}
              onDescriptionChange={timerContext.setSessionDescription}
              onSave={timerContext.saveSession}
              pomodoroMode={pomodoroMode}
              pomodoroPhase={timerContext.pomodoroPhase}
              pomodoroTime={timerContext.pomodoroTime}
              pomodoroCycles={timerContext.pomodoroCycles}
              workDuration={timerContext.WORK_DURATION}
              breakDuration={timerContext.BREAK_DURATION}
              persistent
              isAIWindowOpen={isAIWindowOpen && isDesktop}
            />
          </div>
        )}
      </div>
      {/* AI Button (hide on desktop if open) */}
      {!(sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768) && (!isDesktop || !isAIWindowOpen) && (
        <button
          onClick={() => setIsAIWindowOpen(!isAIWindowOpen)}
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
