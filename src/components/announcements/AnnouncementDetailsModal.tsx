import React, { useState, useEffect } from "react";
import { FaThumbtack, FaTrash, FaRegCommentDots, FaChevronDown, FaChevronRight } from "react-icons/fa";
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

interface AnnouncementDetailsModalProps {
  open: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onPinToggle?: (id: string, pinned: boolean) => void;
  isAdmin?: boolean;
}

const categoryColors: Record<string, string> = {
  Update: "bg-blue-500 text-white",
  Event: "bg-green-500 text-white",
  Alert: "bg-red-500 text-white",
  All: "bg-gray-400 text-white",
};

const AnnouncementDetailsModal: React.FC<AnnouncementDetailsModalProps> = ({
  open,
  announcement,
  onClose,
  onDelete,
  onPinToggle,
  isAdmin,
}) => {
  // Comments logic (moved from AnnouncementCard)
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (!announcement) return;
    setComments([]);
    setError(null);
    setCommentInput("");
    setLoadingComments(true);
    fetch(`/api/announcements/${announcement._id}/comments`)
      .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch comments"))
      .then(data => setComments(data.comments || []))
      .catch(e => setError(typeof e === 'string' ? e : e.message || "Error loading comments"))
      .finally(() => setLoadingComments(false));
  }, [announcement?._id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !announcement) return;
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
    } catch (e: any) {
      setError(e.message || "Error posting comment");
    } finally {
      setPosting(false);
    }
  };

  if (!open || !announcement) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-0 max-w-xl w-full relative overflow-hidden lg:max-w-2xl">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold z-10"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        {/* Title and actions */}
        <div className="flex justify-between items-start px-8 pt-8 pb-2">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1 leading-tight flex items-center gap-2">
              {announcement.title}
              {announcement.pinned && (
                <span className="ml-2 text-yellow-500 flex items-center gap-1 font-bold">
                  <FaThumbtack />
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${categoryColors[announcement.category] || "bg-gray-100 text-gray-700 border-gray-300"}`}>{announcement.category}</span>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2 mt-1">
              {onPinToggle && (
                <button
                  className="text-yellow-500 hover:text-white rounded-full p-2 bg-transparent hover:bg-yellow-100 transition-colors"
                  onClick={() => onPinToggle(announcement._id, !announcement.pinned)}
                  aria-label={announcement.pinned ? "Unpin announcement" : "Pin announcement"}
                  title={announcement.pinned ? "Unpin" : "Pin"}
                  type="button"
                >
                  <FaThumbtack />
                </button>
              )}
              {onDelete && (
                <button
                  className="text-red-600 hover:text-white rounded-full p-2 bg-transparent hover:bg-red-500 focus:bg-red-600 focus:text-white transition-colors shadow-sm"
                  onClick={() => onDelete(announcement._id)}
                  aria-label="Delete announcement"
                  title="Delete"
                  type="button"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          )}
        </div>
        {/* Info grid */}
        <div className="px-8 pb-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
          <div className="flex flex-col gap-2">
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-semibold">Created:</span> {new Date(announcement.createdAt).toLocaleString()}
            </div>
            {announcement.expiresAt && (
              <div className="text-xs text-gray-500">
                <span className="font-semibold">Expires:</span> {new Date(announcement.expiresAt).toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xs text-gray-500 mt-1">
              <span className="font-semibold">Posted by:</span> {announcement.createdBy.firstName} {announcement.createdBy.lastName} ({announcement.createdBy.email})
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="px-8 pb-4">
          <div className="bg-gray-50 rounded-xl p-4 text-gray-700 text-md mb-6">
            <span className="font-semibold block mb-1">Announcement Content</span>
            <div className={styles.markdown + " prose max-w-none text-base leading-relaxed text-gray-900"}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{announcement.content}</ReactMarkdown>
            </div>
          </div>
          {/* Comments Section */}
          <div className="mt-4">
            <button
              type="button"
              className="flex items-center gap-2 text-primary font-semibold mb-2 focus:outline-none select-none"
              onClick={() => setShowComments(v => !v)}
              aria-expanded={showComments}
              aria-controls="announcement-comments-section"
              style={{ userSelect: 'none' }}
            >
              <FaRegCommentDots />
              Comments ({comments.length})
              {showComments ? <FaChevronDown className="ml-1" /> : <FaChevronRight className="ml-1" />}
            </button>
            {showComments && (
              <div id="announcement-comments-section" className="mt-2 space-y-5">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetailsModal;
