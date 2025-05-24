import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "../../pages/_app"; // Adjust path
import { NextPageWithLayout } from "@/types";
import Loading from "@/components/Loading";
import Link from "next/link";
import { MdSpaceDashboard, MdSettings } from "react-icons/md";
import { FaUserFriends, FaTasks, FaCalendarAlt } from "react-icons/fa";
import { useEffect, useState } from "react";

const DashboardOverviewPage: NextPageWithLayout = () => {
  const { user } = useAuth();
  const [usersPreview, setUsersPreview] = useState<string[]>([]);
  const [tasksPreview, setTasksPreview] = useState<string[]>([]);
  const [eventsPreview, setEventsPreview] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users?limit=3");
        if (res.ok) {
          const data = await res.json();
          setUsersPreview(data.map((u: { name: string }) => u.name));
        }
      } catch (error) {
        console.error("Failed to fetch users preview:", error);
      }
    };

    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks?limit=3");
        if (res.ok) {
          const data = await res.json();
          setTasksPreview(data.map((t: { title: string }) => t.title));
        }
      } catch (error) {
        console.error("Failed to fetch tasks preview:", error);
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events?limit=3");
        if (res.ok) {
          const data = await res.json();
          setEventsPreview(data.map((e: { title: string }) => e.title));
        }
      } catch (error) {
        console.error("Failed to fetch events preview:", error);
      }
    };

    fetchUsers();
    fetchTasks();
    fetchEvents();
  }, []);

  if (!user) {
    return <Loading />;
  }

  const cards = [
    {
      name: "Users",
      path: "/app/users",
      description: "Manage users and their roles.",
      icon: FaUserFriends,
      preview: usersPreview.length > 0 ? (
        <ul className="mt-2 text-sm text-gray-500">
          {usersPreview.map((userName, index) => (
            <li key={index} className="truncate">
              {userName}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-gray-500">Loading users...</p>
      ),
    },
    {
      name: "Tasks",
      path: "/app/tasks",
      description: "Track and manage your tasks.",
      icon: FaTasks,
      preview: tasksPreview.length > 0 ? (
        <ul className="mt-2 text-sm text-gray-500">
          {tasksPreview.map((taskTitle, index) => (
            <li key={index} className="truncate">
              {taskTitle}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-gray-500">Loading tasks...</p>
      ),
    },
    {
      name: "Calendar",
      path: "/app/calendar",
      description: "View and manage your schedule.",
      icon: FaCalendarAlt,
      preview: eventsPreview.length > 0 ? (
        <ul className="mt-2 text-sm text-gray-500">
          {eventsPreview.map((eventTitle, index) => (
            <li key={index} className="truncate">
              {eventTitle}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-gray-500">Loading events...</p>
      ),
    },
    {
      name: "Settings",
      path: "/app/settings",
      description: "Update your preferences and settings.",
      icon: MdSettings,
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-5xl font-extrabold text-gray-800 mb-6">Dashboard Overview</h1>
      <p className="text-lg text-gray-600 mb-10">
        Welcome back, <span className="font-semibold text-primary">{user.firstName || user.email}</span>! Explore the sections below to manage your workspace.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link key={card.name} href={card.path}>
            <div className="p-6 bg-gradient-to-br from-white to-gray-100 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-105 border border-gray-200 flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <div className="text-primary text-5xl bg-primary/10 p-4 rounded-full">
                  <card.icon />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{card.name}</h2>
                  <p className="text-gray-600 text-sm">{card.description}</p>
                </div>
              </div>
              {card.preview && <div>{card.preview}</div>}
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