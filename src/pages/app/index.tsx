// pages/app/index.tsx
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { NextPageWithLayout } from '@/types';
import DashboardTaskPreview from '@/components/DashboardTaskPreview';
import FinancePreview from '@/components/FinancePreview';
import Table from '@/components/Table';
import Link from 'next/link';
import { FaUserClock, FaTasks, FaCalendarAlt, FaArrowRight, FaMoneyBillWave } from 'react-icons/fa'; // Added FaMoneyBillWave
import { MdSettings } from 'react-icons/md';
import Statistics from '@/components/Statistics';
import { Expense, Income } from '@/db/models/expensesModel'; // Adjust the path accordingly

interface Stats {
  totalUsers: number;
  newUsers: number;
  totalTasks: number;
  completedTasks: number;
  newUsersData: number[];
  completedTasksData: number[];
}

const DashboardPage: NextPageWithLayout = () => {
  const [users, setUsers] = useState<
    {
      _id: string;
      userId: {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
      };
      companyId: string;
      role: "string";
      permissions: string[];
    }[]
  >([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // States for finance
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncomes, setTotalIncomes] = useState(0);
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/get-users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        console.log("Fetched users:", data.users);
        setUsers(data.users);
        setLoadingUsers(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoadingUsers(false);
      }
    };

    const fetchFinanceData = async () => {
      try {
        const response = await fetch("/api/expenses");
        if (!response.ok) {
          throw new Error("Failed to fetch finance data");
        }
        const data = await response.json();
        const expenses = data.filter((item: any) => item.type === 'expense');
        const incomes = data.filter((item: any) => item.type === 'income');

        const totalExpenses = expenses.reduce((total: number, expense: Expense) => total + expense.amount, 0);
        const totalIncomes = incomes.reduce((total: number, income: Income) => total + income.amount, 0);
        const profit = totalIncomes - totalExpenses;

        setTotalExpenses(totalExpenses);
        setTotalIncomes(totalIncomes);
        setProfit(profit);
      } catch (error) {
        console.error("Error fetching finance data:", error);
      }
    };

    fetchUsers();
    fetchFinanceData();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/get-stats");
        if (!response.ok) {
          throw new Error("Failed to fetch statistics");
        }
        const data = await response.json();
        console.log("Fetched stats:", data);
        setStats(data);
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Define the FinancePreview content to be included in cardData
  // It uses the same styling as the User card's inner table
  const financeCardContent = (
    <div className="space-y-4"> {/* Keep internal spacing */}
      {/* Total Income Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold text-gray-800 mb-1">Total Income</h4>
        <p className="text-green-600 text-2xl font-bold">${totalIncomes.toFixed(2)}</p>
      </div>

      {/* Total Expenses Card */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h4 className="text-lg font-bold text-gray-800 mb-1">Total Expenses</h4>
        <p className="text-red-600 text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
      </div>

      {/* Profit Card - styled dynamically */}
      <div className={`
          p-4 rounded-lg border shadow-sm
          ${profit >= 0
            ? 'bg-blue-50 border-blue-100'
            : 'bg-red-50 border-red-100'
          }
        `}>
        <h4 className="text-lg font-bold text-gray-800 mb-1">Net Profit / Loss</h4>
        <p className={`text-2xl font-bold
          ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}
        `}>
          ${profit.toFixed(2)}
        </p>
      </div>

      {/* View All Financials Button - styled as per the preview image */}
      <div className="text-center mt-8">
                <Link
                  href="/app/finance"
                  // Original button style as per the request not to change other components
                  className="inline-flex items-center justify-center text-primary-dark hover:text-white font-bold text-lg transition-all duration-300 px-6 py-3 rounded-full bg-primary-light/20 hover:bg-gradient-to-r hover:from-primary hover:to-secondary shadow-md hover:shadow-xl transform hover:-translate-y-1 group"
                >
                  <span className="mr-3">View All Financials</span>
                  <FaArrowRight className="text-xl transform transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
    </div>
  );

  // Add the Finance card to your cardData array
  const cardData = [
    {
      title: "Finance", // New card title
      description: "Keep track of your income, expenses, and overall financial health.", // New description
      icon: FaMoneyBillWave, // Icon for Finance
      path: "/app/finance", // Path to the full finance page
      content: financeCardContent, // Use the pre-defined content
    },
    {
      title: "Users",
      description: "Manage user accounts, roles, and permissions within your team.",
      icon: FaUserClock,
      path: "/app/users",
      content: (
        <div className="flex flex-col h-full"> {/* Flex container to allow button positioning */}
          {loadingUsers ? (
            <p className="text-gray-600">Loading users...</p>
          ) : users.length > 0 ? (
            <>
              <div className="flex-grow"> {/* Allow this div to grow and push the button down */}
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
              </div>
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
            <p className="text-gray-600 text-center p-5 bg-blue-50/20 rounded-md border border-blue-200 shadow-inner">
              No users registered yet.
            </p>
          )}
        </div>
      ),
    },
    {
      title: "Tasks",
      description: "Organize and track your team's assignments and progress.",
      icon: FaTasks,
      path: "/app/tasks",
      content: <DashboardTaskPreview />,
    },
    {
      title: "Calendar",
      description: "View deadlines, scheduled meetings, and project milestones.",
      icon: FaCalendarAlt,
      path: "/app/calendar",
      content: null,
    },
    {
      title: "Settings",
      description: "Configure your application preferences, notifications, and integrations.",
      icon: MdSettings,
      path: "/app/settings",
      content: null,
    },
  ];

  return (
    <div className="p-8 bg-gray-100 min-h-full rounded-lg">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center tracking-tight">
        Welcome to Your Dashboard!
      </h1>

      {loadingStats ? (
        <p className="text-center text-gray-600 mb-8">Loading statistics...</p>
      ) : (
        stats && (
          <div className="mb-10">
            <Statistics {...(stats as Stats)} />
          </div>
        )
      )}

      {/* The grid now contains all card data, including Finance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
        {cardData.map((card) => (
          <div
            key={card.title}
            className="group relative bg-white p-8 rounded-2xl shadow-xl border border-gray-100
                       hover:shadow-2xl hover:border-primary-light transition-all duration-300 transform hover:-translate-y-2
                       flex flex-col overflow-hidden"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-light/10 rounded-full mr-4 flex-shrink-0">
                {card.icon && <card.icon className="text-primary text-3xl" />}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 leading-snug">{card.title}</h2>
            </div>

            <p className="text-gray-700 text-base mb-4 flex-grow">{card.description}</p>

            {/* Render the content, which will be the FinancePreview component for the Finance card */}
            {card.content && <div className="mt-auto">{card.content}</div>}

            <div className="absolute inset-0 bg-primary-light/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

DashboardPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardPage;