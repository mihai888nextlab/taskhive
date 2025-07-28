import React from "react";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import UsersHeader from "@/components/users/UsersHeader";
import UsersControls from "@/components/users/UsersControls";
import UsersListPanel from "@/components/users/UsersListPanel";
import SentInvitationsPanel from "@/components/users/SentInvitationsPanel";
import { Card } from "@/components/ui/card";
import { createPortal } from "react-dom";
import AddUserModal from "@/components/modals/AddUserModal";
import AddRoleModal from "@/components/modals/AddRoleModal";
import OrgChartModal from "@/components/modals/OrgChartModal";
import UserProfileModal from "@/components/modals/UserProfileModal";
import { useUsers } from "@/hooks/useUsers";

const UsersPage: NextPageWithLayout = () => {
  const {
    theme,
    user,
    users,
    loading,
    addUserModalOpen,
    setAddUserModalOpen,
    addRoleModalOpen,
    setAddRoleModalOpen,
    orgChartModalOpen,
    setOrgChartModalOpen,
    profileModalOpen,
    setProfileModalOpen,
    selectedUser,
    roles,
    search,
    setSearch,
    filterRole,
    setFilterRole,
    sortBy,
    setSortBy,
    handleUserClick,
    addUser,
    addRole,
    filteredUsers,
    handleOpenAddUserModal,
    handleOpenAddRoleModal,
    handleOpenOrgChartModal,
    t,
  } = useUsers();

  // Placeholder export handlers
  const handleExportPDF = () => {
    // Export users (name, email, role) to PDF with theme matching tasks PDF export
    Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]).then(([jsPDFModule, autoTableModule]) => {
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
      const autoTable = autoTableModule.default || autoTableModule;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      // Header (dark blue, visually consistent)
      doc.setFillColor(17, 24, 39);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text("Users Report", 14, 20);
      doc.setFontSize(12);
      doc.setTextColor(34, 34, 34);
      // Table columns and rows
      const columns = [
        { header: "Name", dataKey: "name" },
        { header: "Email", dataKey: "email" },
        { header: "Role", dataKey: "role" },
      ];
      const rows = users.map(u => ({
        name: `${u.userId.firstName} ${u.userId.lastName}`,
        email: u.userId.email,
        role: u.role
      }));
      // Adjusted column widths to fit all data
      const colWidths = {
        name: 60,
        email: 70,
        role: 40,
      };
      const totalWidth = Object.values(colWidths).reduce((a, b) => a + b, 0);
      // Center the table horizontally
      const margin = (210 - totalWidth) / 2;
      autoTable(doc, {
        startY: 38,
        columns,
        body: rows,
        headStyles: {
          fillColor: [17, 24, 39],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 11,
          halign: 'left',
          valign: 'middle',
          cellPadding: 2.5,
        },
        bodyStyles: {
          fontSize: 10,
          textColor: 34,
          cellPadding: 2,
          halign: 'left',
          valign: 'top',
          lineColor: [220, 220, 220],
          minCellHeight: 7,
          overflow: 'linebreak',
          font: 'helvetica',
        },
        alternateRowStyles: {
          fillColor: [241, 245, 249],
          textColor: 34,
        },
        columnStyles: {
          name: { cellWidth: colWidths.name },
          email: { cellWidth: colWidths.email },
          role: { cellWidth: colWidths.role },
        },
        margin: { left: margin, right: margin },
        styles: {
          font: 'helvetica',
          fontSize: 10,
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'left',
          valign: 'top',
          minCellHeight: 7,
          textColor: 34,
        },
        didDrawPage: (data) => {
          const pageCount = doc.getNumberOfPages();
          const pageNumber = doc.getCurrentPageInfo().pageNumber;
          doc.setFontSize(9);
          doc.setTextColor(150);
          doc.text(`Page ${pageNumber} of ${pageCount}`,
            200, 290, { align: 'right' });
        },
      });
      doc.save("users.pdf");
    }).catch(() => {
      alert("PDF export failed. Please try again.");
    });
  };

  const handleExportCSV = () => {
    // Export users (name, email, role) to CSV
    const columns = ["Name", "Email", "Role"];
    const rows = users.map(u => [
      `${u.userId.firstName} ${u.userId.lastName}`,
      u.userId.email,
      u.role
    ]);
    let csvContent = columns.join(",") + "\n";
    csvContent += rows.map(r => r.map(field => `"${field}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`relative min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} pt-10`}
    >
      <div className="px-2 lg:px-4 pt-4 mt-4">
        <div className="max-w-[100vw] mx-auto">
          <Card
            className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border-t-0 border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} overflow-hidden mx-2`}
          >
            <UsersHeader
              theme={theme}
              t={t}
              user={user}
              onExportClick={(e) => {
                const dropdown = e.currentTarget.parentElement?.querySelector(
                  ".export-dropdown-menu"
                ) as HTMLElement;
                if (dropdown) dropdown.classList.toggle("hidden");
              }}
              onExportPDF={handleExportPDF}
              onExportCSV={handleExportCSV}
              onAddUser={handleOpenAddUserModal}
              onAddRole={handleOpenAddRoleModal}
              onOrgChart={handleOpenOrgChartModal}
            />
            <UsersControls
              users={users}
              loading={loading}
              onUserClick={handleUserClick}
              theme={theme}
              currentUser={user}
              search={search}
              onSearchChange={setSearch}
              filterRole={filterRole}
              onFilterRoleChange={setFilterRole}
              sortBy={sortBy as any}
              onSortByChange={setSortBy}
            />
            <UsersListPanel
              users={users}
              loading={loading}
              onUserClick={handleUserClick}
              theme={theme}
              currentUser={user}
              search={search}
              filterRole={filterRole}
              sortBy={sortBy as any}
            />
          </Card>
        </div>
      </div>
      <SentInvitationsPanel theme={theme} t={t} />
      {/* Modals */}
      {addUserModalOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <AddUserModal
            onClose={() => setAddUserModalOpen(false)}
            onUserAdded={addUser}
          />,
          document.body
        )}
      {addRoleModalOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <AddRoleModal
            onClose={() => setAddRoleModalOpen(false)}
            onRoleAdded={addRole}
          />,
          document.body
        )}
      {orgChartModalOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <OrgChartModal onClose={() => setOrgChartModalOpen(false)} />,
          document.body
        )}
      {profileModalOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <UserProfileModal
            open={profileModalOpen}
            onClose={() => setProfileModalOpen(false)}
            user={selectedUser}
          />,
          document.body
        )}
    </div>
  );
};

UsersPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default UsersPage;
