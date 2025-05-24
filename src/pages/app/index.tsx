// src/pages/app/dashboard.tsx (or wherever you intend this file to be)

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/pages/_app"; // Adjust path if your _app.tsx is in a different location
import { NextPageWithLayout } from "@/types";
import Loading from "@/components/Loading";
import Link from "next/link";
import { MdSpaceDashboard, MdSettings } from "react-icons/md";
import { FaUserFriends, FaTasks, FaCalendarAlt } from "react-icons/fa";
import { useEffect, useState } from "react";

const DashboardOverviewPage: NextPageWithLayout = () => {
  const { user } = useAuth(); // Assuming useAuth provides a user object or null/undefined
  const [usersPreview, setUsersPreview] = useState<string[]>([]);
  const [tasksPreview, setTasksPreview] = useState<string[]>([]);
  const [eventsPreview, setEventsPreview] = useState<string[]>([]);

  useEffect(() => {
    // Function to fetch users preview
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users?limit=3");
        if (res.ok) {
          const data = await res.json();
          setUsersPreview(data.map((u: { name: string }) => u.name));
        } else {
          console.error("Failed to fetch users:", res.status, res.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch users preview:", error);
      }
    };

    // Function to fetch tasks preview
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks?limit=3");
        if (res.ok) {
          const data = await res.json();
          setTasksPreview(data.map((t: { title: string }) => t.title));
        } else {
          console.error("Failed to fetch tasks:", res.status, res.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch tasks preview:", error);
      }
    };

    // Function to fetch events preview
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events?limit=3");
        if (res.ok) {
          const data = await res.json();
          setEventsPreview(data.map((e: { title: string }) => e.title));
        } else {
          console.error("Failed to fetch events:", res.status, res.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch events preview:", error);
      }
    };

    // Call the fetch functions
    fetchUsers();
    fetchTasks();
    fetchEvents();
  }, []); // Empty dependency array means this effect runs once on mount

  // Show a loading spinner if user data isn't available yet
  if (!user) {
    return <Loading />;
  }

  // Define card data for the dashboard
  const cards = [
    {
      name: "Users",
      path: "/app/users",
      description: "Manage users and their roles.",
      icon: FaUserFriends, // React Icon component
      preview: usersPreview.length > 0 ? (
        <ul className="mt-2 text-sm text-gray-500 space-y-1">
          {usersPreview.map((userName, index) => (
            <li key={index} className="truncate">
              {userName}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-gray-500 italic">Loading users...</p>
      ),
    },
    {
      name: "Tasks",
      path: "/app/tasks",
      description: "Track and manage your tasks.",
      icon: FaTasks, // React Icon component
      preview: tasksPreview.length > 0 ? (
        <ul className="mt-2 text-sm text-gray-500 space-y-1">
          {tasksPreview.map((taskTitle, index) => (
            <li key={index} className="truncate">
              {taskTitle}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-gray-500 italic">Loading tasks...</p>
      ),
    },
    {
      name: "Calendar",
      path: "/app/calendar",
      description: "View and manage your schedule.",
      icon: FaCalendarAlt, // React Icon component
      preview: eventsPreview.length > 0 ? (
        <ul className="mt-2 text-sm text-gray-500 space-y-1">
          {eventsPreview.map((eventTitle, index) => (
            <li key={index} className="truncate">
              {eventTitle}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-gray-500 italic">Loading events...</p>
      ),
    },
    {
      name: "Settings",
      path: "/app/settings",
      description: "Update your preferences and settings.",
      icon: MdSettings, // React Icon component
      preview: ( // Generic preview for settings
        <p className="mt-2 text-sm text-gray-500">
          Personalize your experience.
        </p>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
        Dashboard Overview
      </h1>
      <p className="text-xl text-gray-700 mb-10">
        Welcome back,{" "}
        <span className="font-semibold text-blue-600">
          {user.firstName || user.email}
        </span>
        ! Explore the sections below to manage your workspace.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {cards.map((card) => (
          <Link key={card.name} href={card.path} className="group">
            <div className="p-6 bg-white rounded-xl shadow-md transition-all duration-300 ease-in-out transform group-hover:scale-102 group-hover:shadow-xl border border-gray-100 flex flex-col space-y-4">
              <div className="flex items-start space-x-4">
                <div className="text-blue-500 text-5xl bg-blue-50 p-4 rounded-full transition-colors duration-300 group-hover:bg-blue-100">
                  <card.icon />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {card.name}
                  </h2>
                  <p className="text-gray-500 text-base mt-1">
                    {card.description}
                  </p>
                </div>
              </div>
              {card.preview && (
                <div className="pt-4 border-t border-gray-100">
                  {card.preview}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Assign the layout to the page
DashboardOverviewPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardOverviewPage;