import React from "react";
import { CardContent } from "@/components/ui/card";
import UserList from "@/components/users/UserList";

interface UsersControlsProps {
  users: any[];
  loading: boolean;
  onUserClick: (userId: string) => void;
  theme: string;
  currentUser: any;
  search: string;
  onSearchChange: (v: string) => void;
  filterRole: string;
  onFilterRoleChange: (v: string) => void;
  sortBy?: "firstNameAsc" | "lastNameAsc" | "roleAsc";
  onSortByChange?: (v: "firstNameAsc" | "lastNameAsc" | "roleAsc") => void;
}

const UsersControls: React.FC<UsersControlsProps> = ({
  users, loading, onUserClick, theme, currentUser, search, onSearchChange, filterRole, onFilterRoleChange, sortBy, onSortByChange
}) => (
  <CardContent className={`p-6 ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
    <UserList
      users={users}
      loading={loading}
      onUserClick={onUserClick}
      theme={theme}
      currentUser={currentUser}
      controlsOnly
      search={search}
      onSearchChange={onSearchChange}
      filterRole={filterRole}
      onFilterRoleChange={onFilterRoleChange}
      sortBy={sortBy}
      onSortByChange={onSortByChange}
    />
  </CardContent>
);

export default UsersControls;
