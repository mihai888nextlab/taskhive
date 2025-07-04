import React, { useMemo } from "react";
import AnnouncementCard from "./AnnouncementCard";
import { FaSearch, FaSpinner, FaBullhorn, FaFilter, FaThumbtack } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

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

const AnnouncementList: React.FC<AnnouncementListProps> = ({
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
  // Filter and sort announcements - pinned first, then by creation date
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

  // Separate pinned and regular announcements for display info
  const pinnedCount = filteredAnnouncements.filter(a => a.pinned).length;

  if (controlsOnly) {
    return (
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={e => onSearchChange && onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border transition-all duration-200 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm'
            }`}
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <Select
            value={categoryFilter}
            onValueChange={v => onCategoryFilterChange && onCategoryFilterChange(v as string)}
          >
            <select
              className={`pl-9 pr-8 py-3 text-sm rounded-xl border transition-all duration-200 appearance-none cursor-pointer min-w-[140px] ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm'
              }`}
              value={categoryFilter}
              onChange={e => onCategoryFilterChange && onCategoryFilterChange(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
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
              Loading announcements...
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Please wait while we fetch the latest updates
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
              {search.trim() ? 'No matching announcements found' : 'No announcements yet'}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {search.trim() 
                ? 'Try adjusting your search criteria or filters' 
                : 'Check back later for company updates and news'
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
                  <span>{filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? 's' : ''}</span>
                </div>
                
                {search.trim() && (
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Searching for "{search}"
                  </div>
                )}
              </div>
              
              {categoryFilter !== 'All' && (
                <div className={`text-sm px-3 py-1.5 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  Category: {categoryFilter}
                </div>
              )}
            </div>

            {/* Announcements Grid */}
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
                  onCardClick={onCardClick}
                />
              ))}
            </div>
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
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={e => onSearchChange && onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border transition-all duration-200 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm'
            }`}
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <Select
            value={categoryFilter}
            onValueChange={v => onCategoryFilterChange && onCategoryFilterChange(v as string)}
          >
            <select
              className={`pl-9 pr-8 py-3 text-sm rounded-xl border transition-all duration-200 appearance-none cursor-pointer min-w-[140px] ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                  : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm'
              }`}
              value={categoryFilter}
              onChange={e => onCategoryFilterChange && onCategoryFilterChange(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
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
              Loading announcements...
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Please wait while we fetch the latest updates
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
              {search.trim() ? 'No matching announcements found' : 'No announcements yet'}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {search.trim() 
                ? 'Try adjusting your search criteria or filters' 
                : 'Check back later for company updates and news'
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
                  <span>{filteredAnnouncements.length} announcement{filteredAnnouncements.length !== 1 ? 's' : ''}</span>
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
                    Searching for "{search}"
                  </div>
                )}
              </div>
              
              {categoryFilter !== 'All' && (
                <div className={`text-sm px-3 py-1.5 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  Category: {categoryFilter}
                </div>
              )}
            </div>

            {/* Announcements Grid */}
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
                  onCardClick={onCardClick}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AnnouncementList;