import React, { useMemo } from "react";

interface Tab {
  id: string;
  label: string;
}

interface SettingsSidebarProps {
  tabs: Tab[];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  theme: string;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = React.memo(
  ({ tabs, activeTab, setActiveTab, theme }) => {
    // Memoize tabs
    const memoTabs = useMemo(() => tabs, [tabs]);

    return (
      <aside
        className={`settings-sidebar-mobile w-full md:w-1/4 max-w-xs 
          ${theme === 'light' ? 'bg-white border-r border-gray-200' : 'bg-gray-900 border-r border-gray-800'}
          p-2 sm:p-4 md:p-8 shadow-none md:shadow-sm md:static sticky top-0 z-20`}
      >
        <h2 className={`text-lg sm:text-2xl md:text-3xl font-extrabold mb-2 sm:mb-6 md:mb-8 
          ${theme === 'light' ? 'text-gray-900' : 'text-white'} hidden md:block`}>
          Settings
        </h2>
        <nav>
          <ul className="flex md:block space-x-2 md:space-x-0 md:space-y-2">
            {memoTabs.map((tab) => (
              <li
                key={tab.id}
                className={`cursor-pointer px-3 sm:px-4 py-2 sm:py-3 rounded-md text-base sm:text-lg transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                    ? (theme === 'dark'
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-blue-400 text-white shadow-md')
                    : (theme === 'dark'
                        ? 'text-gray-200 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')}
                `}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    );
  }
);

export default React.memo(SettingsSidebar);