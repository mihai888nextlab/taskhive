import React from "react";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import UsersHeader from "@/components/users/UsersHeader";
import UsersControls from "@/components/users/UsersControls";
import UsersListPanel from "@/components/users/UsersListPanel";
import SentInvitationsPanel from "@/components/users/SentInvitationsPanel";
import { Card } from "@/components/ui/card";
import { createPortal } from "react-dom";
import AddUserModal from "@/components/modals/AddUserModal";
import AddRoleModal from "@/components/modals/AddRoleModal";
import OrgChartModal from "@/components/modals/OrgChartModal";
import UserProfileModal from "@/components/modals/UserProfileModal";
import { useUsers } from "@/hooks/useUsers";

const UsersPage: NextPageWithLayout = () => {
  const {
    theme,
    user,
    users,
    loading,
    addUserModalOpen,
    setAddUserModalOpen,
    addRoleModalOpen,
    setAddRoleModalOpen,
    orgChartModalOpen,
    setOrgChartModalOpen,
    profileModalOpen,
    setProfileModalOpen,
    selectedUser,
    roles,
    search,
    setSearch,
    filterRole,
    setFilterRole,
    sortBy,
    setSortBy,
    handleUserClick,
    addUser,
    addRole,
    filteredUsers,
    handleOpenAddUserModal,
    handleOpenAddRoleModal,
    handleOpenOrgChartModal,
    t,
  } = useUsers();

  // Placeholder export handlers
  const handleExportPDF = () => {
    // TODO: Implement PDF export logic
    alert("Export PDF not implemented");
  };

  const handleExportCSV = () => {
    // TODO: Implement CSV export logic
    alert("Export CSV not implemented");
  };

  return (
    <div
      className={`relative min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} pt-10`}
    >
      <div className="px-2 lg:px-4 pt-4 mt-4">
        <div className="max-w-[100vw] mx-auto">
          <Card
            className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border-t-0 border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} overflow-hidden mx-2`}
          >
            <UsersHeader
              theme={theme}
              t={t}
              user={user}
              onExportClick={(e) => {
                const dropdown = e.currentTarget.parentElement?.querySelector(
                  ".export-dropdown-menu"
                ) as HTMLElement;
                if (dropdown) dropdown.classList.toggle("hidden");
              }}
              onExportPDF={handleExportPDF}
              onExportCSV={handleExportCSV}
              onAddUser={handleOpenAddUserModal}
              onAddRole={handleOpenAddRoleModal}
              onOrgChart={handleOpenOrgChartModal}
            />
            <UsersControls
              users={users}
              loading={loading}
              onUserClick={handleUserClick}
              theme={theme}
              currentUser={user}
              search={search}
              onSearchChange={setSearch}
              filterRole={filterRole}
              onFilterRoleChange={setFilterRole}
              sortBy={sortBy as any}
              onSortByChange={setSortBy}
            />
            <UsersListPanel
              users={users}
              loading={loading}
              onUserClick={handleUserClick}
              theme={theme}
              currentUser={user}
              search={search}
              filterRole={filterRole}
              sortBy={sortBy as any}
            />
          </Card>
        </div>
      </div>
      <SentInvitationsPanel theme={theme} t={t} />
      {/* Modals */}
      {addUserModalOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <AddUserModal
            onClose={() => setAddUserModalOpen(false)}
            onUserAdded={addUser}
          />,
          document.body
        )}
      {addRoleModalOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <AddRoleModal
            onClose={() => setAddRoleModalOpen(false)}
            onRoleAdded={addRole}
          />,
          document.body
        )}
      {orgChartModalOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <OrgChartModal onClose={() => setOrgChartModalOpen(false)} />,
          document.body
        )}
      {profileModalOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <UserProfileModal
            open={profileModalOpen}
            onClose={() => setProfileModalOpen(false)}
            user={selectedUser}
          />,
          document.body
        )}
    </div>
  );
};

UsersPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default UsersPage;
