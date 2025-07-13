import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
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

const UsersPage: NextPageWithLayout = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const t = useTranslations("UsersPage");

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
  const handleUserClick = useCallback((userId: string) => {
    const userObj = users.find((u) => u.userId._id === userId);
    if (userObj) {
      setSelectedUser({
        ...userObj.userId,
        role: userObj.role,
      });
      setProfileModalOpen(true);
    }
  }, [users]);

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

  const filteredUsers = useMemo(() => {
    const companyId = user && "companyId" in user ? (user as any).companyId : undefined;
    const q = search.trim().toLowerCase();

    return users
      .filter((u) => u.companyId === companyId)
      .filter((u) => {
        // Search filter
        if (!q) return true;
        return (
          u.userId.firstName?.toLowerCase().includes(q) ||
          u.userId.lastName?.toLowerCase().includes(q) ||
          u.userId.email?.toLowerCase().includes(q)
        );
      })
      .filter((u) => {
        // Role filter
        if (filterRole === "all") return true;
        return u.role === filterRole;
      })
      .sort((a, b) => {
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
  }, [users, user, search, filterRole, sortBy]);

  // Only roles from users in your company
  const companyId = user && "companyId" in user ? (user as any).companyId : undefined;
  const companyRoles = useMemo(() => {
    const rolesSet = new Set<string>();
    users.forEach((u) => {
      if (u.companyId === companyId) {
        rolesSet.add(u.role);
      }
    });
    return Array.from(rolesSet);
  }, [users, companyId]);

  // TESTE - DE STERS DUPA
  const handleTestButtonClick = () => {};

  // Handler to open Add User Modal
  const handleOpenAddUserModal = () => setAddUserModalOpen(true);

  // Handler to open Add Role Modal
  const handleOpenAddRoleModal = () => setAddRoleModalOpen(true);

  // Handler to open Org Chart Modal
  const handleOpenOrgChartModal = () => setOrgChartModalOpen(true);

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
                      {t("teamDirectory")}
                    </h2>
                    <p
                      className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
                    >
                      {t("teamDirectoryDescription")}
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
                      <span onClick={handleOpenAddUserModal}>
                        <FaUserPlus className="w-4 h-4" />
                        <span>{t("addUser")}</span>
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
                      <span onClick={handleOpenAddRoleModal}>
                        <FaPlus className="w-4 h-4" />
                        <span>{t("addRole")}</span>
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
                      <span onClick={handleOpenOrgChartModal}>
                        <FaSitemap className="w-4 h-4" />
                        <span>{t("orgChart")}</span>
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
                users={users} // <-- Pass all users here!
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
    </div>
  );
};

UsersPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default UsersPage;
