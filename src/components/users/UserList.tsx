import React, { useMemo } from "react";
import UserCard from "./UserCard";
import { FaSearch, FaSpinner, FaUsers, FaFilter, FaSort } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

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
  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = users.filter(u => 
      u.companyId === (currentUser && "companyId" in currentUser ? currentUser.companyId : undefined)
    );

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(u => 
        u.userId.firstName.toLowerCase().includes(q) ||
        u.userId.lastName.toLowerCase().includes(q) ||
        u.userId.email.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (filterRole !== "all") {
      result = result.filter(u => u.role === filterRole);
    }

    // Sort
    result.sort((a, b) => {
      // Admins always on top
      if (a.role === "admin" && b.role !== "admin") return -1;
      if (a.role !== "admin" && b.role === "admin") return 1;

      if (sortBy === "firstNameAsc") {
        return (a.userId.firstName || "").localeCompare(b.userId.firstName || "");
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

  const companyRoles = Array.from(
    new Set(users.filter(u => 
      u.companyId === (currentUser && "companyId" in currentUser ? currentUser.companyId : undefined)
    ).map(u => u.role))
  );

  if (controlsOnly) {
    return (
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => onSearchChange && onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border transition-all duration-200 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm'
            }`}
          />
        </div>

        {/* Filter and Sort */}
        <div className="flex gap-3">
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <Select
              value={filterRole}
              onValueChange={onFilterRoleChange}
            >
              <SelectTrigger className="w-full pl-9 pr-8 py-3 text-sm rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[140px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 rounded-lg shadow-lg p-0">
                <SelectItem
                  value="all"
                  className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors"
                >
                  All Roles
                </SelectItem>
                {companyRoles.map(role => (
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
            <Select
              value={sortBy}
              onValueChange={onSortByChange}
            >
              <SelectTrigger className="w-full pl-9 pr-8 py-3 text-sm rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[160px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 rounded-lg shadow-lg p-0">
                <SelectItem value="firstNameAsc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">First Name</SelectItem>
                <SelectItem value="lastNameAsc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Last Name</SelectItem>
                <SelectItem value="roleAsc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Role</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  if (cardsOnly) {
    return (
      <div className="px-4 py-6"> {/* Reduced from px-6 to px-4 for more horizontal space */}
        {loading ? (
          <div className="text-center py-16">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
            }`}>
              <FaSpinner className="animate-spin text-2xl text-blue-600" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Loading team members...
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Please wait while we fetch your team data
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <FaUsers className="text-2xl text-gray-400" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {search.trim() ? 'No matching users found' : 'No team members yet'}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {search.trim() 
                ? 'Try adjusting your search criteria or filters' 
                : 'Start by adding your first team member'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  theme === 'dark' 
                    ? 'bg-blue-900/30 text-blue-300 border border-blue-800' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  <FaUsers className="w-3.5 h-3.5" />
                  <span>{filteredUsers.length} member{filteredUsers.length !== 1 ? 's' : ''}</span>
                </div>
                {search.trim() && (
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Searching for "{search}"
                  </div>
                )}
              </div>
              
              {filterRole !== 'all' && (
                <div className={`text-sm px-3 py-1.5 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  Filtered by: {filterRole}
                </div>
              )}
            </div>

            {/* User Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 lg:gap-6">
              {filteredUsers.map(user => (
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
            placeholder="Search by name or email..."
            value={search}
            onChange={e => onSearchChange && onSearchChange(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border transition-all duration-200 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm'
            }`}
          />
        </div>

        {/* Filter and Sort */}
        <div className="flex gap-3">
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <Select
              value={filterRole}
              onValueChange={onFilterRoleChange}
            >
              <SelectTrigger className="w-full pl-9 pr-8 py-3 text-sm rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[140px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 rounded-lg shadow-lg p-0">
                <SelectItem
                  value="all"
                  className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors"
                >
                  All Roles
                </SelectItem>
                {companyRoles.map(role => (
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
            <Select
              value={sortBy}
              onValueChange={onSortByChange}
            >
              <SelectTrigger className="w-full pl-9 pr-8 py-3 text-sm rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 min-w-[160px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 rounded-lg shadow-lg p-0">
                <SelectItem value="firstNameAsc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">First Name</SelectItem>
                <SelectItem value="lastNameAsc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Last Name</SelectItem>
                <SelectItem value="roleAsc" className="text-gray-900 bg-white hover:bg-blue-50 focus:bg-blue-100 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-700 px-4 py-2 text-sm cursor-pointer transition-colors">Role</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {loading ? (
          <div className="text-center py-16">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'
            }`}>
              <FaSpinner className="animate-spin text-2xl text-blue-600" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Loading team members...
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Please wait while we fetch your team data
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <FaUsers className="text-2xl text-gray-400" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {search.trim() ? 'No matching users found' : 'No team members yet'}
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {search.trim() 
                ? 'Try adjusting your search criteria or filters' 
                : 'Start by adding your first team member'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  theme === 'dark' 
                    ? 'bg-blue-900/30 text-blue-300 border border-blue-800' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  <FaUsers className="w-3.5 h-3.5" />
                  <span>{filteredUsers.length} member{filteredUsers.length !== 1 ? 's' : ''}</span>
                </div>
                {search.trim() && (
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Searching for "{search}"
                  </div>
                )}
              </div>
              
              {filterRole !== 'all' && (
                <div className={`text-sm px-3 py-1.5 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  Filtered by: {filterRole}
                </div>
              )}
            </div>

            {/* User Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4 lg:gap-6">
              {filteredUsers.map(user => (
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