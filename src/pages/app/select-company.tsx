import HeaderNavBar from "@/components/header/HeaderNavBar";
import { FaBuilding } from "react-icons/fa";
import AddCompanyModal from "@/components/modals/AddCompanyModal";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeContext";
import { FaMoon, FaSun } from "react-icons/fa";

const SelectCompanyPage = () => {
  const { user, refetchUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations("SelectCompany");
  const router = useRouter();
  const [invitations, setInvitations] = useState<
    { _id: string; token: string }[]
  >([]);
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);

  const handleSelectCompany = async (companyId: string) => {
    // TODO: Add your logic to set the active company in context or backend
    const res = await fetch("/api/auth/change-company", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ companyId }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Failed to change company:", errorData);
      return;
    }

    router.push("/app/");
    router.reload();
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    const res = await fetch("/api/invitations/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inviteId: invitationId }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Failed to accept invitation:", errorData);
      return;
    }

    const fetchInvitations = async () => {
      try {
        const res = await fetch(`/api/invitations/fetchInvitations`);
        const data = await res.json();
        if (Array.isArray(data.invitations)) {
          setInvitations(data.invitations);
        }
      } catch {
        setInvitations([]);
      }
    };
    fetchInvitations();
    refetchUser();
  };

  useEffect(() => {
    if (user?._id) return;
    const fetchInvitations = async () => {
      try {
        const res = await fetch(`/api/invitations/fetchInvitations`);
        const data = await res.json();
        if (Array.isArray(data.invitations)) {
          setInvitations(data.invitations);
        }
      } catch {
        setInvitations([]);
      }
    };
    fetchInvitations();
  }, [user?._id]);

  return (
    <div className={`flex w-full min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header NavBar */}
      <HeaderNavBar t={t} />
      <div className={`flex items-center justify-center min-h-screen w-full ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className={`flex flex-col w-full max-w-[1800px] rounded-2xl border shadow-lg overflow-hidden mx-4
          ${theme === 'dark' ? 'bg-[#23272f] border-gray-700' : 'bg-white border-gray-200'}`}
        >
          {/* Container Header with Better Company Icon */}
          <div className={`flex items-center gap-4 w-full px-8 py-6 border-b ${theme === 'dark' ? 'bg-blue-50/5 border-blue-800' : 'bg-blue-50 border-blue-200'}`}
            style={theme === 'dark' ? { opacity: 0.97 } : undefined}
          >
            {/* FA Building Icon for Company */}
            <div className={`p-3 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-blue-700' : 'bg-blue-200'}`} style={{ minWidth: 44, minHeight: 44 }}>
              <FaBuilding className={`w-8 h-8 ${theme === 'dark' ? 'text-white' : 'text-blue-700'}`} />
            </div>
            <div className="flex-1">
              <h1 className={`text-2xl font-bold mb-1 text-left ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {user?.companies?.length
                  ? t("selectCompany")
                  : t("noCompanies")}
              </h1>
              <p className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {user?.companies?.length
                  ? t("chooseCompany")
                  : t("createOrCheckInvitations")}
              </p>
            </div>
            {/* Add Company + Button */}
            <button
              type="button"
              className={`ml-auto flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 w-12 h-12 aspect-square focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800' : ''}`}
              title={t("addCompany", { default: "Add Company" })}
              onClick={() => setAddCompanyOpen(true)}
              style={{ minWidth: '3rem', minHeight: '3rem', width: '3rem', height: '3rem' }}
            >
              <span className="text-2xl font-bold">+</span>
            </button>
          </div>
          {/* Cards Grid - improved layout to remove excess right space */}
          <div className="flex flex-wrap gap-x-8 gap-y-6 justify-center w-full px-4 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100"
            style={{ minHeight: 0, maxHeight: '80vh' }}
          >
            {user?.companies?.map((company) => (
              <button
                key={company.id}
                type="button"
                className={`rounded-2xl border shadow-sm transition-all duration-200 flex flex-col w-[300px] h-[200px] max-w-none overflow-hidden group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent
                  ${theme === 'dark' ? 'bg-[#23272f] border-gray-700 hover:border-blue-600' : 'bg-white border-gray-200 hover:border-blue-400'}`}
                style={{ minWidth: 260 }}
                onClick={() => handleSelectCompany(company.id)}
              >
                {/* Card Header: Company Name (no icon) */}
                <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'bg-blue-900 border-blue-800' : 'bg-blue-50 border-blue-200'}`}
                  style={theme === 'dark' ? { opacity: 0.95 } : undefined}
                >
                  <h2
                    className={`text-lg font-bold truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                    title={company.name}
                    style={{ textAlign: 'left', flexGrow: 1 }}
                  >
                    {company.name}
                  </h2>
                </div>
                {/* Card Content: Role */}
                <div className={`flex-1 flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-[#1e2530]' : 'bg-white'}`}>
                  <span className={`text-base font-medium text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '1.25rem', fontWeight: 600 }}
                    title={company.role || t("member")}
                  >
                    {company.role || t("member")}
                  </span>
                </div>
                {/* Card Footer: Select Button */}
                <div className="px-6 pb-4">
                  <span
                    className={`w-full block px-7 py-2 rounded-xl font-semibold shadow transition text-base text-center
                      ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}`}
                    style={{ pointerEvents: 'none', opacity: 0.95 }}
                  >
                    {t("select")}
                  </span>
                </div>
              </button>
            ))}
          </div>
          {/* Example: Display invitations */}
          {invitations.length > 0 && (
            <div className="mt-10 w-full max-w-2xl mx-auto">
              <h2 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("pendingInvitations")}</h2>
              <ul className="space-y-3">
                {invitations.map((inv: any) => (
                  <li
                    key={inv._id}
                    className={`rounded-xl p-4 flex flex-col items-start shadow border transition-all duration-200 ${theme === 'dark' ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'}`}
                  >
                    <span className="font-medium truncate w-full" title={inv.companyId?.name || 'Unknown Company'}>
                      {inv.companyId?.name || "Unknown Company"}
                    </span>
                    <span className={`text-xs mb-2 ${theme === 'dark' ? 'text-yellow-200' : 'text-gray-500'}`}
                      style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      title={inv.status}
                    >
                      {t("status")}: {inv.status}
                    </span>
                    <button
                      className={`px-5 py-1.5 rounded-lg transition text-sm font-semibold mt-1 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-transparent
                        ${theme === 'dark' ? 'bg-green-700 text-white hover:bg-green-800' : 'bg-green-600 text-white hover:bg-green-700'}`}
                      onClick={() => handleAcceptInvitation(inv.token)}
                    >
                      {t("accept")}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* AddCompanyModal */}
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
