import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/useUsers";

const SentInvitationsPanel = ({ theme, t }: { theme: string; t: any }) => {
  // Placeholder data for sent invitations
  const { invitations, loading } = useUsers();

  return (
    <div className="px-2 lg:px-4 pt-4 mt-4">
      <div className="max-w-[100vw] mx-auto">
        <Card
          className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border-t-0 border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} overflow-hidden mx-2`}
        >
          <div className="p-4">
            <h2
              className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
            >
              {t("sentInvitations")}
            </h2>
            <div className="mt-4">
              {!invitations || invitations.length === 0 ? (
                <div
                  className={`py-8 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                >
                  {t("noInvitations")}
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr
                      className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
                    >
                      <th
                        className={`py-2 px-4 text-left text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {t("email")}
                      </th>
                      <th
                        className={`py-2 px-4 text-left text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {t("role")}
                      </th>
                      <th
                        className={`py-2 px-4 text-left text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {t("status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((invitation) => (
                      <tr
                        key={invitation.id}
                        className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}
                      >
                        <td
                          className={`py-2 px-4 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {invitation.email}
                        </td>
                        <td
                          className={`py-2 px-4 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {invitation.role}
                        </td>
                        <td
                          className={`py-2 px-4 text-sm ${invitation.status === "Pending" ? "text-yellow-500" : "text-green-500"}`}
                        >
                          {invitation.status}
                        </td>
                        <td className="py-2 px-4">
                          {invitation.status === "Pending" && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className={`${theme === "dark" ? "border-blue-500 text-blue-500 hover:bg-blue-500/10" : "border-blue-600 text-blue-600 hover:bg-blue-600/10"}`}
                              >
                                {t("resend")}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className={`${theme === "dark" ? "border-red-500 text-red-500 hover:bg-red-500/10" : "border-red-600 text-red-600 hover:bg-red-600/10"}`}
                              >
                                {t("cancel")}
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SentInvitationsPanel;
