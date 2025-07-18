import Link from "next/link";
import { FaTimes, FaSignOutAlt } from "react-icons/fa";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect } from "react";


type MenuItem = {
  name: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  notification?: number | string;
};

type MobileSidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  menu: MenuItem[];
  user: any;
  router: any;
  t: ReturnType<typeof useTranslations>;
  tasksCount?: number;
  unreadAnnouncements?: number;
  unreadMessages?: number;
  header?: React.ReactNode;
};

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  menu,
  user,
  router,
  t,
  tasksCount = 0,
  unreadAnnouncements = 0,
  unreadMessages = 0,
  header,
}) => {
  // Close sidebar on route change (using router.events for Next.js)
  useEffect(() => {
    if (!router || !router.events) return;
    const handleRouteChange = () => setSidebarOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, setSidebarOpen]);
  // Close sidebar on route change (using router.events)
  useEffect(() => {
    if (!router?.events) return;
    const handleRouteChange = () => setSidebarOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, setSidebarOpen]);
  const auth = useAuth();

  // Memoize sidebar close handler
  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, [setSidebarOpen]);

  // Memoize logout handler
  const handleLogout = useCallback(() => {
    setSidebarOpen(false);
    auth.logout();
  }, [setSidebarOpen, auth]);

  if (!sidebarOpen) return null;
  return (
    <div className="fixed inset-0 z-[400] flex md:hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40"
        onClick={handleSidebarClose}
        aria-label="Close sidebar overlay"
      ></div>
      {/* Drawer */}
      <aside className="relative w-full max-w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 text-white px-0 pt-0 flex flex-col shadow-lg animate-slideInLeft overflow-y-auto">
        {/* Close button with higher z-index than sidebar */}
        <button
          className="absolute top-4 right-4 text-white text-2xl focus:outline-none z-[500]"
          onClick={handleSidebarClose}
          aria-label="Close sidebar"
        >
          <FaTimes />
        </button>
        {/* Header removed for mobile sidebar */}
        <Link href="/app">
          <div className="w-full max-w-[180px] h-[72px] mx-auto mb-8 cursor-pointer hover:opacity-90 transition-opacity duration-300 relative">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              style={{ objectFit: 'contain' }}
              sizes="180px"
              priority
            />
          </div>
        </Link>
        {/* Search Bar Mobile */}
        {/* {searchInput}
        {searchDropdown} */}
        {/* Navigation */}
        <nav>
          <p className="text-gray-400 font-semibold text-sm uppercase tracking-wider">
            MAIN MENU
          </p>
          <ul className="mt-4 space-y-2">
            {menu.map((item) => (
              <li
                key={item.name}
                className={`py-4 px-4 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-md ${
                  router.pathname === item.path
                    ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-md"
                    : "hover:bg-gray-700 hover:text-white text-gray-300"
                }`}
              >
                <Link href={item.path} className="flex items-center">
                  {item.icon && (
                    <item.icon className="mr-3 text-xl text-primary-light" />
                  )}
                  <span className="font-medium">{t(item.name)}</span>
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
        {/* User Profile Section Mobile */}
        <Link
          href="/app/settings"
          className="flex items-center space-x-3 px-3 py-2 mt-4 mb-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors duration-300 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 font-bold text-lg overflow-hidden">
            {user.profileImage &&
            typeof user.profileImage === "object" &&
            user.profileImage.data ? (
              <img
                src={user.profileImage.data}
                alt="Profile"
                className="w-10 h-10 object-cover rounded-full"
              />
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
          onClick={handleLogout}
          className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-lg font-bold shadow-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          <FaSignOutAlt className="text-xl" />
          <span>Logout</span>
        </button>
      </aside>
    </div>
  );
};

export default React.memo(MobileSidebar);
