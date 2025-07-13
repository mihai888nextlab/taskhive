import React from "react";
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
  ({ search, setSearch, sortBy, setSortBy, t }) => (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Search Bar */}
      <div className="flex-1 relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder={t("searchFiles")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border transition-all duration-200 bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      {/* Sort Dropdown */}
      <div className="relative">
        <FaSortAlphaDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Select
          value={sortBy}
          onValueChange={v => setSortBy(v as "name" | "size")}
        >
          <SelectTrigger className="w-full pl-9 pr-8 py-3 text-sm rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[160px]">
            <SelectValue placeholder={t("sortBy")} />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
            <SelectItem value="name" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">
              {t("sortByName")}
            </SelectItem>
            <SelectItem value="size" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">
              {t("sortBySize")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
);

export default React.memo(StorageSearchSort);