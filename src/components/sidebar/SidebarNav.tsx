import Link from "next/link";
import Image from "next/image";
import UniversalSearchBar from "@/components/sidebar/UniversalSearchBar";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types"; // Adjust the import path as necessary
import { useState, useRef, useEffect, useCallback } from "react";
// ...existing code...
// Helper to merge memberCounts into companies
function mergeCompanyMembers(companies: any[], memberCounts: any[]): any[] {
  if (!Array.isArray(companies) || !Array.isArray(memberCounts)) return companies;
  return companies.map(company => {
    const found = memberCounts.find((c) => String(c._id) === String(company.id || company._id));
    return { ...company, members: found ? found.members : 1 };
  });
}
import { useRouter } from "next/router";
import { useTranslations } from "next-intl";
import AddCompanyModal from "@/components/modals/AddCompanyModal";
import { FiPlus } from "react-icons/fi";
import React from "react";

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

const SidebarNav: React.FC<
  SidebarNavProps & { t: ReturnType<typeof useTranslations> }
> = ({
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
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [companiesWithMembers, setCompaniesWithMembers] = useState<any[]>(user.companies || []);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch companies and memberCounts from API and merge
  useEffect(() => {
    async function fetchCompaniesAndMembers() {
      try {
        const res = await fetch('/api/get-users');
        if (!res.ok) return;
        const data = await res.json();
        // user.companies may be in data.user or data.users[0].companies, adjust as needed
        let companies = user.companies || [];
        if (data.user && data.user.companies) companies = data.user.companies;
        if (Array.isArray(data.users) && data.users[0]?.companies) companies = data.users[0].companies;
        setCompaniesWithMembers(mergeCompanyMembers(companies, data.memberCounts || []));
      } catch (e) {
        // fallback: just use user.companies
        setCompaniesWithMembers(user.companies || []);
      }
    }
    fetchCompaniesAndMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Company change handler
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
    setSelectedCompany(company);
    setDropdownOpen(false);
    realRouter.push("/app");
    realRouter.reload();
  };

  // Add company modal close handler
  const handleAddCompanyClose = () => {
    setAddCompanyOpen(false);
    realRouter.reload();
  };

  // Company dropdown rendering (no memoization)
  const { theme } = require("@/components/ThemeContext").useTheme();
  const companyDropdown = dropdownOpen && (
    <div className={`absolute left-full bottom-0 ml-2 w-full rounded-2xl shadow-2xl z-50 border ${theme === 'dark' ? 'bg-[#23272f] border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}>
      <div className="p-2">
        {companiesWithMembers.map((company) => {
          const members = company.members;
          const isSelected = selectedCompany.id === company.id;
          return (
            <button
              key={company.id}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition font-medium mb-1 last:mb-0 relative
                ${isSelected
                  ? theme === 'dark'
                    ? 'bg-blue-900 shadow border border-blue-700 text-white'
                    : 'bg-blue-50 shadow border border-blue-200 text-blue-900'
                  : theme === 'dark'
                    ? 'hover:bg-gray-800 text-white'
                    : 'hover:bg-gray-100 text-gray-900'}
                cursor-pointer
              `}
              onClick={() => {
                setSelectedCompany(company);
                setDropdownOpen(false);
                handleCompanyChange(company);
              }}
            >
              {/* Avatar/Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {company.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex flex-col flex-1 min-w-0 text-left">
                <span className={`font-semibold leading-tight truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{company.name}</span>
                <span className={`text-xs leading-tight truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{members} member{members !== 1 ? "s" : ""}</span>
              </div>
              {isSelected && (
                <svg className="w-5 h-5 text-blue-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      <div className={`w-full border-t flex rounded-b-2xl ${theme === 'dark' ? 'border-gray-800 bg-[#23272f]' : 'border-gray-200 bg-white'}`} style={{borderBottomLeftRadius: '1rem', borderBottomRightRadius: '1rem'}}>
        <button
          className={`w-full flex items-center gap-2 px-3 py-4 font-bold transition rounded-b-2xl cursor-pointer text-lg
            ${theme === 'dark' ? 'text-blue-300 hover:bg-blue-900' : 'text-blue-600 hover:bg-blue-50'}`}
          style={{borderTopLeftRadius: 0, borderTopRightRadius: 0, minHeight: '52px'}}
          onClick={() => {
            setDropdownOpen(false);
            setAddCompanyOpen(true);
          }}
        >
          <FiPlus className={`text-xl ${theme === 'dark' ? 'text-blue-300' : 'text-blue-500'}`} />
          {t("addCompany", { default: "Add Company" })}
        </button>
      </div>
    </div>
  );

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

  // No memoization: menuWithNotifications is recalculated on every render
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
                    {t(item.name, {
                      default: item.name
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase()),
                    })}
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

      {/* Company Selector styled as in the image, with dropdown and member counts */}
      <div className="relative mt-4 mb-2" ref={dropdownRef}>
        <div
          className="flex items-center px-4 py-3 rounded-2xl bg-[#23272f] shadow-lg border border-[#23272f] cursor-pointer transition hover:bg-[#23272f]/90 min-h-[64px]"
          onClick={() => setDropdownOpen((v) => !v)}
        >
          {/* Company avatar/icon */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
            {/* You can replace this with a company logo if available */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="16" fill="#23272f" />
              <path d="M10 22L16 10L22 22H10Z" fill="#60A5FA" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-semibold text-white leading-tight truncate">{selectedCompany.name}</span>
            <span className="text-xs text-gray-400 leading-tight truncate">{user.role}</span>
          </div>
          <div className="ml-2 flex items-center">
            <svg
              className={`w-5 h-5 transition-transform ${dropdownOpen ? "rotate-180" : ""} text-gray-400`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {companyDropdown}
        {/* AddCompanyModal */}
        <AddCompanyModal
          open={addCompanyOpen}
          onClose={handleAddCompanyClose}
          userId={user._id}
          onCompanyAdded={handleAddCompanyClose}
        />
      </div>
    </aside>
  );
}

export default SidebarNav;
