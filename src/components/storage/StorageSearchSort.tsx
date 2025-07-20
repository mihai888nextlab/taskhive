import React, { useCallback } from "react";
import { useTheme } from "@/components/ThemeContext";
import { FaSearch, FaSortAlphaDown } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface StorageSearchSortProps {
  search: string;
  setSearch: (v: string) => void;
  sortBy: "name" | "size";
  setSortBy: (v: "name" | "size") => void;
  t: ReturnType<typeof useTranslations>;
}

const StorageSearchSort: React.FC<StorageSearchSortProps> = React.memo(
  ({ search, setSearch, sortBy, setSortBy, t }) => {
    // Memoize search and sort handlers
    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
      },
      [setSearch]
    );
    const handleSortByChange = useCallback(
      (v: string) => {
        setSortBy(v as "name" | "size");
      },
      [setSortBy]
    );
    const { theme } = useTheme();
    return (
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
        {/* Search Bar */}
        <div className="flex-1 relative min-w-0">
          <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
          <Input
            type="text"
            placeholder={t("searchFiles")}
            value={search}
            onChange={handleSearchChange}
            className={`w-full pl-10 pr-4 py-2 sm:py-3 text-xs sm:text-sm rounded-xl border transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'}`}
          />
        </div>
        {/* Sort Dropdown */}
        <div className="relative w-full sm:w-auto">
          <FaSortAlphaDown className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
          <Select value={sortBy} onValueChange={handleSortByChange}>
            <SelectTrigger className={`w-full pl-9 pr-8 py-2 sm:py-3 text-xs sm:text-sm rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[120px] sm:min-w-[160px] ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
              <SelectValue placeholder={t("sortBy")}/>
            </SelectTrigger>
            <SelectContent className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} rounded-lg p-0`}>
              <SelectItem
                value="name"
                className={`cursor-pointer transition-colors px-4 py-2 text-xs sm:text-sm ${theme === 'dark' ? 'text-white bg-gray-800 hover:bg-blue-900 focus:bg-blue-900 data-[state=checked]:bg-blue-900 data-[state=checked]:text-blue-300' : 'text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700'}`}
              >
                {t("sortByName")}
              </SelectItem>
              <SelectItem
                value="size"
                className={`cursor-pointer transition-colors px-4 py-2 text-sm ${theme === 'dark' ? 'text-white bg-gray-800 hover:bg-blue-900 focus:bg-blue-900 data-[state=checked]:bg-blue-900 data-[state=checked]:text-blue-300' : 'text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700'}`}
              >
                {t("sortBySize")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
);

export default React.memo(StorageSearchSort);