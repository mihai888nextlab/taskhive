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
    <div className="max-w-2xl mx-auto mt-8 mb-4">
      <input
        type="text"
        placeholder="Search files..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
      />
    </div>
    <div className="flex justify-end max-w-2xl mx-auto mb-2">
      <select
        value={sortBy}
        onChange={e => setSortBy(e.target.value as "name" | "size")}
        className="px-3 py-1 rounded border border-gray-300"
      >
        <option value="name">Sort by Name</option>
        <option value="size">Sort by Size</option>
      </select>
    </div>
  </>
);

export default StorageSearchSort;