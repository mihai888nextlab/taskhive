// pages/app/index.tsx
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { NextPageWithLayout } from '@/types';
import DashboardTaskPreview from '@/components/DashboardTaskPreview';
import FinancePreview from '@/components/DashboardFinancePreview'; // Ensure this matches your file name
import Table from '@/components/Table';
import Link from 'next/link';
import { FaUserClock, FaTasks, FaCalendarAlt, FaArrowRight, FaMoneyBillWave } from 'react-icons/fa'; // Added FaMoneyBillWave
import { MdSettings } from 'react-icons/md';
import Statistics from '@/components/Statistics';
import { Expense, Income } from '@/db/models/expensesModel'; // Adjust the path accordingly
import { useTheme } from '@/components/ThemeContext'; // Import the useTheme hook
import CalendarPreview from '@/components/DashboardCalendarPreview';

interface Stats {
  totalUsers: number;
  newUsers: number;
  totalTasks: number;
  completedTasks: number;
  newUsersData: number[];
  completedTasksData: number[];
}

const DashboardPage: NextPageWithLayout = () => {
  const { theme } = useTheme(); // Get the current theme
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

  const cardBackground = theme === 'light' ? 'bg-white' : 'bg-gray-800';
  const cardTextColor = theme === 'light' ? 'text-gray-900' : 'text-white';
  const borderColor = theme === 'light' ? 'border-gray-100' : 'border-gray-700';

  // Define the FinancePreview content to be included in cardData
  // It uses the same styling as the User card's inner table
  const financeCardContent = (
    <div className={`p-6 rounded-lg shadow-sm ${cardBackground} ${borderColor}`}>
      <h4 className={`text-xl font-bold ${cardTextColor}`}>Total Income</h4>
      <p className={`text-3xl font-bold ${cardTextColor}`}>${totalIncomes.toFixed(2)}</p>
      <h4 className={`text-xl font-bold ${cardTextColor}`}>Total Expenses</h4>
      <p className={`text-3xl font-bold ${cardTextColor}`}>${totalExpenses.toFixed(2)}</p>
      <h4 className={`text-xl font-bold ${cardTextColor}`}>Net Profit / Loss</h4>
      <p className={`text-3xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${profit.toFixed(2)}</p>
    </div>
  );

  // Add the Finance card to your cardData array using the FinancePreview component with its props
  const cardData = [
    {
      title: "Finance",
      description: "Keep track of your income, expenses, and overall financial health.",
      icon: FaMoneyBillWave,
      content: (
        <FinancePreview 
          totalExpenses={totalExpenses} 
          totalIncomes={totalIncomes} 
          profit={profit} />
      ),
    },
    {
      title: "Users",
      description: "Manage user accounts, roles, and permissions within your team.",
      icon: FaUserClock,
      content: (
        <div className={`flex flex-col h-full ${cardBackground} ${borderColor}`}>
          {loadingUsers ? (
            <p className={`text-gray-600 ${cardTextColor}`}>Loading users...</p>
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
                  href="/app/tasks"
                  className="inline-flex items-center justify-center text-primary-dark hover:text-white font-bold text-lg transition-all duration-300 px-6 py-3 rounded-full bg-primary-light/20 hover:bg-gradient-to-r hover:from-primary hover:to-secondary shadow-md hover:shadow-xl transform hover:-translate-y-1 group"
                >
                  <span className="mr-3">View All Users</span>
                  <FaArrowRight className="text-xl transform transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </>
          ) : (
            <p className={`text-gray-600 text-center p-5 ${cardBackground} rounded-md border border-gray-200 shadow-inner`}>
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
      content: <DashboardTaskPreview />,
    },
    {
      title: "Calendar",
      description: "View deadlines, scheduled meetings, and project milestones.",
      icon: FaCalendarAlt,
      content: <CalendarPreview />,
    },
    {
      title: "Settings",
      description: "Configure your application preferences, notifications, and integrations.",
      icon: MdSettings,
      content: null,
    },
  ];

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
            <Statistics {...(stats as Stats)} />
          </div>
        )
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
        {cardData.map((card) => (
          <div
            key={card.title}
            className={`group relative ${cardBackground} p-8 rounded-2xl shadow-xl ${borderColor} transition-all duration-300 transform hover:-translate-y-2 flex flex-col overflow-hidden`}
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-light/10 rounded-full mr-4 flex-shrink-0">
                {card.icon && <card.icon className={`text-primary text-3xl ${cardTextColor}`} />}
              </div>
              <h2 className={`text-2xl font-bold leading-snug ${cardTextColor}`}>{card.title}</h2>
            </div>

            <p className={`text-base mb-4 flex-grow ${cardTextColor}`}>{card.description}</p>

            {card.content &&
              // For the Calendar card, render the content without extra margin so that it fits perfectly
              (card.title === "Calendar" ? card.content : <div className="mt-auto">{card.content}</div>)
            }
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