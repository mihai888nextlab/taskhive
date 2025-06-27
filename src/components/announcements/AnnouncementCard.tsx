import React, { useState, useEffect } from "react";
import { FaBullhorn, FaThumbtack, FaRegCommentDots, FaTrash } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "@/styles/markdown.module.css";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy: { firstName: string; lastName: string; email: string };
  category: string;
  pinned: boolean;
  expiresAt?: string;
}

interface Comment {
  _id: string;
  user: { firstName: string; lastName: string; email: string };
  text: string;
  createdAt: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
  theme: string;
  isAdmin?: boolean;
  onPinToggle?: (id: string, pinned: boolean) => void;
  onComment?: (id: string, comment: string) => void;
  onDelete?: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  Update: "bg-blue-500",
  Event: "bg-green-500",
  Alert: "bg-red-500",
  All: "bg-gray-400",
};

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  theme,
  isAdmin,
  onPinToggle,
  onComment,
  onDelete,
}) => {
  // Read/unread logic (localStorage for demo)
  const [read, setRead] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem(`announcement-read-${announcement._id}`) === "1"
      : false
  );
  useEffect(() => {
    if (!read) {
      localStorage.setItem(`announcement-read-${announcement._id}`, "1");
      setRead(true);
    }
  }, []);

  // Expiry logic
  const expired =
    announcement.expiresAt &&
    new Date(new Date(announcement.expiresAt).setHours(23, 59, 59, 999)) < new Date();
  if (expired) return null;

  // Comments: fetch from backend
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      setLoadingComments(true);
      setError(null);
      try {
        const res = await fetch(`/api/announcements/${announcement._id}/comments`);
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data = await res.json();
        setComments(data.comments || []);
      } catch (e: any) {
        setError(e.message || "Error loading comments");
      } finally {
        setLoadingComments(false);
      }
    };
    fetchComments();
  }, [announcement._id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/announcements/${announcement._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentInput }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setCommentInput("");
      onComment && onComment(announcement._id, commentInput);
    } catch (e: any) {
      setError(e.message || "Error posting comment");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div
      className={`group flex flex-col md:flex-row items-start md:items-center p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-primary/20 border-l-8 border-primary bg-${theme === 'light' ? 'white' : 'gray-800'} relative`}
      tabIndex={0}
      aria-label={`Announcement: ${announcement.title}`}
    >
      <div className="flex-shrink-0 mr-0 mb-4 md:mb-0 md:mr-4 flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16">
        <FaBullhorn className="text-3xl sm:text-4xl text-primary drop-shadow-md" />
      </div>
      <div className="flex-1 w-full">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${categoryColors[announcement.category] || "bg-gray-400"}`}>
            {announcement.category}
          </span>
          {announcement.pinned && (
            <span className="ml-2 text-yellow-500 flex items-center gap-1 font-bold">
              <FaThumbtack /> Pinned
            </span>
          )}
          {!read && (
            <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
              New
            </span>
          )}
        </div>
        <h3 className={`text-lg sm:text-2xl md:text-3xl font-extrabold leading-tight mb-2 text-${theme === 'light' ? 'gray-900' : 'white'} tracking-tight group-hover:text-primary-dark transition-colors`}> 
          {announcement.title}
        </h3>
        <div className={`mb-4 text-base sm:text-lg text-${theme === 'light' ? 'gray-700' : 'gray-300'}`}> 
          <div className={styles.markdown}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {announcement.content}
            </ReactMarkdown>
          </div>
        </div>
        <div className={`flex flex-wrap items-center text-xs text-${theme === 'light' ? 'gray-500' : 'gray-400'} mt-2`}>
          <span className="mr-2">Posted by:</span>
          <span className="font-semibold text-primary-dark mr-2">
            {announcement.createdBy.firstName} {announcement.createdBy.lastName}
          </span>
          <span className="mr-2">({announcement.createdBy.email})</span>
          <span className="mx-2">•</span>
          <span>{new Date(announcement.createdAt).toLocaleString()}</span>
          {announcement.expiresAt && (
            <>
              <span className="mx-2">•</span>
              <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
            </>
          )}
        </div>
        {/* Comments */}
        <div className="mt-4">
          <details>
            <summary className="cursor-pointer flex items-center gap-2 text-primary font-semibold">
              <FaRegCommentDots /> Comments ({comments.length})
            </summary>
            <div className="mt-6 space-y-5">
              {loadingComments && <div className="text-xs text-gray-400">Loading comments...</div>}
              {error && <div className="text-xs text-red-500">{error}</div>}
              {comments.map((c, i) => (
                <div
                  key={c._id || i}
                  className="relative bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200 rounded-2xl shadow-lg px-4 py-2 flex flex-col min-w-0 transition-transform duration-200 hover:scale-[1.025] hover:shadow-2xl group text-sm"
                  style={{overflowWrap: 'anywhere'}}
                >
                  <div className="flex items-center mb-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-tr from-primary to-blue-400 mr-2 shadow-md"></span>
                    <span className="font-semibold text-gray-900 text-[0.97em] tracking-tight">
                      {c.user?.firstName} {c.user?.lastName}
                    </span>
                    <span className="ml-2 text-xs text-gray-400 font-medium">({c.user?.email})</span>
                  </div>
                  <span className="text-gray-800 text-[0.98em] mb-1 leading-relaxed font-medium">
                    {c.text}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1 self-end font-medium italic">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                  {i < comments.length - 1 && (
                    <div className="absolute left-4 right-4 bottom-[-10px] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-80" />
                  )}
                </div>
              ))}
              <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg px-3 py-2 items-center relative text-sm">
                <div className="flex-1 relative flex items-center">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    className="peer w-full px-3 pt-5 pb-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary text-gray-900 bg-white placeholder-transparent text-sm transition font-medium shadow-sm"
                    placeholder="Add a comment..."
                    aria-label="Add a comment"
                    disabled={posting}
                    maxLength={300}
                  />
                  <label className="absolute left-3 top-2 text-xs text-gray-400 transition-all duration-200 peer-focus:text-primary peer-focus:top-1 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 pointer-events-none select-none">
                    Add a comment...
                  </label>
                </div>
                <div className="flex items-center h-full self-stretch">
                  <button
                    type="submit"
                    className="flex items-center justify-center bg-blue-400 hover:bg-blue-500 transition disabled:opacity-60 text-white font-semibold shadow-md rounded-full h-12 w-12 min-w-0 min-h-0 p-0 m-0"
                    disabled={posting}
                    aria-label="Send comment"
                    style={{marginBottom: 0, marginLeft: 2}}
                  >
                    {/* Send SVG icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </details>
        </div>
      </div>
      {/* Admin actions */}
      {isAdmin && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2">
          {onPinToggle && (
            <button
              className="text-yellow-500 hover:text-white rounded-full p-2 bg-transparent hover:bg-yellow-100 dark:hover:bg-yellow-500 transition-colors"
              onClick={() => onPinToggle(announcement._id, !announcement.pinned)}
              aria-label={announcement.pinned ? "Unpin announcement" : "Pin announcement"}
              title={announcement.pinned ? "Unpin" : "Pin"}
              type="button"
            >
              <FaThumbtack />
            </button>
          )}
          <button
            className="text-red-600 hover:text-white rounded-full p-2 bg-transparent hover:bg-red-500 focus:bg-red-600 focus:text-white transition-colors shadow-sm"
            onClick={() => onDelete && onDelete(announcement._id)}
            aria-label="Delete announcement"
            title="Delete"
            type="button"
          >
            <FaTrash />
          </button>
        </div>
      )}
    </div>
  );
};

export default AnnouncementCard;