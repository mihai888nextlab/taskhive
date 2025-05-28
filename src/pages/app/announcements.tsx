import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { FaBullhorn } from "react-icons/fa";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: { firstName: string; lastName: string; email: string };
}

const AnnouncementsPage: NextPageWithLayout = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/announcements")
      .then(res => res.json())
      .then(setAnnouncements)
      .finally(() => setLoading(false));
    fetch("/api/current-user")
      .then(res => res.json())
      .then(setCurrentUser);
  }, []);

  const isAdmin = currentUser?.role === "admin";

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormError("Title and content are required!");
      return;
    }
    setFormError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create announcement");
      }
      const newAnnouncement = await res.json();
      setAnnouncements([newAnnouncement, ...announcements]);
      setTitle("");
      setContent("");
      setShowForm(false);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-2 sm:p-4 md:p-8 font-sans overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-10 left-1/4 w-48 h-48 bg-primary-light rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      <main className="relative z-10 w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-2 sm:p-4 md:p-8 md:p-12">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-10 text-center tracking-tighter leading-tight drop-shadow-lg">Announcements</h1>
        {isAdmin && (
          <>
            <button
              onClick={() => setShowForm(v => !v)}
              className="mb-8 w-full py-4 px-6 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 text-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
            >
              <FaBullhorn className="text-2xl mr-2" />
              {showForm ? "Hide Announcement Form" : "Add New Announcement"}
            </button>
            {showForm && (
              <form onSubmit={handleAddAnnouncement} className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-xl border border-gray-200 mb-8 animate-fadeIn">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Create Announcement</h2>
                {formError && <div className="bg-red-100 text-red-700 p-4 mb-6 rounded-lg font-semibold text-center">{formError}</div>}
                <input
                  type="text"
                  placeholder="Title"
                  className="w-full mb-4 p-3 border border-primary/40 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder-gray-400 text-lg font-semibold shadow-sm"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  disabled={loading}
                />
                <textarea
                  placeholder="Content"
                  className="w-full mb-4 p-3 border border-primary/40 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y transition-all duration-200 placeholder-gray-400 text-base shadow-sm"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                  rows={4}
                  disabled={loading}
                />
                <button type="submit" className="w-full py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 text-lg">Post Announcement</button>
              </form>
            )}
          </>
        )}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 bg-primary-light/10 rounded-lg shadow-inner animate-pulse">
            <FaBullhorn className="animate-bounce text-primary text-5xl mb-4" />
            <p className="text-xl text-gray-700 font-semibold">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center text-gray-600 text-xl mt-8 p-6 bg-primary-light/10 rounded-lg border border-primary-light/30 shadow-md">
            <FaBullhorn className="text-4xl text-primary mb-3 mx-auto" />
            <p className="font-semibold mb-3">No announcements yet.</p>
            <p className="text-lg">Admins can post important updates here for everyone to see.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {announcements.map(a => (
              <div key={a._id} className="group flex flex-col md:flex-row items-start md:items-center p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-primary/20 border-l-8 border-primary bg-gradient-to-br from-white to-blue-50">
                <div className="flex-shrink-0 mr-4 mb-4 md:mb-0">
                  <FaBullhorn className="text-4xl text-primary drop-shadow-md" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-extrabold leading-tight mb-2 text-gray-900 tracking-tight group-hover:text-primary-dark transition-colors">
                    {a.title}
                  </h3>
                  <p className="mb-4 text-base md:text-lg text-gray-700 whitespace-pre-line">
                    {a.content}
                  </p>
                  <div className="flex flex-wrap items-center text-xs text-gray-500 mt-2">
                    <span className="mr-2">Posted by:</span>
                    <span className="font-semibold text-primary-dark mr-2">{a.createdBy.firstName} {a.createdBy.lastName}</span>
                    <span className="mr-2">({a.createdBy.email})</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(a.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

AnnouncementsPage.getLayout = page => <DashboardLayout>{page}</DashboardLayout>;
export default AnnouncementsPage;