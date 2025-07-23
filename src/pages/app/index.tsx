import React, { useEffect, useState, useMemo } from "react";
import DashboardAnnouncementPreview from "@/components/dashboard/DashboardAnnouncementPreview";
import DashboardUsersPreview from "@/components/dashboard/DashboardUsersPreview";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import Statistics from "@/components/dashboard/Statistics";
import { useTheme } from "@/components/ThemeContext";
import DashboardFinancePreview from "@/components/dashboard/DashboardFinancePreview";
import DashboardTaskPreview from "@/components/dashboard/DashboardTaskPreview";
import DashboardCalendarPreview from "@/components/dashboard/DashboardCalendarPreview";
import DashboardTimeTrackingPreview from "@/components/dashboard/DashboardTimeTrackingPreview";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Link from "next/link";
import {
  FaUserClock,
  FaTasks,
  FaCalendarAlt,
  FaArrowRight,
  FaMoneyBillWave,
  FaBullhorn,
  FaClock,
} from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Head from "next/head";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";

// Generic card wrapper for consistent UI
const DashboardCard: React.FC<{
  icon: React.ReactElement<any>;
  title: string;
  description: string;
  headerBg: string;
  iconBg: string;
  iconColor: string;
  children?: React.ReactNode;
}> = ({ icon, title, description, headerBg, iconBg, iconColor, children }) => {
  const { theme } = useTheme();
  const cardBackground = theme === "dark" ? "bg-gray-800" : "bg-white";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  // Map headerBg to border hover color
  let borderHover = "";
  if (headerBg.includes("blue")) borderHover = "hover:border-blue-500";
  else if (headerBg.includes("yellow")) borderHover = "hover:border-yellow-500";
  else if (headerBg.includes("green")) borderHover = "hover:border-green-500";
  else if (headerBg.includes("purple")) borderHover = "hover:border-purple-500";
  else
    borderHover =
      theme === "dark" ? "hover:border-gray-500" : "hover:border-gray-400";

  return (
    <div
      className={`relative ${cardBackground} rounded-2xl border ${borderColor} ${borderHover} transition-colors duration-200 flex flex-col overflow-hidden h-full`}
    >
      {/* Card Header */}
      <div
        className={`flex items-center gap-4 p-6 border-b ${headerBg}`}
        style={theme === "dark" ? { opacity: 0.8 } : undefined}
      >
        <div
          className={`p-3 rounded-xl flex-shrink-0 flex items-center justify-center ${iconBg}`}
        >
          {React.cloneElement(icon, {
            className: `w-5 h-5 ${iconColor}`,
          })}
        </div>
        <div>
          <h2
            className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            {title}
          </h2>
          <p
            className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
          >
            {description}
          </p>
        </div>
      </div>
      {/* Card Content */}
      <div className="flex-1 flex flex-col p-6">{children}</div>
    </div>
  );
};

const DashboardPage: NextPageWithLayout = React.memo(() => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const t = useTranslations("DashboardPage");
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncomes, setTotalIncomes] = useState(0);
  const [profit, setProfit] = useState(0);

  const [announcementPreview, setAnnouncementPreview] = useState<any>(null);
  const [loadingAnnouncement, setLoadingAnnouncement] = useState(true);
  const [announcementError, setAnnouncementError] = useState<string | null>(
    null
  );

  // Add state for the Tasks card title
  const [tasksCardTitle, setTasksCardTitle] = useState(
    t("tasks", { default: "Tasks" })
  );

  // Time tracking preview state
  const [streak, setStreak] = useState(0);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/get-users");
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        setUsers(data.users);
      } catch {}
      setLoadingUsers(false);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/get-stats");
        if (!response.ok) throw new Error("Failed to fetch statistics");
        const data = await response.json();
        setStats(data);
      } catch {
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const response = await fetch("/api/expenses");
        if (!response.ok) throw new Error("Failed to fetch finance data");
        const data = await response.json();
        // Only company finances
        const companyData = data.filter(
          (item: any) => item.companyId === user?.companyId
        );
        const expenses = companyData.filter(
          (item: any) => item.type === "expense"
        );
        const incomes = companyData.filter(
          (item: any) => item.type === "income"
        );
        setTotalExpenses(
          expenses.reduce(
            (total: number, expense: any) => total + expense.amount,
            0
          )
        );
        setTotalIncomes(
          incomes.reduce(
            (total: number, income: any) => total + income.amount,
            0
          )
        );
        setProfit(
          incomes.reduce(
            (total: number, income: any) => total + income.amount,
            0
          ) -
            expenses.reduce(
              (total: number, expense: any) => total + expense.amount,
              0
            )
        );
      } catch {}
    };
    if (user?.companyId) fetchFinanceData();
  }, [user]);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      setLoadingAnnouncement(true);
      setAnnouncementError(null);
      try {
        const res = await fetch("/api/announcements");
        if (!res.ok) throw new Error("Failed to fetch announcements");
        const data = await res.json();
        // Sort: pinned first, then by createdAt desc
        const sorted = [...data].sort(
          (a, b) =>
            (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAnnouncementPreview(sorted[0] || null);
      } catch (e: any) {
        setAnnouncementError(e.message || "Error loading announcement");
      } finally {
        setLoadingAnnouncement(false);
      }
    };
    fetchAnnouncement();
  }, []);

  useEffect(() => {
    // Fetch time tracking streak and sessions for preview
    const fetchTimeTrackingPreview = async () => {
      if (!user?._id) return;
      try {
        const res = await fetch(`/api/time-sessions?userId=${user._id}`);
        if (!res.ok) return;
        const fetchedSessions = await res.json();
        if (Array.isArray(fetchedSessions) && fetchedSessions.length > 0) {
          // Streak: count consecutive days with sessions
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

  // Memoize filtered users for Table
  const filteredTableUsers = useMemo(() => {
    return users
      .filter((u) => u.companyId === user?.companyId)
      .slice(0, 5)
      .map((user) => ({
        id: user._id,
        firstName: user.userId.firstName,
        lastName: user.userId.lastName,
        email: user.userId.email,
      }));
  }, [users, user]);

  // Memoize Table columns
  const tableColumns = useMemo(
    () => [
      { key: "firstName", header: t("firstName", { default: "First Name" }) },
      { key: "lastName", header: t("lastName", { default: "Last Name" }) },
      { key: "email", header: t("email", { default: "Email" }) },
    ],
    [t]
  );

  return (
    <div
      className={`sm:p-7 min-h-screen rounded-lg ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}
      style={{ maxWidth: "100vw", overflowX: "hidden" }}
    >
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      {/* Cards Grid */}
      <div className="w-full flex flex-col gap-5 md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 md:gap-5">
        {/* Tasks Card */}
        <div
          className="w-full px-2 flex md:block md:px-0 group"
          role="button"
          tabIndex={0}
          onClick={() => {
            window.location.href = "/app/tasks";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              window.location.href = "/app/tasks";
          }}
          style={{ cursor: "pointer" }}
          aria-label={t("goToTasksPage", { default: "Go to tasks page" })}
        >
          <DashboardCard
            icon={<FaTasks />}
            title={t("tasks")}
            description={t("tasksDescription", {
              default:
                "Organize and track your team's assignments and progress.",
            })}
            headerBg={
              theme === "dark"
                ? "bg-blue-900 border-blue-800"
                : "bg-blue-50 border-blue-200"
            }
            iconBg={theme === "dark" ? "bg-blue-600" : "bg-blue-500"}
            iconColor="text-white"
          >
            <DashboardTaskPreview
              userId={user?._id}
              userEmail={user?.email}
              setTitle={setTasksCardTitle}
            />
          </DashboardCard>
        </div>
        {/* Announcements Card */}
        <div
          className="w-full px-2 flex md:block md:px-0"
          role="button"
          tabIndex={0}
          onClick={() => {
            window.location.href = "/app/announcements";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              window.location.href = "/app/announcements";
          }}
          style={{ cursor: "pointer" }}
          aria-label={t("goToAnnouncementsPage", {
            default: "Go to announcements page",
          })}
        >
          <DashboardCard
            icon={<FaBullhorn />}
            title={t("announcement", { default: "Announcement" })}
            description={t("announcementDescription", {
              default:
                "Stay up to date with the latest company news and updates.",
            })}
            headerBg={
              theme === "dark"
                ? "bg-yellow-900 border-yellow-800"
                : "bg-yellow-50 border-yellow-200"
            }
            iconBg={theme === "dark" ? "bg-yellow-600" : "bg-yellow-500"}
            iconColor="text-white"
          >
            <DashboardAnnouncementPreview
              loadingAnnouncement={loadingAnnouncement}
              announcementError={announcementError}
              announcementPreview={announcementPreview}
              theme={theme}
              t={t}
            />
          </DashboardCard>
        </div>
        {/* Finance Card */}
        <div
          className="w-full px-2 flex md:block md:px-0"
          role="button"
          tabIndex={0}
          onClick={() => {
            window.location.href = "/app/finance";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              window.location.href = "/app/finance";
          }}
          style={{ cursor: "pointer" }}
          aria-label={t("goToFinancePage", { default: "Go to finance page" })}
        >
          <DashboardCard
            icon={<FaMoneyBillWave />}
            title={t("finance", { default: "Finance" })}
            description={t("financeDescription", {
              default:
                "Keep track of your income, expenses, and overall financial health.",
            })}
            headerBg={
              theme === "dark"
                ? "bg-green-900 border-green-800"
                : "bg-green-50 border-green-200"
            }
            iconBg={theme === "dark" ? "bg-green-600" : "bg-green-500"}
            iconColor="text-white"
          >
            <DashboardFinancePreview
              totalExpenses={totalExpenses}
              totalIncomes={totalIncomes}
              profit={profit}
            />
          </DashboardCard>
        </div>
        {/* Users Card */}
        <div
          className="w-full px-2 flex md:block md:px-0"
          role="button"
          tabIndex={0}
          onClick={() => {
            window.location.href = "/app/users";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              window.location.href = "/app/users";
          }}
          style={{ cursor: "pointer" }}
          aria-label={t("goToUsersPage", { default: "Go to users page" })}
        >
          <DashboardCard
            icon={<FaUserClock />}
            title={t("users", { default: "Users" })}
            description={t("usersDescription", {
              default:
                "Manage user accounts, roles, and permissions within your team.",
            })}
            headerBg={
              theme === "dark"
                ? "bg-blue-900 border-blue-800"
                : "bg-blue-50 border-blue-200"
            }
            iconBg={theme === "dark" ? "bg-blue-600" : "bg-blue-500"}
            iconColor="text-white"
          >
            <DashboardUsersPreview
              loadingUsers={loadingUsers}
              filteredTableUsers={filteredTableUsers}
              theme={theme}
              t={t}
            />
          </DashboardCard>
        </div>
        {/* Time Tracking Card */}
        <div
          className="w-full px-2 flex md:block md:px-0"
          role="button"
          tabIndex={0}
          onClick={() => {
            window.location.href = "/app/time-tracking";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              window.location.href = "/app/time-tracking";
          }}
          style={{ cursor: "pointer" }}
          aria-label={t("goToTimeTrackingPage", { default: "Go to time tracking page" })}
        >
          <DashboardCard
            icon={<FaClock />}
            title={t("timeTracking", { default: "Time Tracking" })}
            description={t("timeTrackingDescription", { default: "Track your work sessions and productivity streaks." })}
            headerBg={
              theme === "dark"
                ? "bg-blue-900 border-blue-800"
                : "bg-blue-50 border-blue-200"
            }
            iconBg={theme === "dark" ? "bg-blue-600" : "bg-blue-500"}
            iconColor="text-white"
          >
            <DashboardTimeTrackingPreview
              streak={streak}
              sessions={sessions}
              theme={theme}
              t={t}
            />
          </DashboardCard>
        </div>
        {/* Calendar Card */}
        <div className="w-full px-2 flex md:block md:px-0">
          <DashboardCard
            icon={<FaCalendarAlt />}
            title={t("calendar", { default: "Calendar" })}
            description={t("calendarDescription", {
              default:
                "View deadlines, scheduled meetings, and project milestones.",
            })}
            headerBg={
              theme === "dark"
                ? "bg-purple-900 border-purple-800"
                : "bg-purple-50 border-purple-200"
            }
            iconBg={theme === "dark" ? "bg-purple-600" : "bg-purple-500"}
            iconColor="text-white"
          >
            <DashboardCalendarPreview
              userId={user?._id}
              userEmail={user?.email}
            />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
});

DashboardPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default React.memo(DashboardPage);
