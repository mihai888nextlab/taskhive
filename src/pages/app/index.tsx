import React from "react";
import DashboardAnnouncementPreview from "@/components/dashboard/DashboardAnnouncementPreview";
import DashboardUsersPreview from "@/components/dashboard/DashboardUsersPreview";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import DashboardFinancePreview from "@/components/dashboard/DashboardFinancePreview";
import DashboardTaskPreview from "@/components/dashboard/DashboardTaskPreview";
import DashboardCalendarPreview from "@/components/dashboard/DashboardCalendarPreview";
import DashboardTimeTrackingPreview from "@/components/dashboard/DashboardTimeTrackingPreview";
import { FaUserClock, FaTasks, FaCalendarAlt, FaMoneyBillWave, FaBullhorn, FaClock } from "react-icons/fa";
import Head from "next/head";
import { useDashboardPage } from "@/hooks/useDashboardPage";

// Generic card wrapper for consistent UI
const DashboardCard: React.FC<{
  icon: React.ReactElement<any>;
  title: string;
  description: string;
  headerBg: string;
  iconBg: string;
  iconColor: string;
  children?: React.ReactNode;
  theme?: string;
}> = ({ icon, title, description, headerBg, iconBg, iconColor, children, theme }) => {
  const cardBackground = theme === "dark" ? "bg-gray-800" : "bg-white";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  let borderHover = "";
  if (headerBg.includes("blue")) borderHover = "hover:border-blue-500";
  else if (headerBg.includes("yellow")) borderHover = "hover:border-yellow-500";
  else if (headerBg.includes("green")) borderHover = "hover:border-green-500";
  else if (headerBg.includes("purple")) borderHover = "hover:border-purple-500";
  else borderHover = theme === "dark" ? "hover:border-gray-500" : "hover:border-gray-400";

  return (
    <div className={`relative ${cardBackground} rounded-2xl border ${borderColor} ${borderHover} transition-colors duration-200 flex flex-col overflow-hidden h-full`}>
      <div className={`flex items-center gap-4 p-6 border-b ${headerBg}`} style={theme === "dark" ? { opacity: 0.8 } : undefined}>
        <div className={`p-3 rounded-xl flex-shrink-0 flex items-center justify-center ${iconBg}`}>
          {React.cloneElement(icon, { className: `w-5 h-5 ${iconColor}` })}
        </div>
        <div>
          <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>{title}</h2>
          <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{description}</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col p-6">{children}</div>
    </div>
  );
};

const DashboardPage: React.FC & { getLayout?: (page: React.ReactElement) => React.ReactNode } = React.memo(() => {
  const {
    user,
    theme,
    t,
    loadingUsers,
    filteredTableUsers,
    loadingAnnouncement,
    announcementError,
    announcementPreview,
    totalExpenses,
    totalIncomes,
    profit,
    tasksCardTitle,
    setTasksCardTitle,
    stats,
    loadingStats,
    tableColumns,
  } = useDashboardPage();

  // Time tracking preview state
  const [streak, setStreak] = React.useState(0);
  const [sessions, setSessions] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchTimeTrackingPreview = async () => {
      if (!user?._id) return;
      try {
        const res = await fetch(`/api/time-sessions?userId=${user._id}`);
        if (!res.ok) return;
        const fetchedSessions = await res.json();
        if (Array.isArray(fetchedSessions) && fetchedSessions.length > 0) {
          const days = fetchedSessions.map(s => new Date(s.createdAt).toDateString());
          const uniqueDays = Array.from(new Set(days)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          let streakCount = 1;
          for (let i = 1; i < uniqueDays.length; i++) {
            const prev = new Date(uniqueDays[i - 1]);
            const curr = new Date(uniqueDays[i]);
            if ((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24) === 1) {
              streakCount++;
            } else {
              break;
            }
          }
          setStreak(streakCount);
          setSessions(fetchedSessions.slice(0, 2).map(s => ({ name: s.name, duration: s.duration, tag: s.tag })));
        } else {
          setStreak(0);
          setSessions([]);
        }
      } catch {}
    };
    fetchTimeTrackingPreview();
  }, [user]);

  return (
    <div className={`sm:p-7 min-h-screen rounded-lg ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`} style={{ maxWidth: "100vw", overflowX: "hidden" }}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <div className="w-full flex flex-col gap-5 md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 md:gap-5">
        <div className="w-full px-2 flex md:block md:px-0 group" role="button" tabIndex={0} onClick={() => { window.location.href = "/app/tasks"; }} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") window.location.href = "/app/tasks"; }} style={{ cursor: "pointer" }} aria-label={t("goToTasksPage", { default: "Go to tasks page" })}>
          <DashboardCard icon={<FaTasks />} title={t("tasks")} description={t("tasksDescription", { default: "Organize and track your team's assignments and progress." })} headerBg={theme === "dark" ? "bg-blue-900 border-blue-800" : "bg-blue-50 border-blue-200"} iconBg={theme === "dark" ? "bg-blue-600" : "bg-blue-500"} iconColor="text-white" theme={theme}>
            <DashboardTaskPreview userId={user?._id} userEmail={user?.email} setTitle={setTasksCardTitle} />
          </DashboardCard>
        </div>
        <div className="w-full px-2 flex md:block md:px-0" role="button" tabIndex={0} onClick={() => { window.location.href = "/app/announcements"; }} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") window.location.href = "/app/announcements"; }} style={{ cursor: "pointer" }} aria-label={t("goToAnnouncementsPage", { default: "Go to announcements page" })}>
          <DashboardCard icon={<FaBullhorn />} title={t("announcement", { default: "Announcement" })} description={t("announcementDescription", { default: "Stay up to date with the latest company news and updates." })} headerBg={theme === "dark" ? "bg-yellow-900 border-yellow-800" : "bg-yellow-50 border-yellow-200"} iconBg={theme === "dark" ? "bg-yellow-600" : "bg-yellow-500"} iconColor="text-white" theme={theme}>
            <DashboardAnnouncementPreview loadingAnnouncement={loadingAnnouncement} announcementError={announcementError} announcementPreview={announcementPreview} theme={theme} t={t} />
          </DashboardCard>
        </div>
        <div className="w-full px-2 flex md:block md:px-0" role="button" tabIndex={0} onClick={() => { window.location.href = "/app/finance"; }} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") window.location.href = "/app/finance"; }} style={{ cursor: "pointer" }} aria-label={t("goToFinancePage", { default: "Go to finance page" })}>
          <DashboardCard icon={<FaMoneyBillWave />} title={t("finance", { default: "Finance" })} description={t("financeDescription", { default: "Keep track of your income, expenses, and overall financial health." })} headerBg={theme === "dark" ? "bg-green-900 border-green-800" : "bg-green-50 border-green-200"} iconBg={theme === "dark" ? "bg-green-600" : "bg-green-500"} iconColor="text-white" theme={theme}>
            <DashboardFinancePreview totalExpenses={totalExpenses} totalIncomes={totalIncomes} profit={profit} />
          </DashboardCard>
        </div>
        <div className="w-full px-2 flex md:block md:px-0" role="button" tabIndex={0} onClick={() => { window.location.href = "/app/users"; }} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") window.location.href = "/app/users"; }} style={{ cursor: "pointer" }} aria-label={t("goToUsersPage", { default: "Go to users page" })}>
          <DashboardCard icon={<FaUserClock />} title={t("users", { default: "Users" })} description={t("usersDescription", { default: "Manage user accounts, roles, and permissions within your team." })} headerBg={theme === "dark" ? "bg-blue-900 border-blue-800" : "bg-blue-50 border-blue-200"} iconBg={theme === "dark" ? "bg-blue-600" : "bg-blue-500"} iconColor="text-white" theme={theme}>
            <DashboardUsersPreview loadingUsers={loadingUsers} filteredTableUsers={filteredTableUsers} theme={theme} t={t} />
          </DashboardCard>
        </div>
        <div className="w-full px-2 flex md:block md:px-0" role="button" tabIndex={0} onClick={() => { window.location.href = "/app/time-tracking"; }} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") window.location.href = "/app/time-tracking"; }} style={{ cursor: "pointer" }} aria-label={t("goToTimeTrackingPage", { default: "Go to time tracking page" })}>
          <DashboardCard icon={<FaClock />} title={t("timeTracking", { default: "Time Tracking" })} description={t("timeTrackingDescription", { default: "Track your work sessions and productivity streaks." })} headerBg={theme === "dark" ? "bg-blue-900 border-blue-800" : "bg-blue-50 border-blue-200"} iconBg={theme === "dark" ? "bg-blue-600" : "bg-blue-500"} iconColor="text-white" theme={theme}>
            <DashboardTimeTrackingPreview streak={streak} sessions={sessions} theme={theme} t={t} />
          </DashboardCard>
        </div>
        <div className="w-full px-2 flex md:block md:px-0">
          <DashboardCard icon={<FaCalendarAlt />} title={t("calendar", { default: "Calendar" })} description={t("calendarDescription", { default: "View deadlines, scheduled meetings, and project milestones." })} headerBg={theme === "dark" ? "bg-purple-900 border-purple-800" : "bg-purple-50 border-purple-200"} iconBg={theme === "dark" ? "bg-purple-600" : "bg-purple-500"} iconColor="text-white" theme={theme}>
            <DashboardCalendarPreview userId={user?._id} userEmail={user?.email} />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
});

DashboardPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardPage;
