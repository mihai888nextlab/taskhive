import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaThumbtack, FaTrash, FaRegCommentDots, FaChevronDown, FaChevronRight, FaTimes, FaUser, FaPaperPlane, FaSpinner } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "@/styles/markdown.module.css";
import { useTheme } from '@/components/ThemeContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
}

interface AnnouncementDetailsModalProps {
  open: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onPinToggle?: (id: string, pinned: boolean) => void;
  isAdmin?: boolean;
}

const AnnouncementDetailsModal: React.FC<AnnouncementDetailsModalProps> = React.memo(({
  open,
  announcement,
  onClose,
  onDelete,
  onPinToggle,
  isAdmin,
}) => {
  const { theme } = useTheme();
  const t = useTranslations("AnnouncementsPage");
  
  // Local state to track pinned status for immediate UI updates
  const [localPinned, setLocalPinned] = useState(announcement?.pinned || false);
  
  // Comments logic
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);

  // Memoize localPinned
  useEffect(() => {
    setLocalPinned(announcement?.pinned || false);
  }, [announcement?.pinned]);

  // Memoize comments fetch
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

  // Memoize handleCommentSubmit
  const handleCommentSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [commentInput, announcement]);

  // Memoize handlePinToggle
  const handlePinToggle = useCallback(() => {
    if (!announcement || !onPinToggle) return;
    const newPinnedState = !localPinned;
    setLocalPinned(newPinnedState);
    onPinToggle(announcement._id, newPinnedState);
  }, [announcement, onPinToggle, localPinned]);

  // Memoize getCategoryColor
  const getCategoryColor = useCallback((category: string) => {
    switch (category) {
      case "Update":
        return theme === 'dark' 
          ? "bg-blue-900/30 text-blue-300 border-blue-800" 
          : "bg-blue-50 text-blue-700 border-blue-200";
      case "Event":
        return theme === 'dark' 
          ? "bg-green-900/30 text-green-300 border-green-800" 
          : "bg-green-50 text-green-700 border-green-200";
      case "Alert":
        return theme === 'dark' 
          ? "bg-red-900/30 text-red-300 border-red-800" 
          : "bg-red-50 text-red-700 border-red-200";
      default:
        return theme === 'dark' 
          ? "bg-gray-700 text-gray-300 border-gray-600" 
          : "bg-gray-100 text-gray-700 border-gray-200";
    }
  }, [theme]);

  // Memoize getInitials
  const getInitials = useCallback((firstName: string, lastName: string) => {
    return (firstName[0] || "") + (lastName[0] || "");
  }, []);

  if (!open || !announcement) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-3xl w-full max-w-4xl max-h-[90vh] relative animate-fadeIn overflow-hidden`}>
        <button
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold z-10"
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                  <FaTimes />
                </button>

        {/* Header */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-start justify-between gap-4">
            {/* Title and Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}>
                  {announcement.title}
                </h2>
                {localPinned && (
                  <div className="flex-shrink-0">
                    <FaThumbtack className="w-5 h-5 text-yellow-500" />
                  </div>
                )}
              </div>
              
              {/* Category and Meta Info */}
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold border ${getCategoryColor(announcement.category)}`}>
                  {t(`category${announcement.category}`)}
                </span>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {new Date(announcement.createdAt).toLocaleDateString()} • {new Date(announcement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {announcement.expiresAt && (
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t("expires", { date: new Date(announcement.expiresAt).toLocaleDateString() })}
                  </div>
                )}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 mt-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {getInitials(announcement.createdBy.firstName, announcement.createdBy.lastName) || <FaUser className="w-3 h-3" />}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {announcement.createdBy.firstName} {announcement.createdBy.lastName}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {announcement.createdBy.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            {isAdmin && (
              <div className="flex gap-2 mr-6">
                {onPinToggle && (
                  <button
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      localPinned
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50'
                        : theme === 'dark' 
                          ? 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-yellow-400' 
                          : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'
                    }`}
                    onClick={handlePinToggle}
                    aria-label={localPinned ? "Unpin announcement" : "Pin announcement"}
                  >
                    <FaThumbtack className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-gray-400 hover:bg-red-900/30 hover:text-red-400' 
                        : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                    }`}
                    onClick={() => onDelete(announcement._id)}
                    aria-label="Delete announcement"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Announcement Content */}
            <div className={`rounded-2xl p-6 mb-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className={`${styles.markdown} prose max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {announcement.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              {/* Comments Header */}
              <button
                type="button"
                className={`flex items-center gap-3 ${theme === 'dark' ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} font-semibold transition-colors duration-200`}
                onClick={() => setShowComments(v => !v)}
                aria-expanded={showComments}
              >
                <FaRegCommentDots className="w-4 h-4" />
                <span>{t("comments", { count: comments.length })}</span>
                {showComments ? (
                  <FaChevronDown className="w-3 h-3" />
                ) : (
                  <FaChevronRight className="w-3 h-3" />
                )}
              </button>

              {/* Comments List */}
              {showComments && (
                <div className="space-y-4">
                  {loadingComments ? (
                    <div className="text-center py-8">
                      <FaSpinner className="animate-spin w-6 h-6 mx-auto mb-2 text-blue-600" />
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t("loadingComments")}
                      </p>
                    </div>
                  ) : error ? (
                    <div className={`text-center py-4 px-4 rounded-xl ${theme === 'dark' ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
                      {error}
                    </div>
                  ) : comments.length === 0 ? (
                    <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <FaRegCommentDots className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>{t("noCommentsYet")}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {comments.map((comment, index) => (
                        <div
                          key={comment._id || index}
                          className={`p-4 rounded-2xl border transition-all duration-200 ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' 
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {/* Comment Header */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white font-bold text-sm">
                              {getInitials(comment.user?.firstName || '', comment.user?.lastName || '') || <FaUser className="w-3 h-3" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {comment.user?.firstName} {comment.user?.lastName}
                              </div>
                              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {new Date(comment.createdAt).toLocaleDateString()} • {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                          
                          {/* Comment Content */}
                          <div className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} ml-11`}>
                            {comment.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Form */}
                  <form onSubmit={handleCommentSubmit} className="mt-6">
                    <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          <FaUser className="w-3 h-3" />
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder={t("writeComment")}
                            className={`w-full px-4 py-3 rounded-xl border resize-none transition-all duration-200 ${
                              theme === 'dark' 
                                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            }`}
                            rows={3}
                            disabled={posting}
                            maxLength={500}
                          />
                          <div className="flex items-center justify-between mt-3">
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {t("characters", { count: commentInput.length })}
                            </div>
                            <Button
                              type="submit"
                              disabled={posting || !commentInput.trim()}
                              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                                posting || !commentInput.trim()
                                  ? theme === 'dark' ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-[1.02]'
                              }`}
                            >
                              {posting ? (
                                <>
                                  <FaSpinner className="animate-spin w-3 h-3" />
                                  <span>{t("posting")}</span>
                                </>
                              ) : (
                                <>
                                  <FaPaperPlane className="w-3 h-3" />
                                  <span>{t("postComment")}</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default React.memo(AnnouncementDetailsModal);
