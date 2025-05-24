import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "../../pages/_app"; // Adjust path
import { NextPageWithLayout } from "@/types";
import Loading from "@/components/Loading";
import Link from "next/link";
import { MdSpaceDashboard, MdSettings } from "react-icons/md";
import { FaUserFriends, FaTasks, FaCalendarAlt } from "react-icons/fa";

const DashboardOverviewPage: NextPageWithLayout = () => {
  const { user } = useAuth();

  if (!user) {
    return <Loading />;
  }

  const cards = [
    { name: "Users", path: "/app/users", description: "Manage users and their roles.", icon: FaUserFriends },
    { name: "Tasks", path: "/app/profile", description: "Track and manage your tasks.", icon: FaTasks },
    { name: "Calendar", path: "/app/calendar", description: "View and manage your schedule.", icon: FaCalendarAlt },
    { name: "Settings", path: "/app/settings", description: "Update your preferences and settings.", icon: MdSettings },
  ];

  return (
    <div className="p-8">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Dashboard Overview</h1>
      <p className="text-lg text-gray-600 mb-12">
        Welcome back, <span className="font-semibold text-primary">{user.firstName || user.email}</span>! Explore the sections below to manage your workspace.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {cards.map((card) => (
          <Link key={card.name} href={card.path}>
            <div className="p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:scale-105 border border-gray-200 flex items-center space-x-4">
              <div className="text-primary text-4xl">
                <card.icon />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{card.name}</h2>
                <p className="text-gray-600 text-lg">{card.description}</p>
              </div>
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