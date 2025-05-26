import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "../../pages/_app"; // Adjust path
import { NextPageWithLayout, TableColumn, TableDataItem } from "@/types";
import Loading from "@/components/Loading";
import Table from "@/components/Table";
import { useEffect, useState } from "react";
import AddUsersModal from "@/components/modals/AddUserModal";
import { setServers } from "dns";

interface Project extends TableDataItem {
  user_id: string;
  user_email: string;
  user_firstName: string;
  user_lastName: string;
  companyId: string;
  role: "string";
  permissions: string[];
}

const DashboardOverviewPage: NextPageWithLayout = () => {
  const { user } = useAuth();

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
      role: "string";
      permissions: string[];
    }[]
  >([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [addUserModalOpen, setAddUserModalOpen] = useState(false);

  const projectColumns: TableColumn<Project>[] = [
    { key: "user_firstName", header: "First Name" },
    { key: "user_lastName", header: "Last Name" },
    { key: "user_email", header: "Email" },
    {
      key: "role",
      header: "Role",
      render: (item: any) => {
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
    // {
    //   key: "status",
    //   header: "Status",
    //   align: "center",
    //   render: (item: any) => {
    //     // Logica pentru a afișa badge-uri colorate în funcție de status
    //     let badgeClasses = "";
    //     let textColor = "";
    //     switch (item.status) {
    //       case "In Progres":
    //         badgeClasses = "bg-yellow-100";
    //         textColor = "text-yellow-800";
    //         break;
    //       case "Finalizat":
    //         badgeClasses = "bg-green-100";
    //         textColor = "text-green-800";
    //         break;
    //       case "In Asteptare":
    //         badgeClasses = "bg-blue-100";
    //         textColor = "text-blue-800";
    //         break;
    //       case "Anulat":
    //         badgeClasses = "bg-red-100";
    //         textColor = "text-red-800";
    //         break;
    //       default:
    //         badgeClasses = "bg-gray-100";
    //         textColor = "text-gray-800";
    //     }
    //     return (
    //       <span
    //         className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClasses} ${textColor}`}
    //       >
    //         {item.status}
    //       </span>
    //     );
    //   },
    // },
  ];

  if (!user) {
    return <Loading />;
  }

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

  const addUser = async (
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    role: string
  ): Promise<string | undefined> => {
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
      //setError("Failed to add user");
      return "Failed to add user";
    }

    const data = await response.json();

    setLoadingUsers(true); // Set loading state to true while fetching users
    fetchUsers(); // Refresh the user list after adding a new user
    setAddUserModalOpen(false); // Close the modal after adding the user
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  return (
    <div>
      {loadingUsers && <Loading />}
      {addUserModalOpen && (
        <AddUsersModal
          onClose={() => setAddUserModalOpen(false)}
          onUserAdded={(
            email: string,
            firstName: string,
            lastName: string,
            password: string,
            role: string
          ) => {
            return addUser(email, firstName, lastName, password, role);
          }}
        />
      )}

      <h1 className="text-2xl font-bold">Users</h1>

      <button
        className="bg-blue-500 rounded-xl p-3 text-white font-semibold cursor-pointer"
        onClick={() => setAddUserModalOpen(true)}
      >
        Add User
      </button>

      <div className="container mx-auto p-4">
        <Table<Project> // Specificăm tipul generic aici
          title="Users List"
          data={users.map((user) => ({
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
          emptyMessage="Nu ai niciun proiect înregistrat. Începe unul nou!"
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
