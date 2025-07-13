import React, { useMemo, useCallback } from "react";
import { FaSearch, FaTrash, FaSpinner, FaClock } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface Session {
  _id: string;
  name: string;
  description: string;
  duration: number;
  tag: string;
  createdAt: string;
}

interface SessionListProps {
  sessions: Session[];
  onDelete: (sessionId: string) => void;
  theme: string;
  sessionSearch: string;
  setSessionSearch: (v: string) => void;
  sessionTagFilter: string;
  setSessionTagFilter: (v: string) => void;
  sessionSort: string;
  setSessionSort: (v: string) => void;
}

const SessionList: React.FC<SessionListProps> = React.memo(({
  sessions,
  onDelete,
  theme,
  sessionSearch,
  setSessionSearch,
  sessionTagFilter,
  setSessionTagFilter,
  sessionSort,
  setSessionSort,
}) => {
  const t = useTranslations("TimeTrackingPage");

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const tags = ["General", "Deep Work", "Meeting", "Break", "Learning"];

  // Memoize input handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSessionSearch(e.target.value);
  }, [setSessionSearch]);
  const handleTagFilterChange = useCallback((v: string) => {
    setSessionTagFilter(v);
  }, [setSessionTagFilter]);
  const handleSortChange = useCallback((v: string) => {
    setSessionSort(v);
  }, [setSessionSort]);

  // Memoize filteredSessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = sessionSearch.trim() === "" ||
        session.name?.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        session.description?.toLowerCase().includes(sessionSearch.toLowerCase());
      const matchesTag = sessionTagFilter === "all" || session.tag === sessionTagFilter;
      return matchesSearch && matchesTag;
    }).sort((a, b) => {
      if (sessionSort === "dateDesc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sessionSort === "dateAsc") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sessionSort === "durationDesc") {
        return b.duration - a.duration;
      } else if (sessionSort === "durationAsc") {
        return a.duration - b.duration;
      }
      return 0;
    });
  }, [sessions, sessionSearch, sessionTagFilter, sessionSort]);

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="flex-shrink-0 p-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder={t("searchSessions")}
            value={sessionSearch}
            onChange={handleSearchChange}
            className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl h-[36px] border transition-all duration-200 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
            }`}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            value={sessionTagFilter}
            onValueChange={handleTagFilterChange}
            disabled={false}
          >
            <SelectTrigger
              className="w-full pl-9 pr-8 text-sm rounded-xl border border-gray-300 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 min-w-[140px]"
              style={{ height: "36px" }}
            >
              <SelectValue placeholder={t("allCategories")} />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
              <SelectItem value="all" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("allCategories")}</SelectItem>
              {tags.map(tag => (
                <SelectItem
                  key={tag}
                  value={tag}
                  className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors"
                >
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sessionSort}
            onValueChange={handleSortChange}
            disabled={false}
          >
            <SelectTrigger
              className="w-full pl-9 pr-8 text-sm rounded-xl border border-gray-300 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 min-w-[140px]"
              style={{ height: "36px" }}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
              <SelectItem value="dateDesc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("newestFirst")}</SelectItem>
              <SelectItem value="dateAsc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("oldestFirst")}</SelectItem>
              <SelectItem value="durationDesc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("longestDuration")}</SelectItem>
              <SelectItem value="durationAsc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">{t("shortestDuration")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
        {filteredSessions.length === 0 ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <FaClock className="text-xl text-gray-400" />
              </div>
              <h3 className={`text-base font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {sessionSearch.trim() ? t("noMatchingSessionsFound") : t("noSessionsYet")}
              </h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {sessionSearch.trim() 
                  ? t("tryAdjustingSearch") 
                  : t("startFirstSession")
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map(session => (
              <div
                key={session._id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  theme === "dark"
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-semibold text-base truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {session.name}
                      </h3>
                      <span className="text-lg font-bold text-blue-500">
                        {formatDuration(session.duration)}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {session.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                      {session.tag && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          theme === 'dark' 
                            ? 'bg-blue-900/30 text-blue-400' 
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {session.tag}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => onDelete(session._id)}
                    className={`ml-4 p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
                      theme === 'dark' 
                        ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                    title="Delete Session"
                    variant="ghost"
                  >
                    <FaTrash size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default React.memo(SessionList);