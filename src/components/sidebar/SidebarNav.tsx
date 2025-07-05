import Link from "next/link";
import Image from "next/image";
import UniversalSearchBar from "@/components/sidebar/UniversalSearchBar";
import { useAuth } from "@/hooks/useAuth";

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
  // Add notification props here:
  tasksCount?: number;
  unreadAnnouncements?: number;
  unreadMessages?: number;
};

const SidebarNav: React.FC<SidebarNavProps> = ({
  menu,
  user,
  router,
  tasksCount = 0,
  unreadAnnouncements = 0,
  unreadMessages = 0,
}) => {
  const auth = useAuth(); // Assuming you have a useAuth hook to get user data

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
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-[300px] bg-[#18181b] text-white px-5 flex-col shadow-lg border-r border-[#23272f] z-[90]">
      {/* Logo/Brand */}
      <Link href="/app">
        <div className="relative w-48 h-20 mx-auto mt-2 mb-2">
          <Image
            src="/logo.png"
            alt="Logo"
            fill
            className="object-contain"
            priority
            sizes="240px"
          />
        </div>
      </Link>
      {/* Search Bar */}
      {/* <DashboardSearch
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
      /> */}
      {/* Navigation */}
      <nav>
        <ul className="mt-4 space-y-2">
          {menuWithNotifications.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="block"
              tabIndex={0}
            >
              <li
                className={`flex items-center w-full h-full p-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md ${
                  router.pathname === item.path
                    ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-md"
                    : "hover:bg-gray-700 hover:text-white text-gray-300"
                }`}
              >
                {item.icon && (
                  <item.icon className="mr-3 text-xl text-primary-light" />
                )}
                <span className="font-medium">{item.name}</span>
                {item.notification && (
                  <span className="ml-auto bg-red-500 text-white rounded-full px-2 text-xs">
                    {item.notification}
                  </span>
                )}
              </li>
            </Link>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarNav;
