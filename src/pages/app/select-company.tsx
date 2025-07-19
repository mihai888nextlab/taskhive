import HeaderNavBar from "@/components/header/HeaderNavBar";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeContext";

const SelectCompanyPage = () => {
  const { user, refetchUser } = useAuth();
  const { theme } = useTheme();
  const t = useTranslations("Navigation");
  const router = useRouter();
  const [invitations, setInvitations] = useState<
    { _id: string; token: string }[]
  >([]);

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
        <div className={`flex flex-col items-center text-center p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h1 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : ''}`}>
            {user?.companies?.length
              ? "Select your company"
              : "You haven't joined any companies yet"}
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            {user?.companies?.length
              ? "Choose a company to continue"
              : "Create a company or check your email for invitations"}
          </p>
          <div className="flex flex-wrap gap-8 justify-center w-full">
            {user?.companies?.map((company) => (
              <div
                key={company.id}
                className={`border rounded-2xl shadow-lg p-7 flex flex-col items-center w-72 min-w-[260px] max-w-xs bg-opacity-95 transition-all duration-200 hover:scale-[1.03] hover:shadow-xl group ${theme === 'dark' ? 'bg-gray-900 border-gray-700 hover:border-blue-700' : 'bg-white border-gray-200 hover:border-blue-400'}`}
                style={{ minHeight: 210 }}
              >
                <div className={`font-semibold text-lg mb-2 w-full truncate text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                  title={company.name}
                >
                  {company.name}
                </div>
                <div className={`text-xs mb-4 w-full text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
                  style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  title={company.role || 'Member'}
                >
                  {company.role || "Member"}
                </div>
                <button
                  className={`px-7 py-2 rounded-xl font-semibold shadow transition text-base w-full mt-auto focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent
                    ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-800 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  onClick={() => handleSelectCompany(company.id)}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
          {/* Example: Display invitations */}
          {invitations.length > 0 && (
            <div className="mt-10 w-full max-w-2xl mx-auto">
              <h2 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Pending Invitations</h2>
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
                      Status: {inv.status}
                    </span>
                    <button
                      className={`px-5 py-1.5 rounded-lg transition text-sm font-semibold mt-1 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-transparent
                        ${theme === 'dark' ? 'bg-green-700 text-white hover:bg-green-800' : 'bg-green-600 text-white hover:bg-green-700'}`}
                      onClick={() => handleAcceptInvitation(inv.token)}
                    >
                      Accept
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

SelectCompanyPage.getLayout = (page: React.ReactElement) => {
  return page;
};

export default SelectCompanyPage;
