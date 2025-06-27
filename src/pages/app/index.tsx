import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/sidebar/DashboardLayout';
import { NextPageWithLayout } from '@/types';
import Statistics from '@/components/dashboard/Statistics';
import { useTheme } from '@/components/ThemeContext';
import DashboardFinancePreview from '@/components/dashboard/DashboardFinancePreview';
import DashboardTaskPreview from '@/components/dashboard/DashboardTaskPreview';
import DashboardCalendarPreview from '@/components/dashboard/DashboardCalendarPreview';
import Table from '@/components/dashboard/Table';
import Link from 'next/link';
import { FaUserClock, FaTasks, FaCalendarAlt, FaArrowRight, FaMoneyBillWave, FaBullhorn } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Head from 'next/head';

// Generic card wrapper for consistent UI
const DashboardCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}> = ({ icon, title, description, children }) => {
  const { theme } = useTheme();
  const cardBackground = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const cardTextColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const borderColor = theme === 'light' ? 'border-gray-100' : 'border-gray-700';

  return (
    <div
      className={`group relative ${cardBackground} p-8 rounded-2xl shadow-xl ${borderColor} transition-all duration-300 transform hover:-translate-y-2 flex flex-col overflow-hidden`}
    >
      <div className="flex items-center mb-4">
        <div className="p-3 bg-primary-light/10 rounded-full mr-4 flex-shrink-0">
          {icon}
        </div>
        <h2 className={`text-2xl font-bold leading-snug ${cardTextColor}`}>{title}</h2>
      </div>
      <p className={`text-base mb-4 flex-grow ${cardTextColor}`}>{description}</p>
      {children && <div className="mt-auto">{children}</div>}
    </div>
  );
};

const DashboardPage: NextPageWithLayout = () => {
  const { theme } = useTheme();
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

  if (!currentUser) {
    return <p className="text-center text-gray-600 mb-8">Loading your dashboard...</p>;
  }

  return (
    <div
      className="p-4 sm:p-8 min-h-screen rounded-lg bg-transparent text-gray-900"
      style={{ maxWidth: '100vw', overflowX: 'hidden' }}
    >
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <h1 className="text-2xl sm:text-4xl font-extrabold mb-6 sm:mb-10 text-center tracking-tight">
        Welcome to Your Dashboard!
      </h1>

      {/* {loadingStats ? (
        <p className="text-center text-gray-600 mb-8">Loading statistics...</p>
      ) : (
        stats && (
          <div className="mb-10">
            <Statistics {...stats} />
          </div>
        )
      )} */}

      <div
        className="w-full flex flex-col gap-6 md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 md:gap-8"
      >
        {/* Finance Card */}
        <div className="w-full px-2 flex md:block md:px-0">
          <DashboardCard
            icon={<FaMoneyBillWave className="text-primary text-3xl" />}
            title="Finance"
            description="Keep track of your income, expenses, and overall financial health."
          >
            <DashboardFinancePreview
              totalExpenses={totalExpenses}
              totalIncomes={totalIncomes}
              profit={profit}
            />
          </DashboardCard>
        </div>
        {/* Users Card */}
        <div className="w-full px-2 flex md:block md:px-0">
          <DashboardCard
            icon={<FaUserClock className="text-primary text-3xl" />}
            title="Users"
            description="Manage user accounts, roles, and permissions within your team."
          >
            <div className="flex flex-col h-full">
              {loadingUsers ? (
                <p className="text-gray-600">Loading users...</p>
              ) : users.length > 0 ? (
                <>
                  <Table
                    data={users
                      .filter(u => u.companyId === currentUser?.companyId)
                      .slice(0, 5)
                      .map((user) => ({
                        id: user._id,
                        firstName: user.userId.firstName,
                        lastName: user.userId.lastName,
                        email: user.userId.email,
                      }))
                    }
                    columns={[
                      { key: "firstName", header: "First Name" },
                      { key: "lastName", header: "Last Name" },
                      { key: "email", header: "Email" },
                    ]}
                    emptyMessage="No users registered."
                  />
                  <div className="text-center mt-8">
                    <Link
                      href="/app/users"
                      className="inline-flex items-center justify-center text-primary-dark hover:text-white font-bold text-lg transition-all duration-300 px-6 py-3 rounded-full bg-primary-light/20 hover:bg-gradient-to-r hover:from-primary hover:to-secondary shadow-md hover:shadow-xl transform hover:-translate-y-1 group"
                    >
                      <span className="mr-3">View All Users</span>
                      <FaArrowRight className="text-xl transform transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-gray-600 text-center p-5 bg-white rounded-md border border-gray-200 shadow-inner">
                  No users registered yet.
                </p>
              )}
            </div>
          </DashboardCard>
        </div>
        {/* Tasks Card */}
        <div className="w-full px-2 flex md:block md:px-0">
          <DashboardCard
            icon={<FaTasks className="text-primary text-3xl" />}
            title="Tasks"
            description="Organize and track your team's assignments and progress."
          >
            <DashboardTaskPreview userId={currentUser?._id} userEmail={currentUser?.email} />
          </DashboardCard>
        </div>
        {/* Announcements Card */}
        <div className="w-full px-2 flex md:block md:px-0">
          <DashboardCard
            icon={<FaBullhorn className="text-primary text-3xl" />}
            title="Announcement"
            description="Stay up to date with the latest company news and updates."
          >
            <div className={
              theme === "dark"
                ? "mt-6 p-5 bg-gray-800 rounded-xl shadow-lg border border-gray-700 transform transition-transform duration-300 hover:scale-[1.01]"
                : "mt-6 p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 transform transition-transform duration-300 hover:scale-[1.01]"
            }>
              <h3 className={
                theme === "dark"
                  ? "text-2xl font-extrabold text-gray-100 mb-5 pb-3 border-b-2 border-gray-600 leading-tight"
                  : "text-2xl font-extrabold text-gray-900 mb-5 pb-3 border-b-2 border-primary leading-tight"
              }>Announcement</h3>
              {loadingAnnouncement ? (
                <div className="flex flex-col justify-center items-center h-32 bg-primary-light/10 rounded-lg animate-pulse">
                  <FaBullhorn className="animate-bounce text-primary text-4xl mb-3" />
                  <span className="text-sm font-medium">Loading announcement...</span>
                </div>
              ) : announcementError ? (
                <div className="bg-red-50 border-l-4 border-red-400 text-red-400 p-4 rounded-md shadow-sm text-center font-medium">
                  <p className="mb-1">Failed to load announcement:</p>
                  <p className="text-sm italic">{announcementError}</p>
                </div>
              ) : !announcementPreview ? (
                <div className="text-center p-5 bg-blue-50/20 rounded-md border border-blue-200 shadow-inner">
                  <p className="font-bold text-lg mb-2">No announcements yet.</p>
                  <p className="text-sm leading-relaxed">
                    Stay tuned for important company updates!
                  </p>
                </div>
              ) : (
                <div className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-xl shadow-md border ${announcementPreview.pinned ? (theme === 'dark' ? 'bg-yellow-900 border-yellow-700' : 'bg-gradient-to-r from-yellow-50 to-white border-yellow-200') : (theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-r from-blue-50 to-white border-primary-light/50')} hover:shadow-lg transition-all duration-300 group`}
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
            </div>
            <div className="text-center mt-8">
              <Link href="/app/announcements" className={
                theme === "dark"
                  ? "inline-flex items-center justify-center text-gray-100 hover:bg-gray-600 font-bold text-lg transition-all duration-300 px-6 py-3 rounded-full bg-gray-700 shadow-md hover:shadow-xl transform hover:-translate-y-1 group"
                  : "inline-flex items-center justify-center text-primary-dark hover:text-white font-bold text-lg transition-all duration-300 px-6 py-3 rounded-full bg-primary-light/20 hover:bg-gradient-to-r hover:from-primary hover:to-secondary shadow-md hover:shadow-xl transform hover:-translate-y-1 group"
              }>
                <span className="mr-3">View All Announcements</span>
                <FaArrowRight className="text-xl transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </DashboardCard>
        </div>
        {/* Calendar Card */}
        <div className="w-full px-2 flex md:block md:px-0">
          <DashboardCard
            icon={<FaCalendarAlt className="text-primary text-3xl" />}
            title="Calendar"
            description="View deadlines, scheduled meetings, and project milestones."
          >
            <DashboardCalendarPreview userId={currentUser?._id} userEmail={currentUser?.email} />
          </DashboardCard>
        </div>
        {/* Settings Card */}
        <div className="w-full px-2 flex md:block md:px-0">
          <DashboardCard
            icon={<MdSettings className="text-primary text-3xl" />}
            title="Settings"
            description="Configure your application preferences, notifications, and integrations."
          >
            {/* Add settings preview or links here */}
            <p>Configure your application preferences, notifications, and integrations.</p>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

DashboardPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardPage;