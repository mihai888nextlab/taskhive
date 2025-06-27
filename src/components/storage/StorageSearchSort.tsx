import React from "react";

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
  <>
    <div className="max-w-lg sm:max-w-2xl mx-auto mt-6 sm:mt-8 mb-2 sm:mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
      <input
        type="text"
        placeholder="Search files..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-3 sm:px-4 py-2 sm:py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
      />
      <select
        value={sortBy}
        onChange={e => setSortBy(e.target.value as "name" | "size")}
        className="px-3 sm:px-4 py-2 sm:py-2 rounded-xl border border-gray-300 text-sm sm:text-base"
      >
        <option value="name">Sort by Name</option>
        <option value="size">Sort by Size</option>
      </select>
    </div>
  </>
);

export default StorageSearchSort;