import React from "react";
import { FaUserClock } from "react-icons/fa";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface DashboardUsersPreviewProps {
  loadingUsers: boolean;
  filteredTableUsers: any[];
  theme: string;
  t: any;
}

const DashboardUsersPreview: React.FC<DashboardUsersPreviewProps> = ({
  loadingUsers,
  filteredTableUsers,
  theme,
  t,
}) => {
  return (
    <div className="flex flex-col h-full">
      {loadingUsers ? (
        <p className="text-gray-600">
          {t("loadingUsers", { default: "Loading users..." })}
        </p>
      ) : filteredTableUsers.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("firstName", { default: "First Name" })}</TableHead>
              <TableHead>{t("lastName", { default: "Last Name" })}</TableHead>
              <TableHead>{t("email", { default: "Email" })}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTableUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.firstName}</TableCell>
                <TableCell>{user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-16">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <FaUserClock className="text-2xl text-gray-400" />
          </div>
          <h3
            className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
          >
            {t("noTeamMembersYet", { default: "No team members yet" })}
          </h3>
          <p
            className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
          >
            {t("startByAddingFirstMember", {
              default: "Start by adding your first team member",
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(DashboardUsersPreview);
