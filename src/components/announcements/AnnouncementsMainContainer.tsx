import React from "react";
import AnnouncementsExportDropdown from "./AnnouncementsExportDropdown";
import AnnouncementList from "./AnnouncementList";
import { FaBullhorn, FaThumbtack } from "react-icons/fa";

interface AnnouncementsMainContainerProps {
  theme: string;
  activeTab: 'all' | 'pinned';
  t: (key: string) => string;
  displayedAnnouncements: any[];
  pinnedAnnouncements: any[];
  loading: boolean;
  isAdmin: boolean;
  handlePinToggle: (id: string, pinned: boolean) => void;
  handleComment: (id: string, comment: string) => void;
  handleDelete: (id: string) => void;
  handleCardClick: (announcement: any) => void;
  handleExportPDF: () => void;
  handleExportCSV: () => void;
  search: string;
  setSearch: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (s: string) => void;
  categories: string[];
}

const AnnouncementsMainContainer: React.FC<AnnouncementsMainContainerProps> = ({
  theme,
  activeTab,
  t,
  displayedAnnouncements,
  pinnedAnnouncements,
  loading,
  isAdmin,
  handlePinToggle,
  handleComment,
  handleDelete,
  handleCardClick,
  handleExportPDF,
  handleExportCSV,
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  categories,
}) => (
  <div className="px-2 lg:px-4 pt-4">
    <div className="max-w-[100vw] mx-auto">
      <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} overflow-hidden mx-2`}>
        {/* Announcements Header with Export Dropdown */}
        <div className={`p-6 ${theme === "dark" ? "bg-gray-700 border-b border-gray-600" : (activeTab === 'all' ? "bg-blue-50 border-b border-blue-200" : "bg-yellow-50 border-b border-yellow-200")}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                activeTab === 'all'
                  ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
                  : theme === 'dark' ? 'bg-yellow-600' : 'bg-yellow-500'
              }`}>
                {activeTab === 'all' ? (
                  <FaBullhorn className="w-5 h-5 text-white" />
                ) : (
                  <FaThumbtack className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {activeTab === 'all' ? t("allAnnouncements") : t("pinnedAnnouncements")}
                </h2>
                <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  {activeTab === 'all' 
                    ? t("allAnnouncementsDesc")
                    : t("pinnedAnnouncementsDesc")
                  }
                </p>
              </div>
            </div>
            <AnnouncementsExportDropdown
              theme={theme}
              onExportPDF={handleExportPDF}
              onExportCSV={handleExportCSV}
              t={t}
            />
          </div>
        </div>
        {/* Controls */}
        <div className={`p-6 ${theme === "dark" ? "bg-gray-700 border-b border-gray-600" : "bg-gray-50 border-b border-gray-200"}`}>
          <AnnouncementList
            announcements={displayedAnnouncements}
            theme={theme}
            isAdmin={isAdmin}
            onPinToggle={handlePinToggle}
            onComment={handleComment}
            onDelete={handleDelete}
            onCardClick={handleCardClick}
            controlsOnly
            search={search}
            onSearchChange={setSearch}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            categories={categories}
          />
        </div>
        {/* Announcements List */}
        <div className={`max-h-[calc(100vh-320px)] overflow-y-auto ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
          <AnnouncementList
            announcements={displayedAnnouncements}
            theme={theme}
            isAdmin={isAdmin}
            onPinToggle={handlePinToggle}
            onComment={handleComment}
            onDelete={handleDelete}
            onCardClick={handleCardClick}
            cardsOnly
            loading={loading}
          />
        </div>
      </div>
    </div>
  </div>
);

export default AnnouncementsMainContainer;
