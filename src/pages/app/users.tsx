import React, { useState, useEffect, useLayoutEffect } from "react";
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
import { createPortal } from "react-dom";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserCard from "@/components/users/UserCard";
import {
  Table as ShadcnTable,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

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
  const [sortBy, setSortBy] = useState<
    "firstNameAsc" | "lastNameAsc" | "roleAsc"
  >("firstNameAsc");

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
    role: string
  ): Promise<string | undefined> => {
    try {
      const response = await fetch("/api/invitations/send/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
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
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add role: ${errorText}`);
      }
      await fetchRoles();
      setAddRoleModalOpen(false);
    } catch (error) {
      console.error("Error adding role:", error);
    }
  };

  const filteredUsers = users
    .filter(
      (u) =>
        u.companyId ===
        (user && "companyId" in user ? (user as any).companyId : undefined)
    )
    .filter((u) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        u.userId.firstName.toLowerCase().includes(q) ||
        u.userId.lastName.toLowerCase().includes(q) ||
        u.userId.email.toLowerCase().includes(q)
      );
    })
    .filter((u) => (filterRole === "all" ? true : u.role === filterRole))
    .sort((a, b) => {
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

  // Only roles from users in your company
  const companyRoles = Array.from(
    new Set(
      users
        .filter(
          (u) =>
            u.companyId ===
            (user && "companyId" in user ? (user as any).companyId : undefined)
        )
        .map((u) => u.role)
    )
  );

  // TESTE - DE STERS DUPA
  const handleTestButtonClick = () => {};

  //TERMINAT TEST

  //effects
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
    window.addEventListener(
      "open-user-profile",
      handleOpenUserProfile as EventListener
    );
    return () => {
      window.removeEventListener(
        "open-user-profile",
        handleOpenUserProfile as EventListener
      );
    };
  }, [users]);

  // Prevent background scroll when any modal is open
  useLayoutEffect(() => {
    const modalOpen =
      addUserModalOpen ||
      addRoleModalOpen ||
      orgChartModalOpen ||
      profileModalOpen;
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [addUserModalOpen, addRoleModalOpen, orgChartModalOpen, profileModalOpen]);

  if (!user) {
    return <Loading />;
  }

  return (
    <div
      className={`relative min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}
    >
      <div className="px-2 lg:px-4 pt-4 mt-4">
        <div className="max-w-[100vw] mx-auto">
          <Card
            className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} overflow-hidden mx-2`}
          >
            {/* Users Header with Action Buttons */}
            <CardHeader
              className={`p-6 ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-blue-50 border-gray-200"} border-b`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${theme === "dark" ? "bg-blue-600" : "bg-blue-500"}`}
                  >
                    <FaUsers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2
                      className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                    >
                      Team Directory
                    </h2>
                    <p
                      className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                    >
                      View and manage all team members in your organization
                    </p>
                  </div>
                </div>
                {/* Action Buttons */}
                {user.role === "admin" && (
                  <div className="flex flex-wrap gap-3">
                    <Button
                      asChild
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transform hover:scale-[1.02] transition-all duration-200 ${
                        theme === "dark"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      <span onClick={() => setAddUserModalOpen(true)}>
                        <FaUserPlus className="w-4 h-4" />
                        <span>Add User</span>
                      </span>
                    </Button>
                    <Button
                      asChild
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transform hover:scale-[1.02] transition-all duration-200 ${
                        theme === "dark"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                    >
                      <span onClick={() => setAddRoleModalOpen(true)}>
                        <FaPlus className="w-4 h-4" />
                        <span>Add Role</span>
                      </span>
                    </Button>
                    <Button
                      asChild
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transform hover:scale-[1.02] transition-all duration-200 ${
                        theme === "dark"
                          ? "bg-slate-600 hover:bg-slate-700 text-white"
                          : "bg-slate-500 hover:bg-slate-600 text-white"
                      }`}
                    >
                      <span onClick={() => setOrgChartModalOpen(true)}>
                        <FaSitemap className="w-4 h-4" />
                        <span>Org Chart</span>
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            {/* Controls */}
            <CardContent
              className={`p-6 ${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"} border-b`}
            >
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
            </CardContent>
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
          </Card>
        </div>
      </div>
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
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 mb-6 sm:mb-8 justify-center items-center z-10 relative w-full px-2 sm:px-0">
        {user && user.role === "admin" && (
          <>
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 active:scale-95"
              onClick={() => setAddUserModalOpen(true)}
            >
              Add User
            </button>
            <button
              className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 active:scale-95"
              onClick={() => setAddRoleModalOpen(true)}
            >
              Add Role
            </button>
          </>
        )}
        {user && user.role === "admin" && (
          <button
            className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-600 hover:to-sky-400 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 transition-all duration-300 active:scale-95"
            onClick={() => setOrgChartModalOpen(true)}
          >
            View Org Chart
          </button>
        )}
      </div>
      <div className="w-full mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl shadow-xl bg-white/80 border border-gray-200/60 backdrop-blur-lg z-10 relative">
          {/* Search left, Role/Sort right on desktop; stacked on mobile */}
          <div className="flex flex-col w-full sm:w-auto">
            <label className="font-semibold text-sm text-black flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto">
              <span className="mb-1 sm:mb-0 sm:mr-2">Search:</span>
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary bg-inherit text-black"
              />
            </label>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-center justify-end w-full sm:w-auto mt-2 sm:mt-0">
            <label className="font-semibold text-sm text-black flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto">
              <span className="mb-1 sm:mb-0 sm:mr-2">Role:</span>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full sm:w-40 rounded px-2 py-1 border border-gray-300 bg-inherit text-black"
              >
                <option value="all">All</option>
                {Array.from(
                  new Set(
                    users
                      .filter(
                        (u) =>
                          u.companyId ===
                          (user && "companyId" in user
                            ? (user as any).companyId
                            : undefined)
                      )
                      .map((u) => u.role)
                  )
                ).map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <label className="font-semibold text-sm text-black flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto">
              <span className="mb-1 sm:mb-0 sm:mr-2">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-48 rounded px-2 py-1 border border-gray-300 bg-inherit text-black"
              >
                <option value="firstNameAsc">First Name (A-Z)</option>
                <option value="lastNameAsc">Last Name (A-Z)</option>
                <option value="roleAsc">Role (A-Z)</option>
              </select>
            </label>
          </div>
        </div>
      </div>
      {/* Card view for mobile only */}
      <div className="flex flex-col gap-4 sm:gap-6 md:hidden z-10 relative w-full px-1">
        {[...filteredUsers]
          .sort((a, b) => {
            // Admins always on top
            if (a.role === "admin" && b.role !== "admin") return -1;
            if (a.role !== "admin" && b.role === "admin") return 1;
            return 0;
          })
          .map((user) => (
            <UserCard
              key={user._id}
              user={user}
              theme={theme}
              onClick={handleUserClick}
            />
          ))}
      </div>
      {/* Table view for desktop only */}
      <div
        className={`bg-white/90 shadow-2xl rounded-2xl overflow-x-auto hidden md:block border border-gray-200/60 backdrop-blur-lg z-10 relative`}
      >
        <ShadcnTable>
          <TableHeader>
            <TableRow>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No users registered.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user._id}
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => handleUserClick(user.userId._id)}
                >
                  <TableCell>{user.userId.firstName}</TableCell>
                  <TableCell>{user.userId.lastName}</TableCell>
                  <TableCell>{user.userId.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {user.permissions && user.permissions.length > 0
                      ? user.permissions.join(", ")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </ShadcnTable>
      </div>
    </div>
  );
};

UsersPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default UsersPage;
