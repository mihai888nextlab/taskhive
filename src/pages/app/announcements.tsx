import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { FaPlus, FaDownload } from "react-icons/fa";
import { useTheme } from '@/components/ThemeContext';
import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import AnnouncementList from "@/components/announcements/AnnouncementList";
import AnnouncementDetailsModal from "@/components/announcements/AnnouncementDetailsModal";
import { saveAs } from "file-saver";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: { firstName: string; lastName: string; email: string };
  category: string;
  pinned: boolean;
}

const AnnouncementsPage: NextPageWithLayout = () => {
  const { theme } = useTheme();
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

  const isAdmin = currentUser?.role === "admin";

  // Pin toggle handler
  const handlePinToggle = async (id: string, pinned: boolean) => {
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
  };

  // Comment handler (demo: local, could be API)
  const handleComment = (id: string, comment: string) => {
    // Optionally send to backend
  };

  // Export as CSV
  const handleExportCSV = () => {
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
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !category) {
      setFormError("Title, content, and category are required!");
      return;
    }
    setFormError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category, pinned, expiresAt }),
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
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
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
  };

  // Filtered lists for each column, using global search/filter
  const filteredAnnouncements = announcements.filter(a => {
    const matchesCategory = categoryFilter === "All" || a.category === categoryFilter;
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const pinnedAnnouncements = filteredAnnouncements
    .filter(a => a.pinned)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const otherAnnouncements = filteredAnnouncements
    .filter(a => !a.pinned)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Handler to open details modal
  const handleCardClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDetailsModalOpen(true);
  };

  // Handler to close details modal
  const handleCloseModal = () => {
    setDetailsModalOpen(false);
    setSelectedAnnouncement(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans mt-6 px-2 sm:px-6 flex flex-col items-center w-full">
      {/* Header */}
      {/* Controls bar: search, filter, add, export */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-2 mb-2 px-1 sticky top-0 z-10 bg-gray-100 backdrop-blur-md py-2 border-b border-gray-100" style={{maxWidth: '100%'}}>
        <input
          type="text"
          placeholder="Search announcements..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary text-sm transition placeholder-gray-400 min-w-0 shadow-sm"
          aria-label="Search announcements"
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary text-sm w-40 shadow-sm"
          aria-label="Filter by category"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className="flex gap-2 items-center mt-2 sm:mt-0">
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary"
              aria-expanded={showForm}
              aria-controls="announcement-form"
            >
              <FaPlus className="text-base" />
              <span>Add</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary"
            title="Export as CSV"
          >
            <FaDownload className="text-base" />
            <span>Export</span>
          </button>
        </div>
      </div>
      {/* Modal for Announcement Form */}
      {isAdmin && showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-auto">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl font-bold rounded-full focus:outline-none"
              aria-label="Close announcement form"
            >
              &times;
            </button>
            <AnnouncementForm
              title={title}
              content={content}
              category={category}
              pinned={pinned}
              expiresAt={expiresAt}
              loading={loading}
              formError={formError}
              theme={theme}
              onTitleChange={setTitle}
              onContentChange={setContent}
              onCategoryChange={setCategory}
              onPinnedChange={setPinned}
              onExpiresAtChange={setExpiresAt}
              onSubmit={handleAddAnnouncement}
            />
          </div>
        </div>
      )}
      {/* Main content: Side-by-side sections */}
      {filteredAnnouncements.length === 0 ? (
        <div className="w-full max-w-2xl mx-auto text-center text-gray-400 text-lg py-24">
          No announcements found.
        </div>
      ) : (
        <div className="w-full max-w-[1800px] mx-auto flex flex-col lg:flex-row gap-8 pb-12">
          {/* Pinned Announcements Section */}
          <section className="w-full lg:w-[52%] bg-white rounded-3xl shadow-xl border border-gray-100 px-2 sm:px-12 py-12 min-w-[340px] flex flex-col">
            <h2 className="text-xl font-bold mb-6 text-gray-900 tracking-tight flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>
              Pinned
            </h2>
            <div className="flex flex-col items-center gap-8">
              <div className="w-full max-w-5xl" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <AnnouncementList
                  announcements={pinnedAnnouncements}
                  theme={theme}
                  isAdmin={isAdmin}
                  onPinToggle={handlePinToggle}
                  onComment={handleComment}
                  onDelete={handleDelete}
                  onCardClick={handleCardClick}
                />
              </div>
            </div>
          </section>
          {/* All Announcements Section */}
          <section className="w-full lg:w-[48%] bg-white rounded-3xl shadow-xl border border-gray-100 px-2 sm:px-12 py-12 min-w-[340px] flex flex-col">
            <h2 className="text-xl font-bold mb-6 text-gray-900 tracking-tight flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
              All Announcements
            </h2>
            <div className="flex flex-col items-center gap-8">
              <div className="w-full max-w-5xl" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <AnnouncementList
                  announcements={otherAnnouncements}
                  theme={theme}
                  isAdmin={isAdmin}
                  onPinToggle={handlePinToggle}
                  onComment={handleComment}
                  onDelete={handleDelete}
                  onCardClick={handleCardClick}
                />
              </div>
            </div>
          </section>
        </div>
      )}
      {/* Details Modal */}
      <AnnouncementDetailsModal
        open={detailsModalOpen}
        announcement={selectedAnnouncement}
        onClose={handleCloseModal}
        onDelete={handleDelete}
        onPinToggle={handlePinToggle}
        isAdmin={isAdmin}
      />
    </div>
  );
};

AnnouncementsPage.getLayout = (page) => (
  <DashboardLayout>{page}</DashboardLayout>
);
export default AnnouncementsPage;