import React, { useState, useEffect } from "react";
import { FaBullhorn, FaThumbtack, FaTrash } from "react-icons/fa";
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

interface AnnouncementCardProps {
  announcement: Announcement;
  theme: string;
  isAdmin?: boolean;
  onPinToggle?: (id: string, pinned: boolean) => void;
  onComment?: (id: string, comment: string) => void;
  onDelete?: (id: string) => void;
  onCardClick?: (announcement: Announcement) => void; // NEW
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
  onCardClick,
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

  return (
    <div
      className={`group flex flex-col md:flex-row items-start md:items-center p-4 sm:p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-primary bg-${theme === 'light' ? 'white' : 'gray-900'} relative min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/40`}
      tabIndex={0}
      aria-label={`Announcement: ${announcement.title}`}
      onClick={e => {
        if ((e.target as HTMLElement).closest('.admin-action-btn')) return;
        onCardClick && onCardClick(announcement);
      }}
      style={{ cursor: onCardClick ? 'pointer' : 'default', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)' }}
    >
      <div className="flex-shrink-0 mr-0 mb-4 md:mb-0 md:mr-4 flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-primary/5 rounded-xl">
        <FaBullhorn className="text-2xl sm:text-3xl text-primary" />
      </div>
      <div className="flex-1 w-full">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${categoryColors[announcement.category] || "bg-gray-400"}`}>{announcement.category}</span>
          {announcement.pinned && (
            <span className="ml-2 text-yellow-500 flex items-center gap-1 font-semibold">
              <FaThumbtack /> Pinned
            </span>
          )}
          {!read && (
            <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
              New
            </span>
          )}
        </div>
        <h3 className={`text-lg sm:text-xl md:text-2xl font-bold leading-tight mb-1 text-${theme === 'light' ? 'gray-900' : 'white'} tracking-tight group-hover:text-primary-dark transition-colors`}> 
          {announcement.title}
        </h3>
        <div className={`mb-2 text-base sm:text-lg text-${theme === 'light' ? 'gray-700' : 'gray-300'} font-normal`}> 
          <div className={styles.markdown} style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {/* Show only the first 9 words of content, add ... if longer, and render as markdown */}
            {(() => {
              const words = announcement.content.split(/\s+/);
              const preview = words.slice(0, 9).join(' ');
              const previewText = preview + (words.length > 9 ? '...' : '');
              return (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{previewText}</ReactMarkdown>
              );
            })()}
          </div>
        </div>
        <div className={`flex flex-wrap items-center text-xs text-${theme === 'light' ? 'gray-400' : 'gray-500'} mt-1 gap-x-2 gap-y-1 font-medium`}> 
          <span>By <span className="font-semibold text-primary-dark">{announcement.createdBy.firstName} {announcement.createdBy.lastName}</span></span>
          <span>({announcement.createdBy.email})</span>
          <span>•</span>
          <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
          {announcement.expiresAt && (
            <>
              <span>•</span>
              <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>
            </>
          )}
        </div>
      </div>
      {/* Admin actions */}
      {isAdmin && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2">
          {onPinToggle && (
            <button
              className="admin-action-btn text-yellow-500 hover:text-white rounded-full p-2 bg-transparent hover:bg-yellow-100 dark:hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
              onClick={e => { e.stopPropagation(); onPinToggle(announcement._id, !announcement.pinned); }}
              aria-label={announcement.pinned ? "Unpin announcement" : "Pin announcement"}
              title={announcement.pinned ? "Unpin" : "Pin"}
              type="button"
            >
              <FaThumbtack />
            </button>
          )}
          <button
            className="admin-action-btn text-red-600 hover:text-white rounded-full p-2 bg-transparent hover:bg-red-100 dark:hover:bg-red-500 focus:bg-red-600 focus:text-white transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            onClick={e => { e.stopPropagation(); onDelete && onDelete(announcement._id); }}
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