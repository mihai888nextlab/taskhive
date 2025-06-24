import React from "react";

interface UserSearchBarProps {
  search: string;
  setSearch: (v: string) => void;
  filterRole: string;
  setFilterRole: (v: string) => void;
  sortBy: "firstNameAsc" | "lastNameAsc" | "roleAsc";
  setSortBy: (v: "firstNameAsc" | "lastNameAsc" | "roleAsc") => void;
  roles: string[];
}

const UserSearchBar: React.FC<UserSearchBarProps> = ({
  search,
  setSearch,
  filterRole,
  setFilterRole,
  sortBy,
  setSortBy,
  roles,
}) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-4 rounded-xl shadow bg-white border border-gray-200">
    <div className="flex-1 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
      <label className="font-semibold text-sm text-black flex-shrink-0">
        Search:
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="ml-2 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary bg-inherit text-black"
        />
      </label>
    </div>
    <div className="flex flex-wrap gap-2 items-center justify-end">
      <label className="font-semibold text-sm text-black">
        Role:
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="ml-2 rounded px-2 py-1 border border-gray-300 bg-inherit text-black"
        >
          <option value="all">All</option>
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </label>
      <label className="font-semibold text-sm text-black">
        Sort by:
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as "firstNameAsc" | "lastNameAsc" | "roleAsc")}
          className="ml-2 rounded px-2 py-1 border border-gray-300 bg-inherit text-black"
        >
          <option value="firstNameAsc">First Name (A-Z)</option>
          <option value="lastNameAsc">Last Name (A-Z)</option>
          <option value="roleAsc">Role (A-Z)</option>
        </select>
      </label>
    </div>
  </div>
);

export default UserSearchBar;