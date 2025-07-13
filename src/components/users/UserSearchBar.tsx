import React, { useCallback } from "react";
import { useTranslations } from "next-intl";

interface UserSearchBarProps {
  search: string;
  setSearch: (v: string) => void;
  filterRole: string;
  setFilterRole: (v: string) => void;
  sortBy: "firstNameAsc" | "lastNameAsc" | "roleAsc";
  setSortBy: (v: "firstNameAsc" | "lastNameAsc" | "roleAsc") => void;
  roles: string[];
}

const UserSearchBar: React.FC<UserSearchBarProps> = React.memo(({
  search,
  setSearch,
  filterRole,
  setFilterRole,
  sortBy,
  setSortBy,
  roles,
}) => {
  const t = useTranslations("UsersPage");

  // Memoize input handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, [setSearch]);
  const handleRoleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRole(e.target.value);
  }, [setFilterRole]);
  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as "firstNameAsc" | "lastNameAsc" | "roleAsc");
  }, [setSortBy]);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 p-6 rounded-2xl shadow-xl bg-white/80 border border-gray-200/60 backdrop-blur-lg">
      <div className="flex-1 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <label className="font-semibold text-sm text-gray-700 flex-shrink-0">
          {t("search")}:
          <input
            type="text"
            placeholder={t("searchUsersPlaceholder")}
            value={search}
            onChange={handleSearchChange}
            className="ml-2 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary bg-inherit text-gray-900"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2 items-center justify-end">
        <label className="font-semibold text-sm text-gray-700">
          {t("role")}:
          <select
            value={filterRole}
            onChange={handleRoleChange}
            className="ml-2 rounded px-2 py-1 border border-gray-300 bg-inherit text-gray-900"
          >
            <option value="all">{t("all")}</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </label>
        <label className="font-semibold text-sm text-gray-700">
          {t("sortBy")}:
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="ml-2 rounded px-2 py-1 border border-gray-300 bg-inherit text-gray-900"
          >
            <option value="firstNameAsc">{t("firstNameAZ")}</option>
            <option value="lastNameAsc">{t("lastNameAZ")}</option>
            <option value="roleAsc">{t("roleAZ")}</option>
          </select>
        </label>
      </div>
    </div>
  );
});

export default React.memo(UserSearchBar);