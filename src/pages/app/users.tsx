


import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";
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


const UsersPage: NextPageWithLayout = React.memo(() => {
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

  // Memoize filteredUsers
  // Removed duplicate filteredUsers definition

  // Use a ref to access filteredUsers in export handlers
  // Removed duplicate filteredUsersRef definition

  // --- Export Handlers ---
  // CSV Export (plain function, no memoization)
  function handleExportCSV() {
    const usersToExport = filteredUsers;
    if (!usersToExport || usersToExport.length === 0) return;
    const rows = [
      ["Name", "Email", "Role"],
      ...usersToExport.map((u: User) => [
        `${u.userId.firstName} ${u.userId.lastName}`.trim(),
        u.userId.email,
        u.role
      ])
    ];
    const csv = rows.map((r: any[]) => r.map((f: any) => `"${String(f).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    // @ts-ignore
    (window.saveAs || require('file-saver').saveAs)(blob, "users.csv");
  }

  // PDF Export (plain function, no memoization)
  function handleExportPDF() {
    const usersToExport = filteredUsers;
    if (!usersToExport || usersToExport.length === 0) return;
    const jsPDF = require('jspdf').default;
    const autoTableModule = require('jspdf-autotable');
    const autoTable = autoTableModule.default || autoTableModule;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    // Header (dark blue, visually consistent)
    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text("Users Report", 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(34, 34, 34);
    // Table columns and rows
    const columns = [
      { header: "Name", dataKey: "name" },
      { header: "Email", dataKey: "email" },
      { header: "Role", dataKey: "role" },
    ];
    const rows = usersToExport.map((u: User) => ({
      name: `${u.userId.firstName} ${u.userId.lastName}`.trim(),
      email: u.userId.email,
      role: u.role
    }));
    // Adjusted column widths and center the table
    const colWidths = { name: 60, email: 70, role: 40 };
    const totalWidth = Object.values(colWidths).reduce((a, b) => a + b, 0);
    const margin = (210 - totalWidth) / 2;
    autoTable(doc, {
      startY: 38,
      columns,
      body: rows,
      headStyles: {
        fillColor: [17, 24, 39],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 11,
        halign: 'center',
        valign: 'middle',
        cellPadding: 2.5,
      },
      bodyStyles: {
        fontSize: 10,
        textColor: 34,
        cellPadding: 2,
        halign: 'left',
        valign: 'top',
        lineColor: [220, 220, 220],
        minCellHeight: 7,
        overflow: 'linebreak',
        font: 'helvetica',
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249],
        textColor: 34,
      },
      columnStyles: {
        name: { cellWidth: colWidths.name },
        email: { cellWidth: colWidths.email },
        role: { cellWidth: colWidths.role },
      },
      margin: { left: margin, right: margin },
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 2,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'top',
        minCellHeight: 7,
        textColor: 34,
      },
      didDrawPage: (data: any) => {
        const pageCount = doc.getNumberOfPages();
        const pageNumber = doc.getCurrentPageInfo().pageNumber;
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text(`Page ${pageNumber} of ${pageCount}`,
          200, 290, { align: 'right' });
      },
    });
    doc.save("users.pdf");
  }

  // Memoize fetchUsers
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

  // Memoize fetchRoles
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

  // Memoize handleUserClick
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

  // Memoize addUser
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

  // Memoize addRole
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

  // Memoize filteredUsers
  const filteredUsers = useMemo(() => {
    const companyId =
      user && "companyId" in user ? (user as any).companyId : undefined;
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
          return (a.userId.firstName || "").localeCompare(
            b.userId.firstName || ""
          );
        }
        if (sortBy === "lastNameAsc") {
          return (a.userId.lastName || "").localeCompare(
            b.userId.lastName || ""
          );
        }
        if (sortBy === "roleAsc") {
          return (a.role || "").localeCompare(b.role || "");
        }
        return 0;
      });
  }, [users, user, search, filterRole, sortBy]);

  // Only roles from users in your company
  const companyId =
    user && "companyId" in user ? (user as any).companyId : undefined;
  const companyRoles = useMemo(() => {
    const rolesSet = new Set<string>();
    users.forEach((u) => {
      if (u.companyId === companyId) {
        rolesSet.add(u.role);
      }
    });
    return Array.from(rolesSet);
  }, [users, companyId]);

  // Handler to open Add User Modal
  const handleOpenAddUserModal = useCallback(
    () => setAddUserModalOpen(true),
    []
  );

  // Handler to open Add Role Modal
  const handleOpenAddRoleModal = useCallback(
    () => setAddRoleModalOpen(true),
    []
  );

  // Handler to open Org Chart Modal
  const handleOpenOrgChartModal = useCallback(
    () => setOrgChartModalOpen(true),
    []
  );

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
      className={`relative min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} pt-10`}
    >
      <div className="px-2 lg:px-4 pt-4 mt-4">
        <div className="max-w-[100vw] mx-auto">
          <Card
            className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border-t-0 border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} overflow-hidden mx-2`}
          >
            {/* Users Header with Action Buttons and Export */}
            <CardHeader
              className={`p-6 ${theme === "dark" ? "bg-gray-700" : "bg-blue-50"}`}
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
                <div className="flex flex-wrap gap-3">
                  {/* Export Dropdown Button */}
                  <div className="relative export-dropdown" tabIndex={0}>
                    <Button
                      type="button"
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                        theme === 'dark' ? 'bg-slate-600 text-white hover:bg-slate-700' : 'bg-slate-500 text-white hover:bg-slate-600'
                      }`}
                      title="Export"
                      aria-haspopup="true"
                      aria-expanded="false"
                      tabIndex={0}
                      onClick={e => {
                        const dropdown = (e.currentTarget.parentElement?.querySelector('.export-dropdown-menu') as HTMLElement);
                        if (dropdown) {
                          dropdown.classList.toggle('hidden');
                        }
                      }}
                    >
                      {/* Export Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                      <span>{t("export")}</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </Button>
                    <div className="export-dropdown-menu absolute z-20 left-0 mt-2 min-w-[120px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hidden"
                    >
                      <button
                        type="button"
                        onClick={e => { handleExportPDF(); (e.currentTarget.parentElement as HTMLElement).classList.add('hidden'); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-xl focus:outline-none"
                      >
                        {/* PDF file icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" fill="#E53E3E"/><rect x="7" y="6" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="10" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="14" width="6" height="2" rx="1" fill="#fff"/><text x="12" y="19" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">PDF</text></svg>
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={e => { handleExportCSV(); (e.currentTarget.parentElement as HTMLElement).classList.add('hidden'); }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-xl focus:outline-none"
                      >
                        {/* CSV file icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" fill="#38A169"/><rect x="7" y="6" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="10" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="14" width="6" height="2" rx="1" fill="#fff"/><text x="12" y="19" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">CSV</text></svg>
                        CSV
                      </button>
                    </div>
                  </div>
                  {/* Action Buttons */}
                  {user.role === "admin" && (
                    <>
                      <Button
                        type="button"
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transform hover:scale-[1.02] transition-all duration-200 ${
                          theme === "dark"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                        onClick={handleOpenAddUserModal}
                      >
                        <FaUserPlus className="w-4 h-4" />
                        <span>{t("addUser")}</span>
                      </Button>
                      <Button
                        type="button"
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transform hover:scale-[1.02] transition-all duration-200 ${
                          theme === "dark"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                        onClick={handleOpenAddRoleModal}
                      >
                        <FaPlus className="w-4 h-4" />
                        <span>{t("addRole")}</span>
                      </Button>
                      <Button
                        type="button"
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transform hover:scale-[1.02] transition-all duration-200 ${
                          theme === "dark"
                            ? "bg-slate-600 hover:bg-slate-750 text-white"
                            : "bg-slate-500 hover:bg-slate-600 text-white"
                        }`}
                        onClick={handleOpenOrgChartModal}
                      >
                        <FaSitemap className="w-4 h-4" />
                        <span>{t("orgChart")}</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            {/* Controls */}
            <CardContent
              className={`p-6 ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}
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
});

UsersPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default React.memo(UsersPage);
