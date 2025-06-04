import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "../../pages/_app"; // Adjust path
import { NextPageWithLayout, TableColumn, TableDataItem } from "@/types";
import Loading from "@/components/Loading";
import Table from "@/components/Table";
import { useEffect, useState } from "react";
import AddUsersModal from "@/components/modals/AddUserModal";
import AddRoleModal from "@/components/modals/AddRoleModal"; // Import AddRoleModal
import OrgChartModal from "@/components/modals/OrgChartModal"; // Import OrgChartModal
import { useTheme } from '@/components/ThemeContext'; // Import the useTheme hook

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
  const { theme } = useTheme(); // Get the current theme

  const [users, setUsers] = useState<
    {
      _id: string;
      userId: {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
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

  const projectColumns: TableColumn<Project>[] = [
    { key: "user_firstName", header: "First Name" },
    { key: "user_lastName", header: "Last Name" },
    { key: "user_email", header: "Email" },
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

      if (!response.ok) {
        throw new Error("Failed to add role");
      }

      // Fetch current org chart data
      const orgChartResponse = await fetch("/api/org-chart");
      if (!orgChartResponse.ok) {
        throw new Error("Failed to fetch org chart");
      }
      const orgChartData = await orgChartResponse.json();

      // Add new role to the first level
      const updatedLevels = [...orgChartData.levels];
      if (updatedLevels.length > 0) {
        updatedLevels[0].roles.push(roleName);
      } else {
        updatedLevels.push({ id: "level-1", roles: [roleName] });
      }

      // Save updated org chart data to the database
      const saveOrgChartResponse = await fetch("/api/org-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levels: updatedLevels,
          availableRoles: orgChartData.availableRoles,
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

  useEffect(() => {
    fetchUsers();
    fetchRoles(); // Fetch roles when the component mounts
  }, [user]);

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
        <OrgChartModal
          onClose={() => setOrgChartModalOpen(false)}
          roles={roles}
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
      {/* Card view for mobile only */}
      <div className="flex flex-col gap-4 md:hidden">
        {[...users]
          .sort((a, b) => {
            if (a.role === "admin" && b.role !== "admin") return -1;
            if (a.role !== "admin" && b.role === "admin") return 1;
            return 0;
          })
          .map((user) => (
            <div
              key={user._id}
              className={`bg-${theme === 'dark' ? 'gray-800' : 'white'} rounded-xl shadow-md p-4 flex flex-col space-y-2`}
            >
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-semibold">
                  First Name
                </span>
                <span className="text-lg font-bold text-gray-100">
                  {user.userId.firstName}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-semibold">
                  Last Name
                </span>
                <span className="text-lg font-bold text-gray-100">
                  {user.userId.lastName}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-semibold">
                  Email
                </span>
                <span className="text-base text-gray-200 break-all">
                  {user.userId.email}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-semibold">
                  Role
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === "admin"
                      ? "bg-red-600 text-white"
                      : user.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-600 text-white"
                  }`}
                >
                  {user.role}
                </span>
              </div>
              {/* Add more fields or actions as needed */}
            </div>
          ))}
      </div>
      {/* Table view for desktop only */}
      <div className={`bg-${theme === 'dark' ? 'gray-800' : 'white'} shadow-xl rounded-2xl overflow-x-auto hidden md:block`}>
        <Table<Project>
          title="Users List"
          data={[...users]
            .sort((a, b) => {
              if (a.role === "admin" && b.role !== "admin") return -1;
              if (a.role !== "admin" && b.role === "admin") return 1;
              return 0;
            })
            .map((user) => ({
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
