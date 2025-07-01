import React from "react";
import { FaSearch, FaSortAlphaDown } from "react-icons/fa";

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
      <input
        type="text"
        placeholder="Search files..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm"
      />
    </div>
    <div className="relative">
      <FaSortAlphaDown className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <select
        value={sortBy}
        onChange={e => setSortBy(e.target.value as "name" | "size")}
        className="pl-12 pr-8 py-3 bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 shadow-sm appearance-none cursor-pointer"
      >
        <option value="name">Sort by Name</option>
        <option value="size">Sort by Size</option>
      </select>
    </div>
  </div>
);

export default StorageSearchSort;