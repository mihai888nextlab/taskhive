import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import UniversalSearchBar from "@/components/sidebar/UniversalSearchBar";
import { useAuth } from "@/hooks/useAuth";
import { FiBell, FiSettings, FiUser, FiLock, FiLogOut, FiBell as FiBellIcon, FiSun } from "react-icons/fi";
import { useRouter } from "next/router";
import { useAIWindow } from "@/contexts/AIWindowContext"; // <-- Add this import

const SIDEBAR_WIDTH = 300; // px, must match your sidebar width
const AI_WINDOW_WIDTH = 420; // px, must match your AIWindow desktop width

const profileTabs = [
  { id: "profile", label: "Profile", icon: <FiUser className="mr-2" /> },
  { id: "security", label: "Security", icon: <FiLock className="mr-2" /> },
  { id: "notifications", label: "Notifications", icon: <FiBellIcon className="mr-2" /> },
  { id: "appearance", label: "Appearance", icon: <FiSun className="mr-2" /> },
];

type User = {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: { data?: string } | string | null;
};

const HeaderNavBar: React.FC = () => {
  const { user, logout } = useAuth() as { user: User, logout: () => void };
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAIWindowOpen } = useAIWindow(); // <-- Get AI window state

  // Close dropdown on route change
  React.useEffect(() => {
    setDropdownOpen(false);
  }, [router.pathname]);

  // Close dropdown on click outside
  React.useEffect(() => {
    if (!dropdownOpen) return;
    const handle = (e: MouseEvent) => {
      const dropdown = document.getElementById("profile-dropdown-menu");
      if (dropdown && !dropdown.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [dropdownOpen]);

  const handleTabClick = (tabId: string) => {
    setDropdownOpen(false);
    router.push(`/app/settings#${tabId}`);
  };

  // Calculate right margin if AI window is open
  const headerRight = isAIWindowOpen ? AI_WINDOW_WIDTH : 0;

  return (
    <header
      className="absolute top-0 z-[100] h-14 bg-gray-100 flex items-center px-4"
      style={{
        left: SIDEBAR_WIDTH,
        width: `calc(100vw - ${SIDEBAR_WIDTH}px - ${headerRight}px)`,
        top: 8, // 8px margin from the top
        right: headerRight,
        transition: "width 0.3s, right 0.3s",
      }}
    >
      {/* Center: Search Bar */}
      <div className="flex-1 flex justify-end">
        <div className="w-full max-w-xs">
          <UniversalSearchBar />
        </div>
      </div>
      {/* Right: Icons and Profile */}
      <div className="flex items-center gap-1 ml-1">
        <button className="p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-white transition-colors" title="Notifications">
          <FiBell className="w-5 h-5" />
        </button>
        <button
          className="ml-1 flex items-center focus:outline-none relative"
          onClick={() => setDropdownOpen((v) => !v)}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          aria-label="Open profile menu"
          tabIndex={0}
        >
          <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-[#23272f]">
            {user?.profileImage && typeof user.profileImage === "object" && user.profileImage.data ? (
              <Image src={user.profileImage.data} alt="Profile" width={36} height={36} />
            ) : user?.firstName ? (
              <span className="text-white font-bold text-lg">
                {user.firstName[0].toUpperCase()}
              </span>
            ) : (
              <span className="text-white font-bold text-lg">U</span>
            )}
          </div>
        </button>
        {/* Dropdown */}
        {dropdownOpen && (
          <div
            id="profile-dropdown-menu"
            className="absolute right-4 top-14 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 py-2"
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="font-semibold text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
            </div>
            <button
              className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              onClick={() => { setDropdownOpen(false); logout(); }}
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
            <div className="border-t border-gray-100 dark:border-gray-700 my-2" />
            {profileTabs.map(tab => (
              <button
                key={tab.id}
                className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                onClick={() => handleTabClick(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderNavBar;
