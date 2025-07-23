import React from "react";
import { Button } from "@/components/ui/button";
import { FaPlus, FaBullhorn, FaThumbtack } from "react-icons/fa";

interface AnnouncementsHeaderProps {
  theme: string;
  activeTab: 'all' | 'pinned';
  setActiveTab: (tab: 'all' | 'pinned') => void;
  isAdmin: boolean;
  onShowForm: () => void;
  pinnedCount: number;
  t: (key: string) => string;
}

const AnnouncementsHeader: React.FC<AnnouncementsHeaderProps> = ({
  theme,
  activeTab,
  setActiveTab,
  isAdmin,
  onShowForm,
  pinnedCount,
  t,
}) => (
  <div className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-gray-900 ' : 'bg-gray-100 '} px-4 lg:px-8 pt-10`}> 
    <div className="max-w-[100vw] mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className={`flex rounded-xl p-1 gap-2 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}> 
          <Button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'all'
                ? theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-500 text-white'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            variant="ghost"
          >
            <FaBullhorn className="w-4 h-4" />
            <span>{t("allAnnouncements")}</span>
          </Button>
          <Button
            type="button"
            onClick={() => setActiveTab('pinned')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'pinned'
                ? theme === 'dark'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-500 text-white'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            variant="ghost"
          >
            <FaThumbtack className="w-4 h-4" />
            <span>{t("pinnedAnnouncements")} ({pinnedCount})</span>
          </Button>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {isAdmin && (
            <Button
              type="button"
              onClick={onShowForm}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transform hover:scale-[1.02] transition-all duration-200 group ${
                theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              <FaPlus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span>{t("createAnnouncement")}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default AnnouncementsHeader;
