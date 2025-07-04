import React from "react";

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

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  tabs,
  activeTab,
  setActiveTab,
  theme,
}) => (
  <aside
    className={`settings-sidebar-mobile w-full md:w-1/4 max-w-xs bg-${theme === 'light' ? 'white' : 'gray-800'} border-r border-gray-200 p-2 sm:p-4 md:p-8 shadow-none md:shadow-sm md:static sticky top-0 z-20`}
  >
    <h2 className={`text-lg sm:text-2xl md:text-3xl font-extrabold mb-2 sm:mb-6 md:mb-8 text-${theme === 'light' ? 'gray-900' : 'white'} hidden md:block`}>
      Settings
    </h2>
    <nav>
      <ul className="flex md:block space-x-2 md:space-x-0 md:space-y-2">
        {tabs.map((tab) => (
          <li
            key={tab.id}
            className={`cursor-pointer px-3 sm:px-4 py-2 sm:py-3 rounded-md text-base sm:text-lg transition-all duration-200 whitespace-nowrap
              ${activeTab === tab.id ? "bg-blue-400 text-white shadow-md" : `text-${theme === 'light' ? 'gray-700' : 'white'} hover:bg-gray-100 hover:text-gray-900`}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </li>
        ))}
      </ul>
    </nav>
  </aside>
);

export default SettingsSidebar;