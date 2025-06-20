import React, { useState, useEffect } from "react";
import { FaBullhorn, FaThumbtack, FaRegCommentDots, FaTrash } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

interface AnnouncementCardProps {
  announcement: Announcement;
  theme: string;
  isAdmin?: boolean;
  onPinToggle?: (id: string, pinned: boolean) => void;
  onComment?: (id: string, comment: string) => void;
  onDelete?: (id: string) => void; // <-- add this prop
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
  onDelete, // <-- add this prop
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
    new Date(announcement.expiresAt) < new Date();

  // Comments (demo: local state)
  const [comments, setComments] = useState<string[]>([]);
  const [commentInput, setCommentInput] = useState("");

  if (expired) return null;

  return (
    <div
      className={`group flex flex-col md:flex-row items-start md:items-center p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-primary/20 border-l-8 border-primary bg-${theme === 'light' ? 'white' : 'gray-800'} relative`}
      tabIndex={0}
      aria-label={`Announcement: ${announcement.title}`}
    >
      <div className="flex-shrink-0 mr-4 mb-4 md:mb-0">
        <FaBullhorn className="text-4xl text-primary drop-shadow-md" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
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
        <h3 className={`text-2xl md:text-3xl font-extrabold leading-tight mb-2 text-${theme === 'light' ? 'gray-900' : 'white'} tracking-tight group-hover:text-primary-dark transition-colors`}>
          {announcement.title}
        </h3>
        <div className={`mb-4 text-base md:text-lg text-${theme === 'light' ? 'gray-700' : 'gray-300'} whitespace-pre-line prose max-w-none`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{announcement.content}</ReactMarkdown>
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
            <div className="mt-2 space-y-2">
              {comments.map((c, i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded px-3 py-2 text-sm">{c}</div>
              ))}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (commentInput.trim()) {
                    setComments([...comments, commentInput]);
                    setCommentInput("");
                    onComment && onComment(announcement._id, commentInput);
                  }
                }}
                className="flex gap-2 mt-2"
              >
                <input
                  type="text"
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  className="flex-1 px-2 py-1 rounded border"
                  placeholder="Add a comment..."
                  aria-label="Add a comment"
                />
                <button type="submit" className="px-3 py-1 bg-primary text-white rounded">Post</button>
              </form>
            </div>
          </details>
        </div>
      </div>
      {/* Admin actions */}
      {isAdmin && (
        <div className="absolute top-4 right-4 flex gap-2">
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