import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { NextPageWithLayout } from "@/types";
import { FaBullhorn } from "react-icons/fa";
import { useTheme } from '@/components/ThemeContext';
import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import AnnouncementList from "@/components/announcements/AnnouncementList";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: { firstName: string; lastName: string; email: string };
}

const AnnouncementsPage: NextPageWithLayout = () => {
  const { theme } = useTheme();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/announcements")
      .then((res) => res.json())
      .then(setAnnouncements)
      .finally(() => setLoading(false));
    fetch("/api/current-user")
      .then((res) => res.json())
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
    <div className={`relative min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-2 sm:p-4 md:p-8 font-sans overflow-hidden`}>
      {/* Decorative background circles */}
      <div className="absolute top-10 left-1/4 w-48 h-48 bg-primary-light rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      <main className={`relative z-10 w-full max-w-4xl mx-auto bg-${theme === 'light' ? 'white' : 'gray-800'} rounded-3xl shadow-2xl p-2 sm:p-4 md:p-8 md:p-12`}>
        <h1 className={`text-5xl font-extrabold text-${theme === 'light' ? 'gray-900' : 'white'} mb-10 text-center tracking-tighter leading-tight drop-shadow-lg`}>
          Announcements
        </h1>
        {isAdmin && (
          <>
            <button
              onClick={() => setShowForm((v) => !v)}
              className={`mb-8 w-full py-4 px-6 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 text-lg active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5`}
            >
              <FaBullhorn className="text-2xl mr-2" />
              {showForm ? "Hide Announcement Form" : "Add New Announcement"}
            </button>
            {showForm && (
              <AnnouncementForm
                title={title}
                content={content}
                loading={loading}
                formError={formError}
                theme={theme}
                onTitleChange={setTitle}
                onContentChange={setContent}
                onSubmit={handleAddAnnouncement}
              />
            )}
          </>
        )}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 bg-primary-light/10 rounded-lg shadow-inner animate-pulse">
            <FaBullhorn className="animate-bounce text-primary text-5xl mb-4" />
            <p className="text-xl text-gray-700 font-semibold">
              Loading announcements...
            </p>
          </div>
        ) : announcements.length === 0 ? (
          <div className={`text-center text-gray-600 text-xl mt-8 p-6 bg-primary-light/10 rounded-lg border border-primary-light/30 shadow-md`}>
            <FaBullhorn className="text-4xl text-primary mb-3 mx-auto" />
            <p className="font-semibold mb-3">No announcements yet.</p>
            <p className="text-lg">
              Admins can post important updates here for everyone to see.
            </p>
          </div>
        ) : (
          <AnnouncementList announcements={announcements} theme={theme} />
        )}
      </main>
    </div>
  );
};

AnnouncementsPage.getLayout = (page) => (
  <DashboardLayout>{page}</DashboardLayout>
);
export default AnnouncementsPage;