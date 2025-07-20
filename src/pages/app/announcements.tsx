import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { FaPlus, FaDownload, FaBullhorn, FaThumbtack } from "react-icons/fa";
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

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
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
              <Button
                type="button"
                onClick={handleExportCSV}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transform hover:scale-[1.02] transition-all duration-200 ${
                  theme === 'dark' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <FaDownload className="w-4 h-4" />
                <span>{t("export")}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Full height */}
      <div className="px-2 lg:px-4 pt-4">
        <div className="max-w-[100vw] mx-auto">
          <div className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl border ${theme === "dark" ? "border-gray-700" : "border-gray-200"} overflow-hidden mx-2`}>
            {/* Announcements Header */}
            <div className={`p-6 ${theme === "dark" ? "bg-gray-700 border-b border-gray-600" : (activeTab === 'all' ? "bg-blue-50 border-b border-blue-200" : "bg-yellow-50 border-b border-yellow-200")}`}>
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