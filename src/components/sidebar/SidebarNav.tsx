import Link from "next/link";
import Image from "next/image";
import UniversalSearchBar from "@/components/sidebar/UniversalSearchBar";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types"; // Adjust the import path as necessary
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";

type MenuItem = {
  name: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  notification?: number | string;
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

const SidebarNav: React.FC<SidebarNavProps & { t: ReturnType<typeof useTranslations> }> = ({
  menu,
  user,
  router,
  tasksCount = 0,
  unreadAnnouncements = 0,
  unreadMessages = 0,
  t,
}) => {
  const auth = useAuth();
  const realRouter = useRouter();

  // Example: Replace with your real companies array
  const [selectedCompany, setSelectedCompany] = useState(
    user.companies
      ? { id: user.companyId, name: user.companyName }
      : { id: "", name: "No Company" }
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleCompanyChange = async (company: { id: string; name: string }) => {
    await fetch("/api/auth/change-company", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user._id,
        companyId: company.id,
      }),
    });

    realRouter.push("/app");
    realRouter.reload();
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // menuWithNotifications should use the translation keys, not translated values
  const menuWithNotifications = menu.map((item) => {
    if (item.name === "tasks" && tasksCount > 0) {
      return { ...item, notification: tasksCount };
    }
    if (item.name === "announcements" && unreadAnnouncements > 0) {
      return { ...item, notification: unreadAnnouncements };
    }
    if (item.name === "communication" && unreadMessages > 0) {
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
                {/* Use translation key directly and fallback to capitalized key */}
                <span className="font-medium">
                  {t(item.name, { default: item.name.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) })}
                </span>
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
      {/* Separator before user info */}
      <div className="mt-8 mb-4 border-t border-gray-700 opacity-50"></div>
      {/* User Profile Section */}

      {/* Dropdown pentru companii */}
      <div className="relative mt-4 mb-2" ref={dropdownRef}>
        <div
          className="flex items-center justify-between space-x-3 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
          onClick={() => setDropdownOpen((v) => !v)}
        >
          <div>
            <p className="font-semibold text-white">{selectedCompany.name}</p>
            <p className="text-xs text-gray-400">{user.role}</p>
          </div>
          <svg
            className={`ml-2 w-4 h-4 transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        {dropdownOpen && (
          <div className="absolute left-0 mt-2 w-full bg-white rounded-lg shadow-lg z-50 py-2">
            {user.companies
              ?.sort((a, b) => {
                return a.id == selectedCompany.id ? -1 : 1;
              })
              .map((company) => (
                <button
                  key={company.id}
                  className={`block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition ${
                    selectedCompany.id === company.id
                      ? "font-bold bg-gray-100"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedCompany(company);
                    setDropdownOpen(false);

                    handleCompanyChange(company);
                  }}
                >
                  {company.name}
                </button>
              ))}

            <button
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition font-bold"
              onClick={() => {}}
            >
              ADD COMPANY
            </button>
          </div>
        )}
      </div>

      <Link
        href="/app/settings"
        className="flex items-center space-x-3 px-3 py-2 mt-4 mb-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 font-bold text-lg overflow-hidden">
          {user.profileImage &&
          typeof user.profileImage === "object" &&
          user.profileImage.data ? (
            <div className="relative w-10 h-10 object-cover rounded-full">
              <Image src={user.profileImage.data} alt="Profile" fill={true} />
            </div>
          ) : user.firstName ? (
            user.firstName[0].toUpperCase()
          ) : (
            "U"
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
        onClick={auth.logout}
        className="mt-5 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center"
      >
        <span className="text-center">Logout</span>
      </button>
    </aside>
  );
};

export default SidebarNav;
