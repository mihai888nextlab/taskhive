import HeaderNavBar from "@/components/header/HeaderNavBar";
import { FaBuilding } from "react-icons/fa";
import AddCompanyModal from "@/components/modals/AddCompanyModal";
import { useSelectCompany } from "@/hooks/useSelectCompany";
import { useAuth } from "@/hooks/useAuth";

const SelectCompanyPage = () => {
  const { loadingUser } = useAuth();
  const {
    user,
    theme,
    t,
    invitations,
    addCompanyOpen,
    setAddCompanyOpen,
    handleSelectCompany,
    handleAcceptInvitation,
    refetchUser,
  } = useSelectCompany();

  return (
    <div
      className={`flex w-full min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}
    >
      {loadingUser && (
        <div className="inset-0 fixed flex flex-col items-center justify-center bg-white z-[9999]">
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <svg
              className="animate-spin w-12 h-12 text-blue-500 mb-4"
              viewBox="0 0 50 50"
            >
              <circle
                className="opacity-20"
                cx="25"
                cy="25"
                r="20"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
              />
              <path
                d="M25 5a20 20 0 0 1 20 20"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <p className="text-center text-lg font-semibold opacity-90 animate-pulse mt-2">
              Loading your dashboard...
            </p>
          </div>
          <style jsx>{`
            .animate-spin {
              animation: spin 1s linear infinite;
            }
            .animate-fade-in {
              animation: fadeIn 0.7s cubic-bezier(0.4, 0, 0.2, 1);
            }
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: none;
              }
            }
          `}</style>
        </div>
      )}
      <div className="hidden sm:block">
        <HeaderNavBar t={t} />
      </div>
      <div
        className={`flex items-center justify-center min-h-screen w-full ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}
      >
        <div
          className={`flex flex-col w-full max-w-[1300px] rounded-2xl border shadow-lg overflow-hidden mx-2 sm:mx-4 ${theme === "dark" ? "bg-[#23272f] border-gray-700" : "bg-white border-gray-200"}`}
        >
          <div
            className={`flex flex-col sm:flex-row items-center gap-4 w-full px-4 sm:px-8 py-4 sm:py-6 border-b ${theme === "dark" ? "bg-blue-50/5 border-blue-800" : "bg-blue-50 border-blue-200"}`}
            style={theme === "dark" ? { opacity: 0.97 } : undefined}
          >
            <div
              className={`p-3 rounded-xl flex items-center justify-center mb-2 sm:mb-0 ${theme === "dark" ? "bg-blue-700" : "bg-blue-200"}`}
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <FaBuilding
                className={`w-8 h-8 ${theme === "dark" ? "text-white" : "text-blue-700"}`}
              />
            </div>
            <div className="flex-1 w-full text-center sm:text-left">
              <h1
                className={`text-xl sm:text-2xl font-bold mb-1 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                {user?.companies?.length
                  ? t("selectCompany")
                  : t("noCompanies")}
              </h1>
              <p
                className={`text-sm sm:text-base ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}
              >
                {user?.companies?.length
                  ? t("chooseCompany")
                  : t("createOrCheckInvitations")}
              </p>
            </div>
            <button
              type="button"
              className={`ml-auto flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 w-10 h-10 sm:w-12 sm:h-12 aspect-square focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent ${theme === "dark" ? "bg-blue-700 hover:bg-blue-800" : ""}`}
              title={t("addCompany", { default: "Add Company" })}
              onClick={() => setAddCompanyOpen(true)}
              style={{
                minWidth: "2.5rem",
                minHeight: "2.5rem",
                width: "2.5rem",
                height: "2.5rem",
              }}
            >
              <span className="text-xl sm:text-2xl font-bold">+</span>
            </button>
          </div>
          {user?.companies?.length ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 justify-center w-full px-2 sm:px-4 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100"
              style={{ minHeight: 0, maxHeight: "80vh" }}
            >
              {user?.companies?.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  className={`rounded-2xl border shadow-sm transition-all duration-200 flex flex-col w-full sm:w-[300px] h-[180px] sm:h-[200px] max-w-none overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent ${theme === "dark" ? "bg-[#23272f] border-gray-700 hover:border-blue-600" : "bg-white border-gray-200 hover:border-blue-400"}`}
                  style={{ minWidth: 0 }}
                  onClick={() => handleSelectCompany(company.id)}
                >
                  <div
                    className={`px-4 sm:px-6 py-3 sm:py-4 border-b ${theme === "dark" ? "bg-blue-900 border-blue-800" : "bg-blue-50 border-blue-200"}`}
                    style={theme === "dark" ? { opacity: 0.95 } : undefined}
                  >
                    <h2
                      className={`text-base sm:text-lg font-bold truncate ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                      title={company.name}
                      style={{ textAlign: "left", flexGrow: 1 }}
                    >
                      {company.name}
                    </h2>
                  </div>
                  <div
                    className={`flex-1 flex flex-col items-center justify-center ${theme === "dark" ? "bg-[#1e2530]" : "bg-white"}`}
                  >
                    <span
                      className={`text-sm sm:text-base font-medium text-center ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: 600,
                      }}
                      title={company.role || t("member")}
                    >
                      {company.role || t("member")}
                    </span>
                  </div>
                  <div className="px-4 sm:px-6 pb-3 sm:pb-4">
                    <span
                      className={`w-full block px-5 sm:px-7 py-2 rounded-xl font-semibold shadow transition text-sm sm:text-base text-center ${theme === "dark" ? "bg-blue-600 text-white" : "bg-blue-600 text-white"}`}
                      style={{ pointerEvents: "none", opacity: 0.95 }}
                    >
                      {t("select")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <></>
          )}
          {invitations.length > 0 && (
            <div className="mt-8 sm:mt-10 w-full max-w-2xl mx-auto px-2 sm:px-0">
              <h2
                className={`text-base sm:text-lg font-semibold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                {t("pendingInvitations")}
              </h2>
              <ul className="space-y-3">
                {invitations.map((inv: any) => (
                  <li
                    key={inv._id}
                    className={`rounded-xl p-3 sm:p-4 flex flex-col items-start shadow border transition-all duration-200 ${theme === "dark" ? "bg-yellow-900 border-yellow-700" : "bg-yellow-50 border-yellow-200"}`}
                  >
                    <span
                      className="font-medium truncate w-full"
                      title={inv.companyId?.name || "Unknown Company"}
                    >
                      {inv.companyId?.name || "Unknown Company"}
                    </span>
                    <span
                      className={`text-xs mb-2 ${theme === "dark" ? "text-yellow-200" : "text-gray-500"}`}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={inv.status}
                    >
                      {t("status")}: {inv.status}
                    </span>
                    <button
                      className={`px-4 sm:px-5 py-1.5 rounded-lg transition text-xs sm:text-sm font-semibold mt-1 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-transparent ${theme === "dark" ? "bg-green-700 text-white hover:bg-green-800" : "bg-green-600 text-white hover:bg-green-700"}`}
                      onClick={() => handleAcceptInvitation(inv.token)}
                    >
                      {t("accept")}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <AddCompanyModal
            open={addCompanyOpen}
            onClose={() => setAddCompanyOpen(false)}
            userId={user?._id || ""}
            onCompanyAdded={refetchUser}
          />
        </div>
      </div>
    </div>
  );
};

SelectCompanyPage.getLayout = (page: React.ReactElement) => {
  return page;
};

export default SelectCompanyPage;
