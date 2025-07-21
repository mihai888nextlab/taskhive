import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { FaPlus, FaDownload, FaBullhorn, FaThumbtack, FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTheme } from '@/components/ThemeContext';
import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import AnnouncementList from "@/components/announcements/AnnouncementList";
import AnnouncementDetailsModal from "@/components/announcements/AnnouncementDetailsModal";
import { createPortal } from 'react-dom';
import { saveAs } from "file-saver";
import { useTranslations } from "next-intl";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: { firstName: string; lastName: string; email: string };
  category: string;
  pinned: boolean;
  expiresAt?: string;
  eventDate?: string;
}

const AnnouncementsPage: NextPageWithLayout = React.memo(() => {
  const { theme } = useTheme();
  const t = useTranslations("AnnouncementsPage");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Update");
  const [pinned, setPinned] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [expiresAt, setExpiresAt] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'pinned'>('all');
  const [eventDate, setEventDate] = useState("");

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const categories = ["All", "Update", "Event", "Alert"];

  useEffect(() => {
    fetch("/api/announcements")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then(setAnnouncements)
      .catch(err => {
        setFormError("Failed to load announcements: " + err.message);
      })
      .finally(() => setLoading(false));
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data.user);
      });
  }, []);

  // Memoize isAdmin
  const isAdmin = useMemo(() => currentUser?.role === "admin", [currentUser]);

  // Memoize pin toggle handler
  const handlePinToggle = useCallback(async (id: string, pinned: boolean) => {
    setLoading(true);
    try {
      await fetch(`/api/announcements/${id}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned }),
      });
      setAnnouncements(anns =>
        anns.map(a => a._id === id ? { ...a, pinned } : a)
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize comment handler
  const handleComment = useCallback((id: string, comment: string) => {
    // Optionally send to backend
  }, []);

  // Memoize export handler
  const handleExportCSV = useCallback(() => {
    if (!announcements || announcements.length === 0) {
      alert("No announcements to export.");
      return;
    }
    const rows = [
      ["Title", "Content", "Category", "Pinned", "Created At", "Created By"],
      ...announcements
        .filter(a => a.category !== "All")
        .map(a => [
          a.title,
          (a.content || "").replace(/\n/g, " "),
          a.category,
          a.pinned ? "Yes" : "No",
          new Date(a.createdAt).toLocaleString(),
          a.createdBy
            ? `${a.createdBy.firstName} ${a.createdBy.lastName} (${a.createdBy.email})`
            : "",
        ])
    ];
    const csv = rows.map(r => r.map(f => `"${String(f).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, "announcements.csv");
  }, [announcements]);

  // PDF Export Handler
  const handleExportPDF = useCallback(() => {
    if (!announcements || announcements.length === 0) {
      alert("No announcements to export.");
      return;
    }
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    // Header (dark blue, like expense list)
    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text("Announcements Report", 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(34, 34, 34);

    // Table columns with custom widths for better content fit
    const columns = [
      { header: "Title", dataKey: "title" },
      { header: "Content", dataKey: "content" },
      { header: "Category", dataKey: "category" },
      { header: "Pinned", dataKey: "pinned" },
      { header: "Created At", dataKey: "createdAt" },
      { header: "Created By", dataKey: "createdBy" },
    ];

    // Prepare rows, preserving line breaks for content
    const rows = announcements
      .filter(a => a.category !== "All")
      .map(a => ({
        title: a.title,
        content: (a.content || "").replace(/\r\n|\r|\n/g, "\n"), // preserve line breaks
        category: a.category,
        pinned: a.pinned ? "Yes" : "No",
        createdAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "",
        createdBy: a.createdBy ? `${a.createdBy.firstName} ${a.createdBy.lastName} (${a.createdBy.email})` : "",
      }));

    autoTable(doc, {
      startY: 38,
      columns,
      body: rows,
      headStyles: {
        fillColor: [17, 24, 39],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 12,
        halign: 'left',
        valign: 'middle',
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: 11,
        textColor: 34,
        cellPadding: 2.5,
        halign: 'left',
        valign: 'top',
        lineColor: [220, 220, 220],
        minCellHeight: 8,
        overflow: 'linebreak',
        font: 'helvetica',
      },
      alternateRowStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
      },
      columnStyles: {
        title: { cellWidth: 32 },
        content: { cellWidth: 70 },
        category: { cellWidth: 22 },
        pinned: { cellWidth: 15 },
        createdAt: { cellWidth: 22 },
        createdBy: { cellWidth: 38 },
      },
      margin: { left: 10, right: 10 },
      styles: {
        font: 'helvetica',
        fontSize: 11,
        cellPadding: 2.5,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'top',
        minCellHeight: 8,
        textColor: 34,
      },
      didDrawPage: (data) => {
        // Footer (jsPDF types workaround)
        const pageCount = doc.getNumberOfPages();
        const pageNumber = doc.getCurrentPageInfo().pageNumber;
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page ${pageNumber} of ${pageCount}`,
          200, 290, { align: 'right' });
      },
      didParseCell: function (data) {
        // Make content cell wrap and align top for long/multiline content
        if (data.column.dataKey === 'content') {
          data.cell.styles.valign = 'top';
          data.cell.styles.fontStyle = 'normal';
        }
      },
    });
    doc.save("announcements.pdf");
  }, [announcements]);

  // Memoize add announcement handler
  const handleAddAnnouncement = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !category) {
      setFormError("Title, content, and category are required!");
      return;
    }
    if (category === "Event" && !eventDate) {
      setFormError("Event date is required for events!");
      return;
    }
    setFormError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category, pinned, expiresAt, eventDate }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create announcement");
      }
      const newAnnouncement = await res.json();
      setAnnouncements([newAnnouncement, ...announcements]);
      setTitle("");
      setContent("");
      setCategory("Update");
      setPinned(false);
      setExpiresAt("");
      setEventDate("");
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }, [title, content, category, pinned, expiresAt, eventDate, announcements]);

  // Memoize delete handler
  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete announcement");
      }
      setAnnouncements(anns => anns.filter(a => a._id !== id));
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  }, [announcements]);

  // Memoize filtered lists
  const filteredAnnouncements = useMemo(() => (
    announcements.filter(a => {
      const matchesCategory = categoryFilter === "All" || a.category === categoryFilter;
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.content.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    })
  ), [announcements, categoryFilter, search]);

  const pinnedAnnouncements = useMemo(() => (
    filteredAnnouncements
      .filter(a => a.pinned)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  ), [filteredAnnouncements]);

  const otherAnnouncements = useMemo(() => (
    filteredAnnouncements
      .filter(a => !a.pinned)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  ), [filteredAnnouncements]);

  const displayedAnnouncements = useMemo(() => (
    activeTab === 'pinned' ? pinnedAnnouncements : filteredAnnouncements
  ), [activeTab, pinnedAnnouncements, filteredAnnouncements]);

  // Memoize card click and modal close handlers
  const handleCardClick = useCallback((announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDetailsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setDetailsModalOpen(false);
    setSelectedAnnouncement(null);
  }, []);

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header Section - Outside main container */}
      <div className={`sticky top-0 z-40 ${theme === 'dark' ? 'bg-gray-900 ' : 'bg-gray-100 '} px-4 lg:px-8 pt-10`}> 
        <div className="max-w-[100vw] mx-auto">
          {/* Tab Navigation & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Tab Buttons */}
            <div className={`flex rounded-xl p-1 gap-2 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <Button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'all'
                    ? theme === 'dark'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                variant="ghost"
              >
                <FaBullhorn className="w-4 h-4" />
                <span>{t("allAnnouncements")}</span>
              </Button>
              <Button
                type="button"
                onClick={() => setActiveTab('pinned')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'pinned'
                    ? theme === 'dark'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-yellow-500 text-white'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                variant="ghost"
              >
                <FaThumbtack className="w-4 h-4" />
                <span>{t("pinnedAnnouncements")} ({pinnedAnnouncements.length})</span>
              </Button>
            </div>

            {/* Action Buttons: Create Only */}
            <div className="flex flex-wrap gap-3 items-center">
              {isAdmin && (
                <Button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transform hover:scale-[1.02] transition-all duration-200 group ${
                    theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <FaPlus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                  <span>{t("createAnnouncement")}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Full height */}
      <div className="px-2 lg:px-4 pt-4">
        <div className="max-w-[100vw] mx-auto">
          <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} overflow-hidden mx-2`}>
            {/* Announcements Header with Export Dropdown */}
            <div className={`p-6 ${theme === "dark" ? "bg-gray-700 border-b border-gray-600" : (activeTab === 'all' ? "bg-blue-50 border-b border-blue-200" : "bg-yellow-50 border-b border-yellow-200")}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    activeTab === 'all'
                      ? theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
                      : theme === 'dark' ? 'bg-yellow-600' : 'bg-yellow-500'
                  }`}>
                    {activeTab === 'all' ? (
                      <FaBullhorn className="w-5 h-5 text-white" />
                    ) : (
                      <FaThumbtack className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                      {activeTab === 'all' ? t("allAnnouncements") : t("pinnedAnnouncements")}
                    </h2>
                    <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                      {activeTab === 'all' 
                        ? t("allAnnouncementsDesc")
                        : t("pinnedAnnouncementsDesc")
                      }
                    </p>
                  </div>
                </div>
                {/* Export Dropdown Button (moved here) */}
                <div className="relative export-dropdown" tabIndex={0}>
                  <Button
                    type="button"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                      theme === 'dark' ? 'bg-slate-600 text-white hover:bg-slate-700' : 'bg-slate-500 text-white hover:bg-slate-600'
                    }`}
                    title="Export"
                    aria-haspopup="true"
                    aria-expanded="false"
                    tabIndex={0}
                    onClick={e => {
                      const dropdown = (e.currentTarget.parentElement?.querySelector('.export-dropdown-menu') as HTMLElement);
                      if (dropdown) {
                        dropdown.classList.toggle('hidden');
                      }
                    }}
                  >
                    {/* Export Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                    <span>{t("export")}</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </Button>
                  <div className="export-dropdown-menu absolute z-20 left-0 mt-2 min-w-[120px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hidden">
                    <button
                      type="button"
                      onClick={e => { handleExportPDF(); (e.currentTarget.parentElement as HTMLElement).classList.add('hidden'); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-xl focus:outline-none"
                    >
                      {/* PDF file icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" fill="#E53E3E"/><rect x="7" y="6" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="10" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="14" width="6" height="2" rx="1" fill="#fff"/><text x="12" y="19" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">PDF</text></svg>
                      PDF
                    </button>
                    <button
                      type="button"
                      onClick={e => { handleExportCSV(); (e.currentTarget.parentElement as HTMLElement).classList.add('hidden'); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-xl focus:outline-none"
                    >
                      {/* CSV file icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" fill="#38A169"/><rect x="7" y="6" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="10" width="10" height="2" rx="1" fill="#fff"/><rect x="7" y="14" width="6" height="2" rx="1" fill="#fff"/><text x="12" y="19" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">CSV</text></svg>
                      CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className={`p-6 ${theme === "dark" ? "bg-gray-700 border-b border-gray-600" : "bg-gray-50 border-b border-gray-200"}`}>
              <AnnouncementList
                announcements={displayedAnnouncements}
                theme={theme}
                isAdmin={isAdmin}
                onPinToggle={handlePinToggle}
                onComment={handleComment}
                onDelete={handleDelete}
                onCardClick={handleCardClick}
                controlsOnly
                search={search}
                onSearchChange={setSearch}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                categories={categories}
              />
            </div>

            {/* Announcements List */}
            <div className={`max-h-[calc(100vh-320px)] overflow-y-auto ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
              <AnnouncementList
                announcements={displayedAnnouncements}
                theme={theme}
                isAdmin={isAdmin}
                onPinToggle={handlePinToggle}
                onComment={handleComment}
                onDelete={handleDelete}
                onCardClick={handleCardClick}
                cardsOnly
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Form Modal */}
      {showForm && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-3xl w-full max-w-2xl max-h-[90vh] relative animate-fadeIn overflow-hidden border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
            <AnnouncementForm
              title={title}
              content={content}
              category={category}
              pinned={pinned}
              expiresAt={expiresAt}
              eventDate={eventDate}
              loading={loading}
              formError={formError}
              theme={theme}
              onTitleChange={setTitle}
              onContentChange={setContent}
              onCategoryChange={setCategory}
              onPinnedChange={setPinned}
              onExpiresAtChange={setExpiresAt}
              onEventDateChange={setEventDate}
              onSubmit={handleAddAnnouncement}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Details Modal */}
      {detailsModalOpen && typeof window !== 'undefined' && createPortal(
        <AnnouncementDetailsModal
          open={detailsModalOpen}
          announcement={selectedAnnouncement}
          onClose={handleCloseModal}
          onDelete={handleDelete}
          onPinToggle={handlePinToggle}
          isAdmin={isAdmin}
        />, 
        document.body
      )}
    </div>
  );
});

AnnouncementsPage.getLayout = (page) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default React.memo(AnnouncementsPage);