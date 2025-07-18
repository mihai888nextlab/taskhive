import HeaderNavBar from "@/components/header/HeaderNavBar";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const SelectCompanyPage = () => {
  const { user, refetchUser } = useAuth();
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
    <div className="flex w-full min-h-screen bg-gray-100">
      {/* Header NavBar */}
      <HeaderNavBar t={t} />
      <div className="flex items-center justify-center min-h-screen w-full bg-gray-100">
        <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">
            {user?.companies?.length
              ? "Select your company"
              : "You haven't joined any companies yet"}
          </h1>
          <p className="text-gray-600 mb-6">
            {user?.companies?.length
              ? "Choose a company to continue"
              : "Create a company or check your email for invitations"}
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            {user?.companies?.map((company) => (
              <div
                key={company.id}
                className="bg-gray-50 border border-gray-200 rounded-lg shadow p-6 flex flex-col items-center w-64"
              >
                <div className="font-semibold text-lg mb-2">{company.name}</div>
                <div className="text-gray-500 text-sm mb-4">
                  {company.role || "Member"}
                </div>
                <button
                  className="bg-primary text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-primary-dark transition"
                  onClick={() => handleSelectCompany(company.id)}
                >
                  Select
                </button>
              </div>
            ))}
          </div>
          {/* Example: Display invitations */}
          {invitations.length > 0 && (
            <div className="mt-8 w-full">
              <h2 className="text-lg font-semibold mb-2">
                Pending Invitations
              </h2>
              <ul className="space-y-2">
                {invitations.map((inv: any) => (
                  <li
                    key={inv._id}
                    className="bg-yellow-50 border border-yellow-200 rounded p-3 flex flex-col items-start"
                  >
                    <span className="font-medium">
                      {inv.companyId?.name || "Unknown Company"}
                    </span>
                    <span className="text-xs text-gray-500 mb-2">
                      Status: {inv.status}
                    </span>
                    <button
                      className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition text-sm font-semibold"
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
