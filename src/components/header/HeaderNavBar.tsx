import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import UniversalSearchBar from "@/components/sidebar/UniversalSearchBar";
import { useAuth } from "@/hooks/useAuth";
import {
  FiBell,
  FiSettings,
  FiUser,
  FiLock,
  FiLogOut,
  FiBell as FiBellIcon,
  FiSun,
} from "react-icons/fi";
import { useRouter } from "next/router";
import { useAIWindow } from "@/contexts/AIWindowContext";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeContext";

const SIDEBAR_WIDTH = 300;
const AI_WINDOW_WIDTH = 420;

const profileTabs = [
  { id: "profile", label: "profile", icon: <FiUser className="mr-2" /> },
  { id: "security", label: "security", icon: <FiLock className="mr-2" /> },
  {
    id: "notifications",
    label: "notifications",
    icon: <FiBellIcon className="mr-2" />,
  },
  { id: "appearance", label: "appearance", icon: <FiSun className="mr-2" /> },
];

const LANGUAGES = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "ja", label: "JA", flag: "🇯🇵" },
  { code: "ko", label: "KO", flag: "🇰🇷" },
  { code: "vi", label: "VI", flag: "🇻🇳" },
  { code: "ru", label: "RU", flag: "🇷🇺" },
  { code: "no", label: "NO", flag: "🇳🇴" },
  { code: "sv", label: "SV", flag: "🇸🇪" },
  { code: "fi", label: "FI", flag: "🇫🇮" },
  { code: "nl", label: "NL", flag: "🇳🇱" },
  { code: "hu", label: "HU", flag: "🇭🇺" },
  { code: "tr", label: "TR", flag: "🇹🇷" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "es", label: "ES", flag: "🇪🇸" },
  { code: "pt", label: "PT", flag: "🇵🇹" },
  { code: "ro", label: "RO", flag: "🇷🇴" },
  { code: "sr", label: "SR", flag: "🇷🇸" },
  { code: "zh", label: "ZH", flag: "🇨🇳" },
  { code: "hi", label: "HI", flag: "🇮🇳" },
  { code: "ar", label: "AR", flag: "🇸🇦" },
  { code: "gr", label: "GR", flag: "🇬🇷" },
  { code: "de", label: "DE", flag: "🇩🇪" },
  { code: "da", label: "DA", flag: "🇩🇰" },
  { code: "it", label: "IT", flag: "🇮🇹" },
  // Add more as needed
];

type User = {
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: { data?: string } | string | null;
};

const HeaderNavBar: React.FC<{ t?: ReturnType<typeof useTranslations> }> = ({
  t: tProp,
}) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { isAIWindowOpen } = useAIWindow();
  const { lang, setLang } = useLanguage();
  // Use HeaderNavBar namespace for translations, fallback to tProp if provided
  const t = tProp || useTranslations("HeaderNavBar");
  const { theme } = useTheme();

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [router.pathname]);

  // Close dropdown on click outside
  useEffect(() => {
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

  // Memoize tab click handler
  const handleTabClick = useCallback(
    (tabId: string) => {
      setDropdownOpen(false);
      if (router.pathname === '/app/settings') {
        window.location.hash = tabId;
      } else {
        router.push(`/app/settings#${tabId}`);
      }
    },
    [router]
  );

  // Memoize language change handler
  const handleLangChange = useCallback(
    (newLang: string) => {
      setLangDropdownOpen(false);
      setLang(newLang);
    },
    [setLang]
  );

  const languageDropdown = langDropdownOpen && (
    <div
      className={`absolute right-0 mt-2 w-22 rounded-xl shadow-lg z-50 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      style={{
        maxHeight: "260px",
        overflowY: "auto",
      }}
    >
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors duration-150 ${
            theme === 'dark'
              ? `text-gray-200 hover:bg-gray-700 ${language.code === lang ? 'font-bold bg-gray-700' : ''}`
              : `text-gray-700 hover:bg-gray-100 ${language.code === lang ? 'font-bold bg-gray-100' : ''}`
          }`}
          onClick={() => handleLangChange(language.code)}
        >
          <span>{language.label}</span>
          <span>{language.flag}</span>
        </button>
      ))}
    </div>
  );

  const profileDropdown = dropdownOpen && (
    <div
      id="profile-dropdown-menu"
      className={`absolute right-4 top-14 mt-2 w-56 rounded-xl shadow-lg z-50 pt-2 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}> 
        <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}> 
          {user?.firstName} {user?.lastName}
        </div>
        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}> 
          {user?.email}
        </div>
      </div>
      <button
        className={`w-full text-left px-4 py-2 flex items-center transition-colors duration-150 ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
        onClick={() => {
          setDropdownOpen(false);
          logout();
        }}
      >
        <FiLogOut className="mr-2" /> {t("logout")}
      </button>
      <div className={`${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} border-t`} />
      {profileTabs.map((tab, idx) => (
        <button
          key={tab.id}
          className={`w-full text-left px-4 py-2 flex items-center transition-colors duration-150 ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}${idx === 0 ? ' mt-0' : ''}`}
          style={{
            marginTop: idx === 0 ? '0' : '2px',
            marginBottom: idx === profileTabs.length - 1 ? '0' : '0',
            paddingBottom: idx === profileTabs.length - 1 ? '0.5rem' : undefined // ensure last button is flush with bottom
          }}
          onClick={() => handleTabClick(tab.id)}
        >
          {tab.icon}
          {t(tab.label)}
        </button>
      ))}
    </div>
  );

  // Responsive: show search icon on mobile, full search bar on desktop
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <header
      className={`absolute top-0 z-30 h-14 flex transition-colors duration-200 border-t-0 !mt-0 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}${isMobile ? ' mobile-header-center' : ''}`}
      style={
        isMobile
          ? {
              left: 0,
              right: 0,
              width: "100vw",
              top: 0,
              marginTop: 0,
              transition: "width 0.3s, right 0.3s",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }
          : {
              left: SIDEBAR_WIDTH,
              width: `calc(100vw - ${SIDEBAR_WIDTH}px - ${isAIWindowOpen ? AI_WINDOW_WIDTH : 0}px)`,
              top: 0,
              right: isAIWindowOpen ? AI_WINDOW_WIDTH : 0,
              marginTop: "12px",
              transition: "width 0.3s, right 0.3s",
            }
      }
    >
      <div
        className={`flex ${isMobile ? 'justify-end items-center w-full' : 'flex-1 justify-end items-center'}`}
        style={isMobile ? { maxWidth: '420px', marginRight: '12px' } : { marginRight: '32px' }}
      >
        {isMobile ? (
          <>
            <button
              className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-400 hover:text-white'}`}
              title={t("search", { default: "Search" })}
              onClick={() => {
                window.dispatchEvent(new CustomEvent("openUniversalSearch"));
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            <div className="relative mx-2">
              <button
                className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-400 hover:text-white'}`}
                title="Change language"
                onClick={() => setLangDropdownOpen((v) => !v)}
              >
                <span className="font-bold">{lang.toUpperCase()}</span>
              </button>
              {languageDropdown}
            </div>
            <button
              className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-400 hover:text-white'}`}
              title={t("notifications")}
            >
              <FiBell className="w-5 h-5" />
            </button>
            <button
              className="flex items-center focus:outline-none relative mx-2"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              aria-label={t("openProfileMenu", { default: "Open profile menu" })}
              tabIndex={0}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-900' : 'bg-gray-700 border-[#23272f]'}`}> 
                {user?.profileImage &&
                typeof user.profileImage === "object" &&
                user.profileImage.data ? (
                  <Image
                    src={user.profileImage.data}
                    alt="Profile"
                    width={36}
                    height={36}
                  />
                ) : user?.firstName ? (
                  <span className="text-white font-bold text-lg">
                    {user.firstName[0].toUpperCase()}
                  </span>
                ) : (
                  <span className="text-white font-bold text-lg">U</span>
                )}
              </div>
            </button>
            {profileDropdown}
          </>
        ) : (
          <>
            <div className="w-full max-w-xs">
              <UniversalSearchBar />
            </div>
            <div className="flex items-center gap-1 ml-1">
              <div className="relative">
                <button
                  className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-400 hover:text-white'}`}
                  title="Change language"
                  onClick={() => setLangDropdownOpen((v) => !v)}
                >
                  <span className="font-bold">{lang.toUpperCase()}</span>
                </button>
                {languageDropdown}
              </div>
              <button
                className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-300 hover:text-white' : 'hover:bg-gray-200 text-gray-400 hover:text-white'}`}
                title={t("notifications")}
              >
                <FiBell className="w-5 h-5" />
              </button>
              <button
                className="ml-1 flex items-center focus:outline-none relative"
                onClick={() => setDropdownOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                aria-label={t("openProfileMenu", { default: "Open profile menu" })}
                tabIndex={0}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-900' : 'bg-gray-700 border-[#23272f]'}`}> 
                  {user?.profileImage &&
                  typeof user.profileImage === "object" &&
                  user.profileImage.data ? (
                    <Image
                      src={user.profileImage.data}
                      alt="Profile"
                      width={36}
                      height={36}
                    />
                  ) : user?.firstName ? (
                    <span className="text-white font-bold text-lg">
                      {user.firstName[0].toUpperCase()}
                    </span>
                  ) : (
                    <span className="text-white font-bold text-lg">U</span>
                  )}
                </div>
              </button>
              {profileDropdown}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default HeaderNavBar;
