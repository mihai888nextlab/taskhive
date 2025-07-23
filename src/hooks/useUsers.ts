import { useState, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import { useTheme } from "@/components/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";

export function useUsers() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const t = useTranslations("UsersPage");

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [addRoleModalOpen, setAddRoleModalOpen] = useState(false);
  const [orgChartModalOpen, setOrgChartModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);

  const fetchUsers = useCallback(async () => {
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
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch("/api/roles");
      if (!response.ok) throw new Error("Failed to fetch roles");
      const data = await response.json();
      setRoles(data.map((role: { name: string }) => role.name));
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  }, []);

  const handleUserClick = useCallback(
    (userId: string) => {
      const userObj = users.find((u) => u.userId._id === userId);
      if (userObj) {
        setSelectedUser({
          ...userObj.userId,
          role: userObj.role,
        });
        setProfileModalOpen(true);
      }
    },
    [users]
  );

  const addUser = useCallback(
    async (email: string, role: string): Promise<string | undefined> => {
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
    },
    [fetchUsers]
  );

  const addRole = useCallback(
    async (roleName: string) => {
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
    },
    [fetchRoles]
  );

  const filteredUsers = useMemo(() => {
    const companyId = user && "companyId" in user ? (user as any).companyId : undefined;
    const q = search.trim().toLowerCase();
    return users
      .filter((u) => u.companyId === companyId)
      .filter((u) => {
        if (!q) return true;
        return (
          u.userId.firstName?.toLowerCase().includes(q) ||
          u.userId.lastName?.toLowerCase().includes(q) ||
          u.userId.email?.toLowerCase().includes(q)
        );
      })
      .filter((u) => {
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

  const handleOpenAddUserModal = useCallback(() => setAddUserModalOpen(true), []);
  const handleOpenAddRoleModal = useCallback(() => setAddRoleModalOpen(true), []);
  const handleOpenOrgChartModal = useCallback(() => setOrgChartModalOpen(true), []);

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

  useLayoutEffect(() => {
    const modalOpen = addUserModalOpen || addRoleModalOpen || orgChartModalOpen || profileModalOpen;
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [addUserModalOpen, addRoleModalOpen, orgChartModalOpen, profileModalOpen]);

  return {
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
    setSelectedUser,
    roles,
    setRoles,
    search,
    setSearch,
    filterRole,
    setFilterRole,
    sortBy,
    setSortBy,
    fetchUsers,
    fetchRoles,
    handleUserClick,
    addUser,
    addRole,
    filteredUsers,
    companyRoles,
    handleOpenAddUserModal,
    handleOpenAddRoleModal,
    handleOpenOrgChartModal,
    t,
  };
}
