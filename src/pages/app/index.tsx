// pages/app/index.tsx
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { NextPageWithLayout } from '@/types';
import DashboardTaskPreview from '@/components/DashboardTaskPreview';

// Assuming you have icons for each card
import { MdSpaceDashboard, MdSettings } from 'react-icons/md';
import { FaUserClock, FaTasks, FaCalendarAlt } from 'react-icons/fa';

const DashboardPage: NextPageWithLayout = () => {
  const cardData = [
    {
      title: "Users",
      description: "Manage user accounts, roles, and permissions within your team.",
      icon: FaUserClock,
      path: "/app/users",
      content: null, // No special content for users card
    },
    {
      title: "Tasks",
      description: "Organize and track your team's assignments and progress.",
      icon: FaTasks,
      path: "/app/tasks", // Link to the full tasks page
      content: <DashboardTaskPreview />, // The task preview component goes here!
    },
    {
      title: "Calendar",
      description: "View deadlines, scheduled meetings, and project milestones.",
      icon: FaCalendarAlt,
      path: "/app/calendar",
      content: null, // No special content for calendar card
    },
    {
      title: "Settings",
      description: "Configure your application preferences, notifications, and integrations.",
      icon: MdSettings,
      path: "/app/settings",
      content: null, // No special content for settings card
    },
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-full rounded-lg shadow-inner">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center tracking-tight">
        Welcome to Your Dashboard!
      </h1>

      {/* Changed grid layout to show each card in its own row */}
      <div className="grid grid-cols-1 gap-8"> {/* <-- KEY CHANGE HERE */}
        {cardData.map((card) => (
          <div
            key={card.title}
            className="group relative bg-white p-8 rounded-2xl shadow-xl border border-gray-100
                       hover:shadow-2xl hover:border-primary-light transition-all duration-300 transform hover:-translate-y-2
                       flex flex-col overflow-hidden"
          >
            {/* Card Header with Icon */}
            <div className="flex items-center mb-4">
              <div className="p-3 bg-primary-light/10 rounded-full mr-4 flex-shrink-0">
                {card.icon && <card.icon className="text-primary text-3xl" />}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 leading-snug">{card.title}</h2>
            </div>

            {/* Card Description */}
            <p className="text-gray-700 text-base mb-4 flex-grow">{card.description}</p>

            {/* Dynamic Content (e.g., Task Preview) */}
            {card.content && <div className="mt-auto">{card.content}</div>}

            {/* Optional: Overlay on hover for better visual feedback */}
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