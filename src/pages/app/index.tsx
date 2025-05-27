// pages/app/index.tsx
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { NextPageWithLayout } from '@/types';
import DashboardTaskPreview from '@/components/DashboardTaskPreview';
import Table from '@/components/Table';
import Link from 'next/link';
import { FaUserClock, FaTasks, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import { MdSettings } from 'react-icons/md';

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

    fetchUsers();
  }, []);

  const cardData = [
    {
      title: "Users",
      description: "Manage user accounts, roles, and permissions within your team.",
      icon: FaUserClock,
      path: "/app/users",
      content: (
        <div>
          {loadingUsers ? (
            <p>Loading users...</p>
          ) : users.length > 0 ? (
            <>
              <Table
                data={users.slice(0, 3).map((user) => ({
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
            <p>No users registered.</p>
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
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-full rounded-lg shadow-inner">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center tracking-tight">
        Welcome to Your Dashboard!
      </h1>

      <div className="grid grid-cols-1 gap-8">
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