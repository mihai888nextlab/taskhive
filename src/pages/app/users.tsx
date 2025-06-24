import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "../../pages/_app";
import { NextPageWithLayout, TableColumn, TableDataItem } from "@/types";
import Loading from "@/components/Loading";
import Table from "@/components/dashboard/Table";
import { useEffect, useState, useMemo } from "react";
import AddUsersModal from "@/components/modals/AddUserModal";
import AddRoleModal from "@/components/modals/AddRoleModal";
import OrgChartModal from "@/components/modals/OrgChartModal";
import UserProfileModal from "@/components/modals/UserProfileModal";
import { useTheme } from '@/components/ThemeContext';
import UserSearchBar from "@/components/users/UserSearchBar";
import UserCard from "@/components/users/UserCard";

interface Project extends TableDataItem {
  user_id: string;
  user_email: string;
  user_firstName: string;
  user_lastName: string;
  companyId: string;
  role: string;
  permissions: string[];
}

interface AuthUser {
  role: string;
}

const DashboardOverviewPage: NextPageWithLayout = () => {
  const { user } = useAuth() as { user: AuthUser | null };
  const { theme } = useTheme();

  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [addRoleModalOpen, setAddRoleModalOpen] = useState(false);
  const [orgChartModalOpen, setOrgChartModalOpen] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortBy, setSortBy] = useState<"firstNameAsc" | "lastNameAsc" | "roleAsc">("firstNameAsc");

  const [message, setMessage] = useState<string | null>(null);

  const projectColumns: TableColumn<Project>[] = [
    {
      key: "user_firstName",
      header: "First Name",
      render: (item) => <span>{item.user_firstName}</span>,
    },
    {
      key: "user_lastName",
      header: "Last Name",
      render: (item) => <span>{item.user_lastName}</span>,
    },
    {
      key: "user_email",
      header: "Email",
      render: (item) => <span>{item.user_email}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (item) => {
        let badgeClasses = "";
        let textColor = "";
        switch (item.role) {
          case "admin":
            badgeClasses = "bg-red-100";
            textColor = "text-red-800";
            break;
          case "user":
            badgeClasses = "bg-blue-100";
            textColor = "text-blue-800";
            break;
          default:
            badgeClasses = "bg-gray-100";
            textColor = "text-gray-800";
            break;
        }
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClasses} ${textColor}`}>
            {item.role}
          </span>
        );
      },
    },
  ];

  // Fetch users and roles
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("/api/get-users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      setMessage("Error fetching users.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      if (!response.ok) throw new Error("Failed to fetch roles");
      const data = await response.json();
      setRoles(data.map((role: { name: string }) => role.name));
    } catch (error) {
      setMessage("Error fetching roles.");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    // eslint-disable-next-line
  }, [user]);

  // Memoized filtered and sorted users
  const filteredUsers = useMemo(() => {
    let result = users;
    // Search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(user =>
        user.userId.firstName.toLowerCase().includes(q) ||
        user.userId.lastName.toLowerCase().includes(q) ||
        user.userId.email.toLowerCase().includes(q)
      );
    }
    // Filter by role
    if (filterRole !== "all") {
      result = result.filter(user => user.role === filterRole);
    }
    // Sort
    result = [...result].sort((a, b) => {
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
  }, [users, search, filterRole, sortBy]);

  // Handlers
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

  // Add user logic
  const handleAddUser = async (
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
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Failed to add user.");
        return data.message;
      }
      setMessage("User added successfully.");
      await fetchUsers();
      return undefined;
    } catch (error) {
      setMessage("Error adding user.");
      return "Error adding user.";
    }
  };

  // Add role logic
  const handleAddRole = async (roleName: string): Promise<string | undefined> => {
    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roleName }),
      });
      if (response.status === 409) {
        setMessage("Role already exists.");
        return "Role already exists.";
      }
      if (!response.ok) {
        setMessage("Failed to add role.");
        return "Failed to add role.";
      }
      setMessage("Role added successfully.");
      await fetchRoles();
      return undefined;
    } catch (error) {
      setMessage("Error adding role.");
      return "Error adding role.";
    }
  };

  if (!user) return <Loading />;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-2 sm:p-4 md:p-8 font-sans overflow-hidden">
      {loadingUsers && <Loading />}
      {addUserModalOpen && (
        <AddUsersModal
          onClose={() => setAddUserModalOpen(false)}
          onUserAdded={handleAddUser}
        />
      )}
      {addRoleModalOpen && (
        <AddRoleModal
          onClose={() => setAddRoleModalOpen(false)}
          onRoleAdded={handleAddRole}
        />
      )}
      {orgChartModalOpen && (
        <OrgChartModal onClose={() => setOrgChartModalOpen(false)} />
      )}
      {profileModalOpen && (
        <UserProfileModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={selectedUser}
        />
      )}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center tracking-tighter leading-tight">
        Manage Users
      </h1>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 mb-8 justify-center items-center">
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
      {/* Show messages */}
      {message && (
        <div className="mb-4 text-center text-sm text-red-600 font-semibold">{message}</div>
      )}
      {/* Search, Filter, Sort Bar */}
      <UserSearchBar
        search={search}
        setSearch={setSearch}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        sortBy={sortBy}
        setSortBy={setSortBy}
        roles={[...new Set(users.map(u => u.role))]}
      />
      {/* Card view for mobile only */}
      <div className="flex flex-col gap-4 md:hidden">
        {filteredUsers.map((user) => (
          <UserCard key={user._id} user={user} theme={theme} onClick={handleUserClick} />
        ))}
      </div>
      {/* Table view for desktop only */}
      <div className={`bg-${theme === 'dark' ? 'gray-800' : 'white'} shadow-xl rounded-2xl overflow-x-auto hidden md:block`}>
        <Table<Project>
          title="Users List"
          data={filteredUsers.map((user) => ({
            id: user._id,
            user_id: user.userId._id,
            user_email: user.userId.email,
            user_firstName: user.userId.firstName,
            user_lastName: user.userId.lastName,
            companyId: user.companyId,
            role: user.role,
            permissions: user.permissions,
          }))}
          columns={projectColumns}
          emptyMessage="No users registered."
          rowOnClick={(item) => handleUserClick(item.user_id)}
        />
      </div>
    </div>
  );
};

DashboardOverviewPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardOverviewPage;