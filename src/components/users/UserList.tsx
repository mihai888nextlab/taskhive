import React, { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import UserCard from "./UserCard";
import { FaSearch, FaSpinner, FaUsers, FaFilter, FaSort, FaTimes } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface User {
  _id: string;
  userId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImage?: {
      data: string;
      contentType: string;
      uploadedAt: string;
      fileName?: string;
    };
    description?: string;
    skills?: string[];
  };
  companyId: string;
  role: string;
  permissions: string[];
}

interface UserListProps {
  users: User[];
  loading: boolean;
  onUserClick: (userId: string) => void;
  theme: string;
  currentUser: any;
  controlsOnly?: boolean;
  cardsOnly?: boolean;
  // Controlled state props
  search?: string;
  onSearchChange?: (v: string) => void;
  filterRole?: string;
  onFilterRoleChange?: (v: string) => void;
  sortBy?: "firstNameAsc" | "lastNameAsc" | "roleAsc";
  onSortByChange?: (v: "firstNameAsc" | "lastNameAsc" | "roleAsc") => void;
}

const UserList: React.FC<UserListProps> = ({
  users,
  loading,
  onUserClick,
  theme,
  currentUser,
  controlsOnly = false,
  cardsOnly = false,
  search = "",
  onSearchChange,
  filterRole = "all",
  onFilterRoleChange,
  sortBy = "firstNameAsc",
  onSortByChange,
}) => {
  const t = useTranslations("UsersPage");

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = users.filter(
      (u) =>
        u.companyId ===
        (currentUser && "companyId" in currentUser
          ? currentUser.companyId
          : undefined)
    );

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (u) =>
          u.userId.firstName.toLowerCase().includes(q) ||
          u.userId.lastName.toLowerCase().includes(q) ||
          u.userId.email.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (filterRole !== "all") {
      result = result.filter((u) => u.role === filterRole);
    }

    // Sort
    result.sort((a, b) => {
      // Admins always on top
      if (a.role === "admin" && b.role !== "admin") return -1;
      if (a.role !== "admin" && b.role === "admin") return 1;

      if (sortBy === "firstNameAsc") {
        return (a.userId.firstName || "").localeCompare(
          b.userId.firstName || ""
        );
      }
      if (sortBy === "lastNameAsc") {
        return (a.userId.lastName || "").localeCompare(b.userId.lastName || "");
      }
      if (sortBy === "roleAsc") {
        return (a.role || "").localeCompare(b.role || "");
      }
      return 0;
    });

    return result;
  }, [users, search, filterRole, sortBy, currentUser]);

  // Memoize companyRoles
  const companyId =
    currentUser && "companyId" in currentUser
      ? currentUser.companyId
      : undefined;
  const companyRoles = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.companyId === companyId) set.add(u.role);
    });
    return Array.from(set);
  }, [users, companyId]);

  // Memoize input handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange && onSearchChange(e.target.value);
    },
    [onSearchChange]
  );
  const handleFilterRoleChange = useCallback(
    (v: string) => {
      onFilterRoleChange && onFilterRoleChange(v);
    },
    [onFilterRoleChange]
  );
  const handleSortByChange = useCallback(
    (v: "firstNameAsc" | "lastNameAsc" | "roleAsc") => {
      onSortByChange && onSortByChange(v);
    },
    [onSortByChange]
  );

  if (controlsOnly) {
    const [showFilterModal, setShowFilterModal] = React.useState(false);
    return (
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder={t("searchUsersPlaceholder")}
            value={search}
            onChange={handleSearchChange}
            className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border transition-all duration-200 ${
              theme === "dark"
                ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
          />
        </div>

        {/* Filter & Sort Button */}
        <div className="flex w-full lg:w-auto">
          <Button
            type="button"
            className="rounded-xl px-4 py-2 font-semibold text-sm bg-blue-500 hover:bg-blue-600 text-white shadow flex items-center gap-2 w-full lg:w-auto"
            onClick={() => setShowFilterModal(true)}
            style={{ minWidth: 0, height: 40, justifyContent: "center" }}
            title={t("filterSortButton", { default: "Filter & Sort" })}
          >
            <FaFilter className="w-5 h-5" />
            <span className="ml-1">
              {t("filterSortButton", { default: "Filter & Sort" })}
            </span>
          </Button>
        </div>

        {/* Modal for filter/sort */}
        {showFilterModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div
              className={`relative w-full max-w-lg mx-2 lg:mx-0 lg:rounded-3xl rounded-2xl shadow-lg flex flex-col overflow-hidden animate-fadeInUp
              ${theme === "dark" ? "bg-gray-900 border border-gray-700 text-white" : "bg-white border border-gray-200"}`}
            >
              {/* Modal Header */}
              <div
                className={`flex items-center justify-between p-6 border-b relative
                ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}
              >
                <h3
                  className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                >
                  {t("filterSortTitle", { default: "Filter & Sort Users" })}
                </h3>
                <button
                  className={`absolute top-4 right-4 text-xl font-bold z-10 transition-colors ${theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}
                  onClick={() => setShowFilterModal(false)}
                  aria-label={t("cancel")}
                  >
                  <FaTimes />
                </button>
              </div>
              {/* Modal Content */}
              <div
                className={`flex-1 p-6 space-y-6 ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}
              >
                {/* Filter by Role */}
                <Select
                  value={filterRole}
                  onValueChange={handleFilterRoleChange}
                >
                  <SelectTrigger
                    className={`w-full pl-9 pr-8 py-3 text-sm rounded-xl border transition-all duration-200 min-w-[140px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
                    style={{ zIndex: 300 }}
                  >
                    <SelectValue placeholder={t("role")} />
                  </SelectTrigger>
                  <SelectContent
                    className={`${theme === "dark" ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-300"} rounded-lg p-0 z-[300]`}
                  >
                    <SelectItem
                      value="all"
                      className={`px-4 py-2 text-sm cursor-pointer transition-colors ${theme === "dark" ? "text-white bg-gray-900 hover:bg-gray-800 focus:bg-gray-800 data-[state=checked]:bg-blue-900 data-[state=checked]:text-blue-300" : "text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"}`}
                    >
                      {t("all")}
                    </SelectItem>
                    {companyRoles.map((role) => (
                      <SelectItem
                        key={role}
                        value={role}
                        className={`px-4 py-2 text-sm cursor-pointer transition-colors ${theme === "dark" ? "text-white bg-gray-900 hover:bg-gray-800 focus:bg-gray-800 data-[state=checked]:bg-blue-900 data-[state=checked]:text-blue-300" : "text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"}`}
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Sort By */}
                <Select value={sortBy} onValueChange={handleSortByChange}>
                  <SelectTrigger
                    className={`w-full pl-9 pr-8 py-3 text-sm rounded-xl border transition-all duration-200 min-w-[160px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${theme === "dark" ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
                    style={{ zIndex: 300 }}
                  >
                    <SelectValue placeholder={t("sortBy")} />
                  </SelectTrigger>
                  <SelectContent
                    className={`${theme === "dark" ? "bg-gray-900 border-gray-700 text-white" : "bg-white border-gray-300"} rounded-lg p-0 z-[300]`}
                  >
                    <SelectItem
                      value="firstNameAsc"
                      className={`px-4 py-2 text-sm cursor-pointer transition-colors ${theme === "dark" ? "text-white bg-gray-900 hover:bg-gray-800 focus:bg-gray-800 data-[state=checked]:bg-blue-900 data-[state=checked]:text-blue-300" : "text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"}`}
                    >
                      {t("firstName")}
                    </SelectItem>
                    <SelectItem
                      value="lastNameAsc"
                      className={`px-4 py-2 text-sm cursor-pointer transition-colors ${theme === "dark" ? "text-white bg-gray-900 hover:bg-gray-800 focus:bg-gray-800 data-[state=checked]:bg-blue-900 data-[state=checked]:text-blue-300" : "text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"}`}
                    >
                      {t("lastName")}
                    </SelectItem>
                    <SelectItem
                      value="roleAsc"
                      className={`px-4 py-2 text-sm cursor-pointer transition-colors ${theme === "dark" ? "text-white bg-gray-900 hover:bg-gray-800 focus:bg-gray-800 data-[state=checked]:bg-blue-900 data-[state=checked]:text-blue-300" : "text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700"}`}
                    >
                      {t("role")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Modal Footer */}
              <div
                className={`p-6 border-t flex justify-end ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}
              >
                <Button
                  type="button"
                  className="rounded-xl px-6 py-2 font-semibold text-sm bg-blue-500 hover:bg-blue-600 text-white shadow"
                  onClick={() => setShowFilterModal(false)}
                >
                  {t("applyFiltersButton", { default: "Apply" })}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (cardsOnly) {
    return (
      <div className="px-4 py-6">
        {loading ? (
          <div className="text-center py-16">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                theme === "dark" ? "bg-gray-700" : "bg-blue-50"
              }`}
            >
              <FaSpinner className="animate-spin text-2xl text-blue-600" />
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              {t("loadingTeamMembers", { default: "Loading team members..." })}
            </h3>
            <p
              className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              {t("pleaseWaitFetchTeam", {
                default: "Please wait while we fetch your team data",
              })}
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <FaUsers className="text-2xl text-gray-400" />
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              {search.trim()
                ? t("noMatchingUsersFound", {
                    default: "No matching users found",
                  })
                : t("noTeamMembersYet", { default: "No team members yet" })}
            </h3>
            <p
              className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              {search.trim()
                ? t("tryAdjustingSearch", {
                    default: "Try adjusting your search criteria or filters",
                  })
                : t("startByAddingFirstMember", {
                    default: "Start by adding your first team member",
                  })}
            </p>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    theme === "dark"
                      ? "bg-blue-900/30 text-blue-300 border border-blue-800"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  <FaUsers className="w-3.5 h-3.5" />
                  <span>
                    {t("membersCount", { count: filteredUsers.length })}
                  </span>
                </div>
                {search.trim() && (
                  <div
                    className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {t("searchingFor", {
                      search,
                      default: `Searching for "${search}"`,
                    })}
                  </div>
                )}
              </div>

              {filterRole !== "all" && (
                <div
                  className={`text-sm px-3 py-1.5 rounded-full ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t("filteredBy", {
                    role: filterRole,
                    default: `Filtered by: ${filterRole}`,
                  })}
                </div>
              )}
            </div>

            {/* User Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 lg:gap-6">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  theme={theme}
                  onClick={() => onUserClick(user.userId._id)}
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
            placeholder={t("searchUsersPlaceholder")}
            value={search}
            onChange={handleSearchChange}
            className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border transition-all duration-200 ${
              theme === "dark"
                ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            }`}
          />
        </div>

        {/* Filter and Sort */}
        <div className="flex gap-3">
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <Select value={filterRole} onValueChange={handleFilterRoleChange}>
              <SelectTrigger className="w-full pl-9 pr-8 py-3 text-sm rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[140px]">
                <SelectValue placeholder={t("role")} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
                <SelectItem
                  value="all"
                  className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors"
                >
                  {t("all")}
                </SelectItem>
                {companyRoles.map((role) => (
                  <SelectItem
                    key={role}
                    value={role}
                    className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors"
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <Select value={sortBy} onValueChange={handleSortByChange}>
              <SelectTrigger className="w-full pl-9 pr-8 py-3 text-sm rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[160px]">
                <SelectValue placeholder={t("sortBy")} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 rounded-lg p-0">
                <SelectItem
                  value="firstNameAsc"
                  className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors"
                >
                  {t("firstName")}
                </SelectItem>
                <SelectItem
                  value="lastNameAsc"
                  className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors"
                >
                  {t("lastName")}
                </SelectItem>
                <SelectItem
                  value="roleAsc"
                  className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors"
                >
                  {t("role")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {loading ? (
          <div className="text-center py-16">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                theme === "dark" ? "bg-gray-700" : "bg-blue-50"
              }`}
            >
              <FaSpinner className="animate-spin text-2xl text-blue-600" />
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              {t("loadingTeamMembers", { default: "Loading team members..." })}
            </h3>
            <p
              className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              {t("pleaseWaitFetchTeam", {
                default: "Please wait while we fetch your team data",
              })}
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <FaUsers className="text-2xl text-gray-400" />
            </div>
            <h3
              className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              {search.trim()
                ? t("noMatchingUsersFound", {
                    default: "No matching users found",
                  })
                : t("noTeamMembersYet", { default: "No team members yet" })}
            </h3>
            <p
              className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              {search.trim()
                ? t("tryAdjustingSearch", {
                    default: "Try adjusting your search criteria or filters",
                  })
                : t("startByAddingFirstMember", {
                    default: "Start by adding your first team member",
                  })}
            </p>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    theme === "dark"
                      ? "bg-blue-900/30 text-blue-300 border border-blue-800"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  <FaUsers className="w-3.5 h-3.5" />
                  <span>
                    {t("membersCount", { count: filteredUsers.length })}
                  </span>
                </div>
                {search.trim() && (
                  <div
                    className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                  >
                    {t("searchingFor", {
                      search,
                      default: `Searching for "${search}"`,
                    })}
                  </div>
                )}
              </div>

              {filterRole !== "all" && (
                <div
                  className={`text-sm px-3 py-1.5 rounded-full ${
                    theme === "dark"
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t("filteredBy", {
                    role: filterRole,
                    default: `Filtered by: ${filterRole}`,
                  })}
                </div>
              )}
            </div>

            {/* User Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 lg:gap-6">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  theme={theme}
                  onClick={() => onUserClick(user.userId._id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default UserList;
