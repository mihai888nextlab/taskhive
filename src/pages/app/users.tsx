import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { FaPlus, FaUsers, FaUserPlus, FaSitemap } from "react-icons/fa";
import { useTheme } from "@/components/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import Loading from "@/components/Loading";
import UserList from "@/components/users/UserList";
import AddUserModal from "@/components/modals/AddUserModal";
import AddRoleModal from "@/components/modals/AddRoleModal";
import OrgChartModal from "@/components/modals/OrgChartModal";
import UserProfileModal from "@/components/modals/UserProfileModal";
import { createPortal } from 'react-dom';

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

const UsersPage: NextPageWithLayout = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [addRoleModalOpen, setAddRoleModalOpen] = useState(false);
  const [orgChartModalOpen, setOrgChartModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortBy, setSortBy] = useState<"firstNameAsc" | "lastNameAsc" | "roleAsc">("firstNameAsc");

  // Fetch data functions
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/get-users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      if (!response.ok) throw new Error("Failed to fetch roles");
      const data = await response.json();
      setRoles(data.map((role: { name: string }) => role.name));
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // Handle functions
  const handleUserClick = (userId: string) => {
    const userObj = users.find((u) => u.userId._id === userId);
    if (userObj) {
      setSelectedUser({
        ...userObj.userId,
        role: userObj.role,
      });
      setProfileModalOpen(true);
    }
  };

  const addUser = async (
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    role: string
  ): Promise<string | undefined> => {
    try {
      const response = await fetch("/api/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName, password, role }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return `Failed to add user: ${errorText}`;
      }

      await fetchUsers();
      setAddUserModalOpen(false);
      return undefined;
    } catch (error) {
      console.error("Error adding user:", error);
      return `Error adding user: ${error instanceof Error ? error.message : String(error)}`;
    }
  };

  const addRole = async (roleName: string) => {
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roleName }),
      });

      if (!response.ok && response.status !== 409) {
        throw new Error("Failed to add role");
      }

      // Handle org chart update
      const orgChartResponse = await fetch("/api/org-chart");
      if (orgChartResponse.ok) {
        const orgChartData = await orgChartResponse.json();
        const departments = orgChartData.departments || [];
        const availableDept = departments.find((d: any) => d.id === "available-roles");

        if (availableDept) {
          if (availableDept.levels.length > 0 && !availableDept.levels[0].roles.includes(roleName)) {
            availableDept.levels[0].roles.push(roleName);
          } else if (availableDept.levels.length === 0) {
            availableDept.levels.push({ id: "available-roles-level", roles: [roleName] });
          }
        } else {
          departments.unshift({
            id: "available-roles",
            name: "Available Roles",
            levels: [{ id: "available-roles-level", roles: [roleName] }],
          });
        }

        await fetch("/api/org-chart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ departments }),
        });
      }

      await fetchRoles();
      setOrgChartModalOpen(true);
    } catch (error) {
      console.error("Error adding role:", error);
    }
  };

  // Effects
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [user]);

  useEffect(() => {
    function handleOpenUserProfile(e: CustomEvent) {
      const userId = e.detail;
      const userObj = users.find((u) => u.userId._id === userId);
      if (userObj) {
        setSelectedUser({ ...userObj.userId, role: userObj.role });
        setProfileModalOpen(true);
      }
    }
    window.addEventListener("open-user-profile", handleOpenUserProfile as EventListener);
    return () => {
      window.removeEventListener("open-user-profile", handleOpenUserProfile as EventListener);
    };
  }, [users]);

  if (!user) {
    return <Loading />;
  }

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>

      {/* Main Content */}
      <div className="px-2 lg:px-4 pt-4 mt-4">
        <div className="max-w-[100vw] mx-auto">
          <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-lg border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} overflow-hidden mx-2`}>
            {/* Users Header with Action Buttons */}
            <div className={`p-6 ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-blue-50 border-gray-200"} border-b`}>
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} shadow-lg`}>
                    <FaUsers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      Team Directory
                    </h2>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                      View and manage all team members in your organization
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {user.role === "admin" && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setAddUserModalOpen(true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ${
                        theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <FaUserPlus className="w-4 h-4" />
                      <span>Add User</span>
                    </button>
                    <button
                      onClick={() => setAddRoleModalOpen(true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ${
                        theme === 'dark' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      <FaPlus className="w-4 h-4" />
                      <span>Add Role</span>
                    </button>
                    <button
                      onClick={() => setOrgChartModalOpen(true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 ${
                        theme === 'dark' ? 'bg-slate-600 hover:bg-slate-700 text-white' : 'bg-slate-500 hover:bg-slate-600 text-white'
                      }`}
                    >
                      <FaSitemap className="w-4 h-4" />
                      <span>Org Chart</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className={`p-6 ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"} border-b`}>
              <UserList
                users={users}
                loading={loading}
                onUserClick={handleUserClick}
                theme={theme}
                currentUser={user}
                controlsOnly
                search={search}
                onSearchChange={setSearch}
                filterRole={filterRole}
                onFilterRoleChange={setFilterRole}
                sortBy={sortBy}
                onSortByChange={setSortBy}
              />
            </div>

            {/* Users List */}
            <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
              <UserList
                users={users}
                loading={loading}
                onUserClick={handleUserClick}
                theme={theme}
                currentUser={user}
                cardsOnly
                search={search}
                filterRole={filterRole}
                sortBy={sortBy}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {addUserModalOpen && typeof window !== 'undefined' && createPortal(
        <AddUserModal
          onClose={() => setAddUserModalOpen(false)}
          onUserAdded={addUser}
        />,
        document.body
      )}

      {addRoleModalOpen && typeof window !== 'undefined' && createPortal(
        <AddRoleModal
          onClose={() => setAddRoleModalOpen(false)}
          onRoleAdded={addRole}
        />,
        document.body
      )}

      {orgChartModalOpen && typeof window !== 'undefined' && createPortal(
        <OrgChartModal onClose={() => setOrgChartModalOpen(false)} />,
        document.body
      )}

      {profileModalOpen && typeof window !== 'undefined' && createPortal(
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
