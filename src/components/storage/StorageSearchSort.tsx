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

interface StorageSearchSortProps {
  search: string;
  setSearch: (v: string) => void;
  sortBy: "name" | "size";
  setSortBy: (v: "name" | "size") => void;
}

const StorageSearchSort: React.FC<StorageSearchSortProps> = ({
  search,
  setSearch,
  sortBy,
  setSortBy,
}) => (
  <div className="flex flex-col sm:flex-row gap-4 items-center">
    <div className="relative flex-1">
      <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder="Search files..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm"
      />
    </div>
    <div className="relative w-full sm:w-auto">
      <FaSortAlphaDown className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <Select
        value={sortBy}
        onValueChange={v => setSortBy(v as "name" | "size")}
      >
        <SelectTrigger className="pl-12 pr-8 py-3 bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm appearance-none cursor-pointer w-full sm:w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl border mt-1 bg-white text-gray-900 border-gray-200">
          <SelectItem value="name">Sort by Name</SelectItem>
          <SelectItem value="size">Sort by Size</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default StorageSearchSort;