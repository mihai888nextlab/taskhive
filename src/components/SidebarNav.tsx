import DashboardSearch from "@/components/DashboardSearch";
import Link from "next/link";

type MenuItem = {
  name: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  notification?: number | string;
};

type User = {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: { data?: string } | string | null;
};

type SidebarNavProps = {
  menu: MenuItem[];
  user: User;
  router: { pathname: string };
  handleLogout: () => void;
  users: any[];
  tasks: any[];
  announcements: any[];
  calendarEvents: any[];
  storageFiles: any[];
  timeTracking: any[];
  financeRecords: any[];
  expenses: any[];
  incomes: any[];
  timeSessions: any[];
  onUserCardClick: (user: any) => void;
  // Add notification props here:
  tasksCount?: number;
  unreadAnnouncements?: number;
  unreadMessages?: number;
};

const SidebarNav: React.FC<SidebarNavProps> = ({
  menu,
  user,
  router,
  handleLogout,
  users,
  tasks,
  announcements,
  calendarEvents,
  storageFiles,
  timeTracking,
  financeRecords,
  expenses,
  incomes,
  timeSessions,
  onUserCardClick,
  tasksCount = 0,
  unreadAnnouncements = 0,
  unreadMessages = 0,
}) => {
const menuWithNotifications = menu.map((item) => {
    if (item.name === "Tasks" && tasksCount > 0) {
        return { ...item, notification: tasksCount };
    }
    if (item.name === "Announcements" && unreadAnnouncements > 0) {
        return { ...item, notification: unreadAnnouncements };
    }
    if (item.name === "Communication" && unreadMessages > 0) {
        return { ...item, notification: unreadMessages };
    }
    return { ...item, notification: item.notification };
});

  return (
    <aside className="hidden md:flex w-[300px] bg-gradient-to-b from-gray-800 to-gray-900 text-white px-5 py-6 flex-col shadow-lg">
      <Link href="/app">
        <img
          src="http://localhost:3000/logo.png"
          className="w-[150px] mx-auto mb-8 cursor-pointer hover:opacity-90 transition-opacity duration-300"
          alt="Logo"
        />
      </Link>
      {/* Search Bar */}
      <DashboardSearch
        menu={menu}
        users={users}
        tasks={tasks}
        announcements={announcements}
        calendarEvents={calendarEvents}
        storageFiles={storageFiles}
        timeTracking={timeTracking}
        financeRecords={financeRecords}
        expenses={expenses}
        incomes={incomes}
        timeSessions={timeSessions}
        onUserCardClick={onUserCardClick}
      />
      {/* Navigation */}
      <nav>
        <p className="text-gray-400 font-semibold text-sm uppercase tracking-wider">
          MAIN MENU
        </p>
        <ul className="mt-4 space-y-2">
          {menuWithNotifications.map((item) => (
            <li
              key={item.name}
              className={`p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md ${
                router.pathname === item.path
                  ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-md"
                  : "hover:bg-gray-700 hover:text-white text-gray-300"
              }`}
            >
              <Link href={item.path} className="flex items-center">
                {item.icon && (
                  <item.icon className="mr-3 text-xl text-primary-light" />
                )}
                <span className="font-medium">{item.name}</span>
                {item.notification && (
                  <span className="ml-auto bg-red-500 text-white rounded-full px-2 text-xs">
                    {item.notification}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {/* Separator before user info */}
      <div className="mt-8 mb-4 border-t border-gray-700 opacity-50"></div>
      {/* User Profile Section */}
      <Link
        href="/app/settings"
        className="flex items-center space-x-3 px-3 py-2 mt-4 mb-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 font-bold text-lg overflow-hidden">
          {user.profileImage && typeof user.profileImage === "object" && user.profileImage.data ? (
            <img
              src={user.profileImage.data}
              alt="Profile"
              className="w-10 h-10 object-cover rounded-full"
            />
          ) : (
            user.firstName ? user.firstName[0].toUpperCase() : "U"
          )}
        </div>
        <div>
          <p className="font-semibold text-white">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
      </Link>
      <button
        onClick={handleLogout}
        className="mt-5 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center"
      >
        <span className="text-center">Logout</span>
      </button>
    </aside>
  );
};

export default SidebarNav;