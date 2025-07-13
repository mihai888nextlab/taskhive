import HeaderNavBar from "@/components/header/HeaderNavBar";
import { useTranslations } from "next-intl";

const CreateCompanyPage = () => {
  const t = useTranslations("Navigation");

  return (
    <div className="flex w-full min-h-screen bg-gray-100">
      {/* Header NavBar */}
      <HeaderNavBar t={t} />
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">
            You haven't joined any companies yet
          </h1>
          <p className="text-gray-600 mb-6">
            Create a company or check your email for invitations
          </p>
        </div>
      </div>
    </div>
  );
};

// CreateCompanyPage.getLayout = (page: React.ReactElement) => {
//   page;
// };

export default CreateCompanyPage;
