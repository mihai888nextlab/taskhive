import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/sidebar/DashboardLayout';
import { NextPageWithLayout } from '@/types';
import Statistics from '@/components/dashboard/Statistics';
import { useTheme } from '@/components/ThemeContext';
import DashboardFinancePreview from '@/components/dashboard/DashboardFinancePreview';
import DashboardTaskPreview from '@/components/dashboard/DashboardTaskPreview';
import DashboardCalendarPreview from '@/components/dashboard/DashboardCalendarPreview';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import Link from 'next/link';
import { FaUserClock, FaTasks, FaCalendarAlt, FaArrowRight, FaMoneyBillWave, FaBullhorn } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Head from 'next/head';
import { useTranslations } from "next-intl";


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
  const cardBackground = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';

  // Map headerBg to border hover color
  let borderHover = '';
  if (headerBg.includes('blue')) borderHover = 'hover:border-blue-500';
  else if (headerBg.includes('yellow')) borderHover = 'hover:border-yellow-500';
  else if (headerBg.includes('green')) borderHover = 'hover:border-green-500';
  else if (headerBg.includes('purple')) borderHover = 'hover:border-purple-500';
  else borderHover = theme === 'dark' ? 'hover:border-gray-500' : 'hover:border-gray-400';

  return (
    <div
      className={`relative ${cardBackground} rounded-2xl border ${borderColor} ${borderHover} transition-colors duration-200 flex flex-col overflow-hidden h-full`}
    >
      {/* Card Header */}
      <div
        className={`flex items-center gap-4 p-6 border-b ${headerBg}`}
        style={theme === 'dark' ? { opacity: 0.8 } : undefined}
      >
        <div className={`p-3 rounded-xl flex-shrink-0 flex items-center justify-center ${iconBg}`}>
          {React.cloneElement(icon, {
            className: `w-5 h-5 ${iconColor}`,
          })}
        </div>
        <div>
          <h2 className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {title}
          </h2>
          <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
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
  const { theme } = useTheme();
  const t = useTranslations("DashboardPage");
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncomes, setTotalIncomes] = useState(0);
  const [profit, setProfit] = useState(0);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [announcementPreview, setAnnouncementPreview] = useState<any>(null);
  const [loadingAnnouncement, setLoadingAnnouncement] = useState(true);
  const [announcementError, setAnnouncementError] = useState<string | null>(null);

  // Add state for the Tasks card title
  const [tasksCardTitle, setTasksCardTitle] = useState(t("tasks", { default: "Tasks" }));

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
      } catch {} finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    fetch("/api/user")
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setCurrentUser(data.user))
      .catch(() => setCurrentUser(null));
  }, []);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const response = await fetch("/api/expenses");
        if (!response.ok) throw new Error("Failed to fetch finance data");
        const data = await response.json();
        // Only company finances
        const companyData = data.filter((item: any) => item.companyId === currentUser?.companyId);
        const expenses = companyData.filter((item: any) => item.type === 'expense');
        const incomes = companyData.filter((item: any) => item.type === 'income');
        setTotalExpenses(expenses.reduce((total: number, expense: any) => total + expense.amount, 0));
        setTotalIncomes(incomes.reduce((total: number, income: any) => total + income.amount, 0));
        setProfit(
          incomes.reduce((total: number, income: any) => total + income.amount, 0) -
          expenses.reduce((total: number, expense: any) => total + expense.amount, 0)
        );
      } catch {}
    };
    if (currentUser?.companyId) fetchFinanceData();
  }, [currentUser]);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      setLoadingAnnouncement(true);
      setAnnouncementError(null);
      try {
        const res = await fetch('/api/announcements');
        if (!res.ok) throw new Error('Failed to fetch announcements');
        const data = await res.json();
        // Sort: pinned first, then by createdAt desc
        const sorted = [...data].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAnnouncementPreview(sorted[0] || null);
      } catch (e: any) {
        setAnnouncementError(e.message || 'Error loading announcement');
      } finally {
        setLoadingAnnouncement(false);
      }
    };
    fetchAnnouncement();
  }, []);

  // Memoize filtered users for Table
  const filteredTableUsers = useMemo(() => {
    return users
      .filter(u => u.companyId === currentUser?.companyId)
      .slice(0, 5)
      .map((user) => ({
        id: user._id,
        firstName: user.userId.firstName,
        lastName: user.userId.lastName,
        email: user.userId.email,
      }));
  }, [users, currentUser]);

  // Memoize Table columns
  const tableColumns = useMemo(() => [
    { key: "firstName", header: t("firstName", { default: "First Name" }) },
    { key: "lastName", header: t("lastName", { default: "Last Name" }) },
    { key: "email", header: t("email", { default: "Email" }) },
  ], [t]);


  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center w-full bg-transparent">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          {/* Simple spinner */}
          <svg className="animate-spin w-12 h-12 text-blue-500 mb-4" viewBox="0 0 50 50">
            <circle className="opacity-20" cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="6" fill="none" />
            <path d="M25 5a20 20 0 0 1 20 20" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" />
          </svg>
          <p className="text-center text-lg font-semibold opacity-90 animate-pulse mt-2">{t("loadingDashboard", { default: "Loading your dashboard..." })}</p>
        </div>
        <style jsx>{`
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          .animate-fade-in {
            animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: none; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className={`sm:p-7 min-h-screen rounded-lg ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}
      style={{ maxWidth: '100vw', overflowX: 'hidden' }}
    >
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      {/* Cards Grid */}
      <div
        className="w-full flex flex-col gap-5 md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 md:gap-5"
      >
        {/* Tasks Card */}
        <div
          className="w-full px-2 flex md:block md:px-0 group"
          role="button"
          tabIndex={0}
          onClick={() => { window.location.href = '/app/tasks'; }}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') window.location.href = '/app/tasks'; }}
          style={{ cursor: 'pointer' }}
          aria-label={t("goToTasksPage", { default: "Go to tasks page" })}
        >
          <DashboardCard
            icon={<FaTasks />}
            title={t("tasks")}
            description={t("tasksDescription", { default: "Organize and track your team's assignments and progress." })}
            headerBg={theme === "dark" ? "bg-blue-900 border-blue-800" : "bg-blue-50 border-blue-200"}
            iconBg={theme === "dark" ? "bg-blue-600" : "bg-blue-500"}
            iconColor="text-white"
          >
            <DashboardTaskPreview
              userId={currentUser?._id}
              userEmail={currentUser?.email}
              setTitle={setTasksCardTitle}
            />
            {/* Tasks empty state (like tasks page) */}
            {/* 
              Example usage:
              {!hasTasks && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className={`flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <FaTasks className="text-4xl text-gray-400" />
                  </div>
                  <h4 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>No Tasks Found</h4>
                  <p className={`text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Create your first task to get started
                  </p>
                </div>
              )}
            */}
          </DashboardCard>
        </div>
        {/* Announcements Card */}
        <div className="w-full px-2 flex md:block md:px-0"
          role="button"
          tabIndex={0}
          onClick={() => { window.location.href = '/app/announcements'; }}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') window.location.href = '/app/announcements'; }}
          style={{ cursor: 'pointer' }}
          aria-label={t("goToAnnouncementsPage", { default: "Go to announcements page" })}
        >
          <DashboardCard
            icon={<FaBullhorn />}
            title={t("announcement", { default: "Announcement" })}
            description={t("announcementDescription", { default: "Stay up to date with the latest company news and updates." })}
            headerBg={theme === "dark" ? "bg-yellow-900 border-yellow-800" : "bg-yellow-50 border-yellow-200"}
            iconBg={theme === "dark" ? "bg-yellow-600" : "bg-yellow-500"}
            iconColor="text-white"
          >
            {/* Only render the announcement content, no extra container or heading */}
            {loadingAnnouncement ? (
              <div className="flex flex-col justify-center items-center h-32 bg-primary-light/10 rounded-lg animate-pulse">
                <FaBullhorn className="animate-bounce text-primary text-4xl mb-3" />
                <span className="text-sm font-medium">{t("loadingAnnouncement", { default: "Loading announcement..." })}</span>
              </div>
            ) : announcementError ? (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-400 p-4 rounded-md shadow-sm text-center font-medium">
                <p className="mb-1">{t("failedToLoadAnnouncement", { default: "Failed to load announcement:" })}</p>
                <p className="text-sm italic">{announcementError}</p>
              </div>
            ) : !announcementPreview ? (
              <div className="text-center py-16">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <FaBullhorn className="text-2xl text-gray-400" />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {t("noAnnouncementsYet", { default: "No announcements yet" })}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {t("checkBackLater", { default: "Check back later for company updates and news" })}
                </p>
              </div>
            ) : (
              <div className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-xl shadow-md border ${announcementPreview.pinned ? (theme === 'dark' ? 'bg-yellow-900 border-yellow-700' : 'bg-gradient-to-r from-yellow-50 to-white border-yellow-200') : (theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-white border-primary-light/50')} hover:scale-101 transition-all duration-300 group`}
              style={{ opacity: announcementPreview.pinned ? 1 : 0.95 }}
            >
              <div className="flex-1 pr-0 sm:pr-4 w-full min-w-0">
                <span className={`block font-bold text-lg sm:text-xl leading-tight break-words ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{announcementPreview.title}</span>
                <div className={`mt-2 line-clamp-2 break-words ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}> 
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{announcementPreview.content}</ReactMarkdown>
                </div>
                <div className="mt-3 text-xs sm:text-sm font-semibold flex flex-wrap items-center gap-2">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white ${announcementPreview.pinned ? 'bg-yellow-500' : 'bg-blue-500'}`}>{announcementPreview.category}</span>
                  {announcementPreview.pinned && (
                    <span className="ml-2 px-2.5 py-1 bg-yellow-400 text-white text-xs rounded-full font-bold flex items-center gap-1"><FaBullhorn />Pinned</span>
                  )}
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    By {announcementPreview.createdBy?.firstName} {announcementPreview.createdBy?.lastName}
                  </span>
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    • {new Date(announcementPreview.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="self-center pl-0 sm:pl-3 mt-3 sm:mt-0 hidden sm:block">
                <FaBullhorn className={`text-3xl sm:text-4xl ${announcementPreview.pinned ? 'text-yellow-400' : 'text-primary'}`} />
              </div>
            </div>
            )}
          </DashboardCard>
        </div>
        {/* Finance Card */}
        <div className="w-full px-2 flex md:block md:px-0"
          role="button"
          tabIndex={0}
          onClick={() => { window.location.href = '/app/finance'; }}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') window.location.href = '/app/finance'; }}
          style={{ cursor: 'pointer' }}
          aria-label={t("goToFinancePage", { default: "Go to finance page" })}
        >
          <DashboardCard
            icon={<FaMoneyBillWave />}
            title={t("finance", { default: "Finance" })}
            description={t("financeDescription", { default: "Keep track of your income, expenses, and overall financial health." })}
            headerBg={theme === "dark" ? "bg-green-900 border-green-800" : "bg-green-50 border-green-200"}
            iconBg={theme === "dark" ? "bg-green-600" : "bg-green-500"}
            iconColor="text-white"
          >
            <div style={theme === 'dark' ? { opacity: 0.8 } : undefined}>
              <DashboardFinancePreview
                totalExpenses={totalExpenses}
                totalIncomes={totalIncomes}
                profit={profit}
              />
            </div>
          </DashboardCard>
        </div>
        {/* Users Card */}
        <div className="w-full px-2 flex md:block md:px-0"
          role="button"
          tabIndex={0}
          onClick={() => { window.location.href = '/app/users'; }}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') window.location.href = '/app/users'; }}
          style={{ cursor: 'pointer' }}
          aria-label={t("goToUsersPage", { default: "Go to users page" })}
        >
          <DashboardCard
            icon={<FaUserClock />}
            title={t("users", { default: "Users" })}
            description={t("usersDescription", { default: "Manage user accounts, roles, and permissions within your team." })}
            headerBg={theme === "dark" ? "bg-blue-900 border-blue-800" : "bg-blue-50 border-blue-200"}
            iconBg={theme === "dark" ? "bg-blue-600" : "bg-blue-500"}
            iconColor="text-white"
          >
            <div className="flex flex-col h-full">
              {loadingUsers ? (
                <p className="text-gray-600">{t("loadingUsers", { default: "Loading users..." })}</p>
              ) : filteredTableUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("firstName", { default: "First Name" })}</TableHead>
                      <TableHead>{t("lastName", { default: "Last Name" })}</TableHead>
                      <TableHead>{t("email", { default: "Email" })}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTableUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.firstName}</TableCell>
                        <TableCell>{user.lastName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-16">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <FaUserClock className="text-2xl text-gray-400" />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}> 
                    {t("noTeamMembersYet", { default: "No team members yet" })}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}> 
                    {t("startByAddingFirstMember", { default: "Start by adding your first team member" })}
                  </p>
                </div>
              )}
            </div>
          </DashboardCard>
        </div>
        {/* Calendar Card */}
        <div className="w-full px-2 flex md:block md:px-0">
          <DashboardCard
            icon={<FaCalendarAlt />}
            title={t("calendar", { default: "Calendar" })}
            description={t("calendarDescription", { default: "View deadlines, scheduled meetings, and project milestones." })}
            headerBg={theme === "dark" ? "bg-purple-900 border-purple-800" : "bg-purple-50 border-purple-200"}
            iconBg={theme === "dark" ? "bg-purple-600" : "bg-purple-500"}
            iconColor="text-white"
          >
            <DashboardCalendarPreview userId={currentUser?._id} userEmail={currentUser?.email} />
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