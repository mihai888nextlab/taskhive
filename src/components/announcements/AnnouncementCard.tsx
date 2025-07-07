import React, { useState, useEffect } from "react";
import { FaBullhorn, FaThumbtack, FaTrash, FaCalendarAlt, FaUser, FaChevronRight } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "@/styles/markdown.module.css";
import { Button } from "@/components/ui/button";

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
  onCardClick?: (announcement: Announcement) => void;
}

const getCategoryColor = (category: string, theme: string) => {
  const colors = {
    Update: theme === 'dark' 
      ? 'bg-blue-900/30 text-blue-300 border-blue-800' 
      : 'bg-blue-50 text-blue-700 border-blue-200',
    Event: theme === 'dark' 
      ? 'bg-green-900/30 text-green-300 border-green-800' 
      : 'bg-green-50 text-green-700 border-green-200',
    Alert: theme === 'dark' 
      ? 'bg-red-900/30 text-red-300 border-red-800' 
      : 'bg-red-50 text-red-700 border-red-200',
  };
  return colors[category as keyof typeof colors] || (theme === 'dark' 
    ? 'bg-gray-700 text-gray-300 border-gray-600' 
    : 'bg-gray-100 text-gray-700 border-gray-200');
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
    if (!read && typeof window !== "undefined") {
      localStorage.setItem(`announcement-read-${announcement._id}`, "1");
      setRead(true);
    }
  }, [read, announcement._id]);

  // Expiry logic
  const expired =
    announcement.expiresAt &&
    new Date(new Date(announcement.expiresAt).setHours(23, 59, 59, 999)) < new Date();
  
  if (expired) return null;

  const getInitials = () => {
    const firstName = announcement.createdBy.firstName || "";
    const lastName = announcement.createdBy.lastName || "";
    return (firstName[0] || "") + (lastName[0] || "");
  };

  const truncateContent = (content: string, maxWords: number = 15) => {
    const words = content.split(/\s+/);
    if (words.length <= maxWords) return content;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer transform hover:scale-[1.01] ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700 hover:border-gray-600 hover:bg-gray-750"
          : "bg-white border-gray-200 hover:border-gray-300"
      }`}
      onClick={e => {
        if ((e.target as HTMLElement).closest('.admin-action-btn')) return;
        onCardClick && onCardClick(announcement);
      }}
    >
      {/* Admin Actions */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onPinToggle && (
            <Button
              type="button"
              className={`admin-action-btn p-2 rounded-lg transition-all duration-200 ${
                announcement.pinned
                  ? theme === 'dark' ? 'bg-yellow-900/50 text-yellow-300 hover:bg-yellow-800' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : theme === 'dark' ? 'bg-gray-700 text-gray-400 hover:bg-yellow-800 hover:text-yellow-300' : 'bg-gray-100 text-gray-500 hover:bg-yellow-100 hover:text-yellow-700'
              }`}
              onClick={e => { 
                e.stopPropagation(); 
                onPinToggle(announcement._id, !announcement.pinned); 
              }}
              title={announcement.pinned ? "Unpin" : "Pin"}
              variant="ghost"
            >
              <FaThumbtack className="w-3.5 h-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              className={`admin-action-btn p-2 rounded-lg transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-gray-400 hover:bg-red-800 hover:text-red-300' 
                  : 'bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-700'
              }`}
              onClick={e => { 
                e.stopPropagation(); 
                onDelete && onDelete(announcement._id); 
              }}
              title="Delete"
              variant="ghost"
            >
              <FaTrash className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-6">
        {/* Header - Category and Pin Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <FaBullhorn className={`w-4 h-4 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`} />
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${getCategoryColor(announcement.category, theme)}`}>
                {announcement.category}
              </span>
              
              {announcement.pinned && (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                  theme === 'dark' 
                    ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800' 
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                  <FaThumbtack className="w-2.5 h-2.5" />
                  Pinned
                </span>
              )}
              
              {!read && (
                <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium animate-pulse ${
                  theme === 'dark' 
                    ? 'bg-blue-900/30 text-blue-300' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  New
                </span>
              )}
            </div>
          </div>

          {/* Arrow Indicator */}
          <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <FaChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Title */}
        <h3 className={`font-bold text-lg leading-tight mb-3 ${
          theme === "dark" ? "text-white" : "text-gray-900"
        } group-hover:text-blue-600 transition-colors duration-200`}>
          {announcement.title}
        </h3>

        {/* Content Preview */}
        <div className={`text-sm mb-4 leading-relaxed ${
          theme === "dark" ? "text-gray-300" : "text-gray-600"
        }`}>
          <div className="line-clamp-2">
            {truncateContent(announcement.content)}
          </div>
        </div>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-medium ${
                theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              }`}>
                {getInitials() || <FaUser className="w-3 h-3" />}
              </div>
              <span className={`font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>
                {announcement.createdBy.firstName} {announcement.createdBy.lastName}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1.5">
              <FaCalendarAlt className={`w-3 h-3 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <span className={`${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}>
                {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Expiry Date */}
          {announcement.expiresAt && (
            <div className={`text-xs px-2 py-1 rounded-lg ${
              theme === 'dark' 
                ? 'bg-gray-700 text-gray-400' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              Expires: {new Date(announcement.expiresAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
          )}
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className={`absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-blue-500 transition-all duration-200 pointer-events-none`} />
    </div>
  );
};

export default AnnouncementCard;