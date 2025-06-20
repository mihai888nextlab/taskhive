import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { NextPageWithLayout } from '@/types';
import Statistics from '@/components/dashboard/Statistics';
import { useTheme } from '@/components/ThemeContext';
import DashboardFinancePreview from '@/components/dashboard/DashboardFinancePreview';
import DashboardTaskPreview from '@/components/dashboard/DashboardTaskPreview';
import DashboardCalendarPreview from '@/components/dashboard/DashboardCalendarPreview';
import Table from '@/components/dashboard/Table';
import Link from 'next/link';
import { FaUserClock, FaTasks, FaCalendarAlt, FaArrowRight, FaMoneyBillWave } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';

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

    const fetchFinanceData = async () => {
      try {
        const response = await fetch("/api/expenses");
        if (!response.ok) throw new Error("Failed to fetch finance data");
        const data = await response.json();
        const expenses = data.filter((item: any) => item.type === 'expense');
        const incomes = data.filter((item: any) => item.type === 'income');
        setTotalExpenses(expenses.reduce((total: number, expense: any) => total + expense.amount, 0));
        setTotalIncomes(incomes.reduce((total: number, income: any) => total + income.amount, 0));
        setProfit(
          incomes.reduce((total: number, income: any) => total + income.amount, 0) -
          expenses.reduce((total: number, expense: any) => total + expense.amount, 0)
        );
      } catch {}
    };

    fetchUsers();
    fetchFinanceData();
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

  return (
    <div className="p-8 min-h-full rounded-lg bg-transparent text-gray-900">
      <h1 className="text-4xl font-extrabold mb-10 text-center tracking-tight">
        Welcome to Your Dashboard!
      </h1>

      {loadingStats ? (
        <p className="text-center text-gray-600 mb-8">Loading statistics...</p>
      ) : (
        stats && (
          <div className="mb-10">
            <Statistics {...stats} />
          </div>
        )
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
        {/* Finance Card */}
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

        {/* Users Card */}
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
                  data={users.slice(0, 5).map((user) => ({
                    id: user._id,
                    firstName: user.userId.firstName,
                    lastName: user.userId.lastName,
                    email: user.userId.email,
                  }))}
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

        {/* Tasks Card */}
        <DashboardCard
          icon={<FaTasks className="text-primary text-3xl" />}
          title="Tasks"
          description="Organize and track your team's assignments and progress."
        >
          <DashboardTaskPreview />
        </DashboardCard>

        {/* Calendar Card */}
        <DashboardCard
          icon={<FaCalendarAlt className="text-primary text-3xl" />}
          title="Calendar"
          description="View deadlines, scheduled meetings, and project milestones."
        >
          <DashboardCalendarPreview />
        </DashboardCard>

        {/* Settings Card */}
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
  );
};

DashboardPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardPage;