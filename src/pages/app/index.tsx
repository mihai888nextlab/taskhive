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
      <h1>Dashboard Overview</h1>
      <p>Welcome back, {user.firstName || user.email}!</p>
      <p>This is your main dashboard content.</p>
    </div>
  );
};

// Assign the layout to the page
DashboardOverviewPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default DashboardOverviewPage;
