import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { NextPageWithLayout, TableColumn, TableDataItem } from "@/types";
import Loading from "@/components/Loading";
import Table from "@/components/dashboard/Table";
import { useEffect, useState } from "react";
import AddUsersModal from "@/components/modals/AddUserModal";
import AddRoleModal from "@/components/modals/AddRoleModal"; // Import AddRoleModal
import OrgChartModal from "@/components/modals/OrgChartModal"; // Import OrgChartModal
import UserProfileModal from "@/components/modals/UserProfileModal";
import { useTheme } from "@/components/ThemeContext"; // Import the useTheme hook
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

const DashboardOverviewPage: NextPageWithLayout = () => {
  const { user } = useAuth();
  const { theme } = useTheme(); // Get the current theme

  const [users, setUsers] = useState<
    {
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
        skills?: string[]; // <-- Add this line
      };
      companyId: string;
      role: string;
      permissions: string[];
    }[]
  >([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [addRoleModalOpen, setAddRoleModalOpen] = useState(false); // State for Add Role Modal
  const [orgChartModalOpen, setOrgChartModalOpen] = useState(false); // State for Org Chart Modal
  const [roles, setRoles] = useState<string[]>([]); // Store roles
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortBy, setSortBy] = useState<
    "firstNameAsc" | "lastNameAsc" | "roleAsc"
  >("firstNameAsc");

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
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClasses} ${textColor}`}
          >
            {item.role}
          </span>
        );
      },
    },
  ];

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/get-users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      console.log("Fetched users:", data.users);
      setUsers(data.users);
      setLoadingUsers(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoadingUsers(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      if (!response.ok) {
        throw new Error("Failed to fetch roles");
      }
      const data = await response.json();
      const fetchedRoles = data.map((role: { name: string }) => role.name);
      setRoles(fetchedRoles);
    } catch (error) {
      console.error("Error fetching roles:", error);
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
        // Only throw if it's not a "role already exists" error
        throw new Error("Failed to add role");
      }

      // Fetch current org chart data
      const orgChartResponse = await fetch("/api/org-chart");
      if (!orgChartResponse.ok) {
        throw new Error("Failed to fetch org chart");
      }
      const orgChartData = await orgChartResponse.json();

      // ✅ New code (works with departments/levels structure)
      const departments = orgChartData.departments || [];
      const availableDept = departments.find(
        (d: any) => d.id === "available-roles"
      );

      if (availableDept) {
        // Add to first level of Available Roles department
        if (
          availableDept.levels.length > 0 &&
          !availableDept.levels[0].roles.includes(roleName)
        ) {
          availableDept.levels[0].roles.push(roleName);
        } else if (availableDept.levels.length === 0) {
          availableDept.levels.push({
            id: "available-roles-level",
            roles: [roleName],
          });
        }
      } else {
        // If not found, create Available Roles department
        departments.unshift({
          id: "available-roles",
          name: "Available Roles",
          levels: [{ id: "available-roles-level", roles: [roleName] }],
        });
      }

      // Save updated org chart data to the database
      const saveOrgChartResponse = await fetch("/api/org-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departments,
        }),
      });

      if (!saveOrgChartResponse.ok) {
        throw new Error("Failed to save org chart");
      }

      setRoles((prevRoles) => [...prevRoles, roleName]);
      setOrgChartModalOpen(true);
      try {
        fetchRoles(); // Refresh the roles list
      } catch (error) {
        console.error("Error fetching roles after adding role:", error);
      }
    } catch (error) {
      console.error("Error adding role:", error);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          password,
          role,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to add user. Server responded with:", errorText);
        return `Failed to add user: ${errorText}`;
      }

      const data = await response.json();
      console.log("Add user response:", data);

      setLoadingUsers(true); // Set loading state to true while fetching users
      fetchUsers(); // Refresh the user list after adding a new user
      setAddUserModalOpen(false); // Close the modal after adding the user
      return undefined;
    } catch (error) {
      console.error("Error adding user:", error);
      return `Error adding user: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  };

  const handleUserClick = (userId: string) => {
    const userObj = users.find((u) => u.userId._id === userId);
    if (userObj) {
      setSelectedUser({
        ...userObj.userId, // This now includes skills
        role: userObj.role,
      });
      setProfileModalOpen(true);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch("/api/update-user-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!response.ok) throw new Error("Failed to update role");
      await fetchUsers(); // Refresh users after update
    } catch (error) {
      console.error("Error updating user role:", error);
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

  useEffect(() => {
    fetchUsers();
    fetchRoles(); // Fetch roles when the component mounts
  }, [user]);

  useEffect(() => {
    function handleOpenUserProfile(e: CustomEvent) {
      const userId = e.detail;
      const userObj = users.find((u) => u.userId._id === userId);
      if (userObj) {
        setSelectedUser({
          ...userObj.userId,
          role: userObj.role,
        });
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

  if (!user) {
    return <Loading />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-2 sm:p-4 md:p-8 font-sans overflow-hidden">
      {loadingUsers && <Loading />}
      {addUserModalOpen && (
        <AddUsersModal
          onClose={() => setAddUserModalOpen(false)}
          onUserAdded={async (
            email: string,
            firstName: string,
            lastName: string,
            password: string,
            role: string
          ) => {
            try {
              const result = await addUser(
                email,
                firstName,
                lastName,
                password,
                role
              );
              if (result) {
                console.error("Error adding user:", result);
                return result;
              } else {
                fetchUsers();
                setAddUserModalOpen(false);
                return undefined;
              }
            } catch (error) {
              console.error("Error adding user:", error);
              return undefined;
            }
          }}
        />
      )}
      {addRoleModalOpen && (
        <AddRoleModal
          onClose={() => setAddRoleModalOpen(false)}
          onRoleAdded={(roleName: string) => {
            addRole(roleName);
          }}
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

// Assign the layout to the page
DashboardOverviewPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardOverviewPage;
