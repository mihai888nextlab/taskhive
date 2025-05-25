// pages/app/index.tsx
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { NextPageWithLayout } from '@/types';
import DashboardTaskPreview from '@/components/DashboardTaskPreview'; // Import the new component

const DashboardPage: NextPageWithLayout = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Card for Dashboard */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Dashboard</h2>
          <p className="text-gray-600 text-sm">Quick stats and summaries of your workspace activities.</p>
        </div>

        {/* Card for Users */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Users</h2>
          <p className="text-gray-600 text-sm">Manage user accounts, roles, and permissions within your team.</p>
        </div>

        {/* Card for Tasks - NOW WITH PREVIEW */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Tasks</h2>
          <p className="text-gray-600 text-sm">Organize and track your team's assignments and progress.</p>
          {/* Integrate the Task Preview component here */}
          <DashboardTaskPreview />
        </div>

        {/* Card for Calendar */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Calendar</h2>
          <p className="text-gray-600 text-sm">View deadlines, scheduled meetings, and project milestones.</p>
        </div>

        {/* Card for Settings (keeping 5th card for example, adjust grid layout if only 4) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Settings</h2>
          <p className="text-gray-600 text-sm">Configure your application preferences, notifications, and integrations.</p>
        </div>
      </div>
    </div>
  );
};

DashboardPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardPage;