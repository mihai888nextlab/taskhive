import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "../../pages/_app"; // Adjust path
import { NextPageWithLayout } from "@/types";
import Loading from "@/components/Loading";

const DashboardOverviewPage: NextPageWithLayout = () => {
  const { user } = useAuth();

  if (!user) {
    return <Loading />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="container mx-auto p-4">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <table className="w-full text-left table-auto">
            <thead className="bg-gray-200 uppercase text-gray-700 text-sm leading-normal">
              <tr>
                <th className="py-3 px-6 text-left">Nume Client</th>
                <th className="py-3 px-6 text-left">Proiect</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-left">Deadline</th>
                <th className="py-3 px-6 text-right">Buget</th>
                <th className="py-3 px-6 text-center">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              <tr className="border-b border-gray-200 hover:bg-blue-50">
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  Alfa Solutions SRL
                </td>
                <td className="py-3 px-6 text-left">
                  Dezvoltare Aplicație Mobilă
                </td>
                <td className="py-3 px-6 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                    În Progres
                  </span>
                </td>
                <td className="py-3 px-6 text-left">2024-07-15</td>
                <td className="py-3 px-6 text-right font-medium">50.000 €</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center space-x-2">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg text-xs transition-colors duration-200">
                      Vizualizează
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg text-xs transition-colors duration-200">
                      Șterge
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-blue-50">
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  Beta Corp SA
                </td>
                <td className="py-3 px-6 text-left">Design UX/UI Site Nou</td>
                <td className="py-3 px-6 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Finalizat
                  </span>
                </td>
                <td className="py-3 px-6 text-left">2024-06-01</td>
                <td className="py-3 px-6 text-right font-medium">12.500 €</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center space-x-2">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg text-xs">
                      Vizualizează
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg text-xs">
                      Șterge
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-blue-50">
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  Gamma Tech
                </td>
                <td className="py-3 px-6 text-left">Optimizare SEO Campanie</td>
                <td className="py-3 px-6 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    În Așteptare
                  </span>
                </td>
                <td className="py-3 px-6 text-left">2024-08-30</td>
                <td className="py-3 px-6 text-right font-medium">8.000 €</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center space-x-2">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg text-xs">
                      Vizualizează
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg text-xs">
                      Șterge
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-blue-50">
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  Delta Services
                </td>
                <td className="py-3 px-6 text-left">Mentenanță Sistem CRM</td>
                <td className="py-3 px-6 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                    În Progres
                  </span>
                </td>
                <td className="py-3 px-6 text-left">2024-09-10</td>
                <td className="py-3 px-6 text-right font-medium">3.000 €</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center space-x-2">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg text-xs">
                      Vizualizează
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg text-xs">
                      Șterge
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-blue-50">
                {" "}
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  Epsilon Innovations
                </td>
                <td className="py-3 px-6 text-left">Consultanță IT</td>
                <td className="py-3 px-6 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                    Anulat
                  </span>
                </td>
                <td className="py-3 px-6 text-left">-</td>
                <td className="py-3 px-6 text-right font-medium">2.000 €</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center space-x-2">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg text-xs">
                      Vizualizează
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg text-xs">
                      Șterge
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Assign the layout to the page
DashboardOverviewPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardOverviewPage;
