import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/sidebar/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { FaBullhorn } from "react-icons/fa";
import { useTheme } from '@/components/ThemeContext';
import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import AnnouncementList from "@/components/announcements/AnnouncementList";
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
  const [category, setCategory] = useState("Update"); // Use a valid default
  const [pinned, setPinned] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showPinned, setShowPinned] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [pomodoroMessage, setPomodoroMessage] = useState('');

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
    // For demo, do nothing
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
      setCategory("Update"); // Reset to a valid category
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

  const filteredAnnouncements = announcements
    .filter(a =>
      (categoryFilter === "All" || a.category === categoryFilter) &&
      (a.title.toLowerCase().includes(search.toLowerCase()) ||
       a.content.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pinnedAnnouncements = filteredAnnouncements.filter(a => a.pinned);
  const otherAnnouncements = filteredAnnouncements.filter(a => !a.pinned);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-2 sm:p-4 md:p-8 font-sans overflow-hidden">
      {/* Decorative blurred circles for premium look */}
      <div className="absolute top-10 left-1/4 w-56 h-56 bg-primary-light rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>
      <main className="relative z-10 w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-2 sm:p-4 md:p-10 border border-gray-100">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-10 text-center tracking-tighter leading-tight drop-shadow-lg">
          Announcements
        </h1>
        {isAdmin && (
          <>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="mb-8 w-full py-4 px-6 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 text-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              <FaBullhorn className="text-2xl mr-2" />
              {showForm ? "Hide Announcement Form" : "Add New Announcement"}
            </button>
            {showForm && (
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
            )}
          </>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 mt-2">
          <input
            type="text"
            placeholder="🔍 Search announcements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-5 py-2 rounded-full border border-gray-200 shadow-sm w-full sm:w-64 text-gray-800 bg-white focus:ring-2 focus:ring-primary focus:border-primary transition"
            aria-label="Search announcements"
          />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-5 py-2 rounded-full border border-gray-200 shadow-sm text-gray-800 bg-white focus:ring-2 focus:ring-primary focus:border-primary transition"
            aria-label="Filter by category"
          >
            <option key="All" value="All">All</option>
            {categories.filter(cat => cat !== "All").map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            className="px-5 py-2 rounded-full bg-yellow-400 text-white font-semibold shadow hover:bg-yellow-500 transition"
            onClick={() => setShowPinned(v => !v)}
          >
            {showPinned ? "Hide Pinned" : "Show Pinned"}
          </button>
          <button
            className="px-5 py-2 rounded-full bg-green-500 text-white font-semibold shadow hover:from-green-500 hover:to-blue-500 transition"
            onClick={handleExportCSV}
          >
            Export CSV
          </button>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 bg-primary-light/10 rounded-lg shadow-inner animate-pulse">
            <FaBullhorn className="animate-bounce text-primary text-5xl mb-4" />
            <p className="text-xl text-gray-700 font-semibold">
              Loading announcements...
            </p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center text-gray-600 text-xl mt-8 p-6 bg-primary-light/10 rounded-lg border border-primary-light/30 shadow-md">
            <FaBullhorn className="text-4xl text-primary mb-3 mx-auto" />
            <p className="font-semibold mb-3">No announcements yet.</p>
            <p className="text-lg">
              Admins can post important updates here for everyone to see.
            </p>
          </div>
        ) : (
          <>
            {showPinned && pinnedAnnouncements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-yellow-600 mb-2 flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400"></span>📌 Pinned
                </h2>
                <AnnouncementList
                  announcements={pinnedAnnouncements}
                  theme={theme}
                  isAdmin={isAdmin}
                  onPinToggle={handlePinToggle}
                  onComment={handleComment}
                  onDelete={handleDelete}
                />
              </div>
            )}
            <AnnouncementList
              announcements={otherAnnouncements}
              theme={theme}
              isAdmin={isAdmin}
              onPinToggle={handlePinToggle}
              onComment={handleComment}
              onDelete={handleDelete}
            />
          </>
        )}
      </main>
    </div>
  );
};

AnnouncementsPage.getLayout = (page) => (
  <DashboardLayout>{page}</DashboardLayout>
);
export default AnnouncementsPage;