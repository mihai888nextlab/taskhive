import React from "react";
import UserList from "@/components/users/UserList";

interface UsersListPanelProps {
  users: any[];
  loading: boolean;
  onUserClick: (userId: string) => void;
  theme: string;
  currentUser: any;
  search: string;
  filterRole: string;
  sortBy?: "firstNameAsc" | "lastNameAsc" | "roleAsc";
}

const UsersListPanel: React.FC<UsersListPanelProps> = ({
  users, loading, onUserClick, theme, currentUser, search, filterRole, sortBy
}) => (
  <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
    <UserList
      users={users}
      loading={loading}
      onUserClick={onUserClick}
      theme={theme}
      currentUser={currentUser}
      cardsOnly
      search={search}
      filterRole={filterRole}
      sortBy={sortBy}
    />
  </div>
);

export default UsersListPanel;
