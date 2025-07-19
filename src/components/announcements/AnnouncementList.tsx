import React, { useMemo, useCallback } from "react";
import AnnouncementCard from "./AnnouncementCard";
import { FaSearch, FaSpinner, FaBullhorn, FaFilter, FaThumbtack } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: { firstName: string; lastName: string; email: string };
  category: string;
  pinned: boolean;
  expiresAt?: string;
}

interface AnnouncementListProps {
  announcements: Announcement[];
  theme: string;
  isAdmin?: boolean;
  onPinToggle?: (id: string, pinned: boolean) => void;
  onComment?: (id: string, comment: string) => void;
  onDelete?: (id: string) => void;
  onCardClick?: (announcement: Announcement) => void;
  controlsOnly?: boolean;
  cardsOnly?: boolean;
  loading?: boolean;
  // Controlled state props
  search?: string;
  onSearchChange?: (v: string) => void;
  categoryFilter?: string;
  onCategoryFilterChange?: (v: string) => void;
  categories?: string[];
}

const AnnouncementList: React.FC<AnnouncementListProps> = React.memo(({
  announcements,
  theme,
  isAdmin,
  onPinToggle,
  onComment,
  onDelete,
  onCardClick,
  controlsOnly = false,
  cardsOnly = false,
  loading = false,
  search = "",
  onSearchChange,
  categoryFilter = "All",
  onCategoryFilterChange,
  categories = ["All", "Update", "Event", "Alert"],
}) => {
  const t = useTranslations("AnnouncementsPage");

  // Memoize filteredAnnouncements
  const filteredAnnouncements = useMemo(() => {
    const filtered = announcements.filter(a => {
      const matchesCategory = categoryFilter === "All" || a.category === categoryFilter;
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.content.toLowerCase().includes(search.toLowerCase()) ||
        a.createdBy.firstName.toLowerCase().includes(search.toLowerCase()) ||
        a.createdBy.lastName.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Sort: pinned announcements first, then by creation date (newest first)
    return filtered.sort((a, b) => {
      // If one is pinned and the other isn't, pinned comes first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      // If both have same pinned status, sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [announcements, search, categoryFilter]);

  // Memoize pinnedCount
  const pinnedCount = useMemo(() => filteredAnnouncements.filter(a => a.pinned).length, [filteredAnnouncements]);

  // Memoize event handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onSearchChange && onSearchChange(e.target.value),
    [onSearchChange]
  );
  const handleCategoryFilterChange = useCallback(
    (v: string) => onCategoryFilterChange && onCategoryFilterChange(v),
    [onCategoryFilterChange]
  );
  const handleCardClick = useCallback(
    (announcement: Announcement) => onCardClick && onCardClick(announcement),
    [onCardClick]
  );

  // Memoize announcements grid
  const announcementsGrid = useMemo(() => (
    <div className="space-y-4">
      {filteredAnnouncements.map((announcement) => (
        <AnnouncementCard
          key={announcement._id}
          announcement={announcement}
          theme={theme}
          isAdmin={isAdmin}
          onPinToggle={onPinToggle}
          onComment={onComment}
          onDelete={onDelete}
          onCardClick={handleCardClick}
        />
      ))}
    </div>
  ), [filteredAnnouncements, theme, isAdmin, onPinToggle, onComment, onDelete, handleCardClick]);

  if (controlsOnly) {
    return (
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <Input
            type="text"
            placeholder={t("searchAnnouncementsPlaceholder")}
            value={search}
            onChange={handleSearchChange}
            className={`w-full pl-10 pr-4 text-sm rounded-xl border transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            }`}
            style={{ height: "36px" }}
          />
        </div>
        {/* Category Filter */}
        <div className="relative">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
          <Select
            value={categoryFilter}
            onValueChange={handleCategoryFilterChange}
          >
            <SelectTrigger
              className={`w-full pl-9 pr-8 text-sm rounded-xl border transition-all duration-200 min-w-[140px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
              style={{ height: "36px" }}
            >
              <SelectValue placeholder={t("categoryAll")} />
            </SelectTrigger>
            <SelectContent className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border border-gray-300'} rounded-lg p-0`}>
              {categories.map(cat => (
                <SelectItem
                  key={cat}
                  value={cat}
                  className={`${theme === 'dark' ? 'text-white bg-gray-900 hover:bg-blue-950 focus:bg-blue-950 data-[state=checked]:bg-blue-950 data-[state=checked]:text-blue-300' : 'text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700'} px-4 py-2 text-sm cursor-pointer transition-colors`}
                >
                  {cat === "All" ? t("categoryAll") : t(`category${cat}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  if (cardsOnly) {
    return (
      <div className="px-6 py-6">
        {loading ? (
          <div className="text-center py-16">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
            }`}>
              <FaSpinner className="animate-spin text-2xl text-blue-600" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t("loadingAnnouncements")}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t("pleaseWaitFetchAnnouncements")}
            </p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-16">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <FaBullhorn className="text-2xl text-gray-400" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {search.trim() ? t("noMatchingAnnouncementsFound") : t("noAnnouncementsYet")}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {search.trim() 
                ? t("tryAdjustingSearchOrFilters") 
                : t("checkBackLater")
              }
            </p>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  theme === 'dark' 
                    ? 'bg-blue-900/30 text-blue-300 border border-blue-800' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  <FaBullhorn className="w-3.5 h-3.5" />
                  <span>
                    {filteredAnnouncements.length} {filteredAnnouncements.length === 1 ? t("announcement") : t("announcements")}
                  </span>
                </div>
                
                {search.trim() && (
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t("searchingFor", { search })}
                  </div>
                )}
              </div>
              
              {categoryFilter !== 'All' && (
                <div className={`text-sm px-3 py-1.5 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {t("categoryLabel", { category: categoryFilter })}
                </div>
              )}
            </div>

            {/* Announcements Grid */}
            {announcementsGrid}
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" style={{ top: "50%" }} />
          <Input
            type="text"
            placeholder={t("searchAnnouncementsPlaceholder")}
            value={search}
            onChange={handleSearchChange}
            className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border transition-all duration-200 h-12
              ${theme === 'dark' 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
            style={{ height: "48px" }}
          />
        </div>

        {/* Category Filter */}
        <div className="relative" style={{ minWidth: 160 }}>
          <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" style={{ top: "50%" }} />
          <Select
            value={categoryFilter}
            onValueChange={handleCategoryFilterChange}
          >
            <select
              className={`pl-9 pr-8 py-3 text-sm rounded-xl border transition-all duration-200 appearance-none cursor-pointer min-w-[140px] h-12
                ${theme === 'dark' 
                  ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
              style={{ height: "48px" }}
              value={categoryFilter}
              onChange={e => handleCategoryFilterChange(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "All" ? t("categoryAll") : t(`category${cat}`)}
                </option>
              ))}
            </select>
          </Select>
        </div>
      </div>

      <div className="px-6 py-6">
        {loading ? (
          <div className="text-center py-16">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
            }`}>
              <FaSpinner className="animate-spin text-2xl text-blue-600" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {t("loadingAnnouncements")}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t("pleaseWaitFetchAnnouncements")}
            </p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-16">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <FaBullhorn className="text-2xl text-gray-400" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {search.trim() ? t("noMatchingAnnouncementsFound") : t("noAnnouncementsYet")}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {search.trim() 
                ? t("tryAdjustingSearchOrFilters") 
                : t("checkBackLater")
              }
            </p>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  theme === 'dark' 
                    ? 'bg-blue-900/30 text-blue-300 border border-blue-800' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  <FaBullhorn className="w-3.5 h-3.5" />
                  <span>
                    {filteredAnnouncements.length} {filteredAnnouncements.length === 1 ? t("announcement") : t("announcements")}
                  </span>
                </div>
                
                {pinnedCount > 0 && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    theme === 'dark' 
                      ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800' 
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}>
                    <FaThumbtack className="w-3 h-3" />
                    <span>{pinnedCount} pinned</span>
                  </div>
                )}
                
                {search.trim() && (
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t("searchingFor", { search })}
                  </div>
                )}
              </div>
              
              {categoryFilter !== 'All' && (
                <div className={`text-sm px-3 py-1.5 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {t("categoryLabel", { category: categoryFilter })}
                </div>
              )}
            </div>

            {/* Announcements Grid */}
            {announcementsGrid}
          </>
        )}
      </div>
    </>
  );
});

export default React.memo(AnnouncementList);