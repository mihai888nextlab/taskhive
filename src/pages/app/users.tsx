import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "../../pages/_app"; // Adjust path
import { NextPageWithLayout, TableColumn, TableDataItem } from "@/types";
import Loading from "@/components/Loading";
import Table from "@/components/Table";

interface Project extends TableDataItem {
  id: string;
  clientName: string;
  projectName: string;
  status: "In Progres" | "Finalizat" | "In Asteptare" | "Anulat";
  deadline: string;
  budget: number;
}

const DashboardOverviewPage: NextPageWithLayout = () => {
  const { user } = useAuth();

  const projects: Project[] = [
    {
      id: "1",
      clientName: "Alfa Solutions SRL",
      projectName: "Dezvoltare Aplicatie Mobila",
      status: "In Progres",
      deadline: "2024-07-15",
      budget: 50000,
    },
    {
      id: "2",
      clientName: "Beta Corp SA",
      projectName: "Design UX/UI Site Nou",
      status: "Finalizat",
      deadline: "2024-06-01",
      budget: 12500,
    },
    {
      id: "3",
      clientName: "Gamma Tech",
      projectName: "Optimizare SEO Campanie",
      status: "In Asteptare",
      deadline: "2024-08-30",
      budget: 8000,
    },
    {
      id: "4",
      clientName: "Delta Services",
      projectName: "Mentenanta Sistem CRM",
      status: "In Progres",
      deadline: "2024-09-10",
      budget: 3000,
    },
    {
      id: "5",
      clientName: "Epsilon Innovations",
      projectName: "Consultanta IT",
      status: "Anulat",
      deadline: "-",
      budget: 2000,
    },
  ];

  const projectColumns: TableColumn<Project>[] = [
    { key: "clientName", header: "Nume Client" },
    { key: "projectName", header: "Proiect" },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (item: any) => {
        // Logica pentru a afișa badge-uri colorate în funcție de status
        let badgeClasses = "";
        let textColor = "";
        switch (item.status) {
          case "In Progres":
            badgeClasses = "bg-yellow-100";
            textColor = "text-yellow-800";
            break;
          case "Finalizat":
            badgeClasses = "bg-green-100";
            textColor = "text-green-800";
            break;
          case "In Asteptare":
            badgeClasses = "bg-blue-100";
            textColor = "text-blue-800";
            break;
          case "Anulat":
            badgeClasses = "bg-red-100";
            textColor = "text-red-800";
            break;
          default:
            badgeClasses = "bg-gray-100";
            textColor = "text-gray-800";
        }
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClasses} ${textColor}`}
          >
            {item.status}
          </span>
        );
      },
    },
    { key: "deadline", header: "Deadline" },
    {
      key: "budget",
      header: "Buget",
      align: "right",
      render: (item) => `${item.budget.toLocaleString()} €`, // Formatează bugetul
    },
  ];

  if (!user) {
    return <Loading />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="container mx-auto p-4">
        <Table<Project> // Specificăm tipul generic aici
          title="Lista Proiectelor"
          data={projects}
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
