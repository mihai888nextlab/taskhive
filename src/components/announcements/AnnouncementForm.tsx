
import React, { useState, useCallback } from "react";
import { FaBullhorn, FaSpinner, FaMagic, FaTimes } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { useTranslations } from "next-intl";

interface AnnouncementFormProps {
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  expiresAt: string;
  loading: boolean;
  formError: string | null;
  theme: string;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onPinnedChange: (v: boolean) => void;
  onExpiresAtChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const categories = ["Update", "Event", "Alert"];

const getCategoryColor = (category: string) => {
  const colors = {
    Update: "from-blue-500 to-blue-600",
    Event: "from-green-500 to-green-600",
    Alert: "from-red-500 to-red-600",
  };
  return colors[category as keyof typeof colors] || "from-gray-500 to-gray-600";
};


// --- New: Add eventDate state and handler ---
const AnnouncementForm: React.FC<AnnouncementFormProps & { eventDate?: string; onEventDateChange?: (v: string) => void }> = ({
  title,
  content,
  category,
  pinned,
  expiresAt,
  loading,
  formError,
  theme,
  onTitleChange,
  onContentChange,
  onCategoryChange,
  onPinnedChange,
  onExpiresAtChange,
  onSubmit,
  onCancel,
  eventDate,
  onEventDateChange,
}) => {
  const t = useTranslations("AnnouncementsPage");
  const [generatingContent, setGeneratingContent] = useState(false);

  // Memoize event handlers
  const handleTitleChange = useCallback((v: string) => onTitleChange(v), [onTitleChange]);
  const handleContentChange = useCallback((v: string) => onContentChange(v), [onContentChange]);
  const handleCategoryChange = useCallback((v: string) => onCategoryChange(v), [onCategoryChange]);
  const handlePinnedChange = useCallback((v: boolean) => onPinnedChange(v), [onPinnedChange]);
  const handleExpiresAtChange = useCallback((v: string) => onExpiresAtChange(v), [onExpiresAtChange]);
  // Always call the handler directly (it is required for Event category)
  const handleEventDateChange = useCallback((v: string) => {
    if (onEventDateChange) {
      onEventDateChange(v);
    }
  }, [onEventDateChange]);
  const handleCancel = useCallback(() => onCancel(), [onCancel]);
  const handleFormSubmit = useCallback((e: React.FormEvent) => onSubmit(e), [onSubmit]);

  const handleGenerateContent = useCallback(async () => {
    if (!title) return;
    setGeneratingContent(true);
    try {
      const prompt = `
You are an expert communications assistant for a modern company. 
Write a clear, engaging, and informative announcement for all employees, based on the following title: "${title}".

- The announcement should be concise (2-4 sentences).
- Use a positive and professional tone.
- Clearly explain the purpose or impact of the announcement.
- If the title suggests an event, include the main details and encourage participation.
- If the title is an alert or update, highlight the key change or action required.
- Do not use markdown, bullet points, or special formatting—just plain text.
- **Do not include any heading, label, or prefix. Only output the announcement text itself.**
`;
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.response) {
        onContentChange(data.response);
      }
    } finally {
      setGeneratingContent(false);
    }
  }, [title, onContentChange]);

  // Convert string date to Date object for DatePicker, with fallback for invalid dates
  function parseDateString(dateStr?: string): Date | undefined {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? undefined : d;
  }
  const expiresAtDateObj = parseDateString(expiresAt);
  const eventDateObj = parseDateString(eventDate);

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header */}
      <div className={`p-6 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'}`}>
              <FaBullhorn className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {t("createAnnouncement")}
              </h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {t("allAnnouncementsDesc")}
              </p>
            </div>
          </div>
          <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold z-10"
              onClick={handleCancel}
              aria-label="Close modal"
            >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Error Message */}
        {formError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium text-sm">{formError}</p>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {t("announcementTitle")} *
            </label>
            <Input
              type="text"
              placeholder={t("enterAnnouncementTitle")}
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full py-3 px-4 text-base rounded-xl"
              required
              disabled={loading}
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`block text-sm font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {t("content")} *
              </label>
              <Button
                type="button"
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 min-w-[120px] h-10
                  ${!title || generatingContent
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
                onClick={handleGenerateContent}
                disabled={!title || generatingContent}
                title={t("generateContentFromTitle")}
              >
                {generatingContent ? (
                  <FaSpinner className="animate-spin w-3.5 h-3.5" />
                ) : (
                  <FaMagic className="w-3.5 h-3.5" />
                )}
                {t("generate")}
              </Button>
            </div>
            <textarea
              placeholder={t("writeAnnouncementContent")}
              value={content}
              onChange={e => handleContentChange(e.target.value)}
              rows={6}
              className={`w-full py-3 px-4 text-base rounded-xl border transition-all duration-200 resize-y min-h-[120px] max-h-64
                ${theme === 'dark' 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
              required
              disabled={loading || generatingContent}
            />
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {t("markdownSupported")}
            </p>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {t("category")} *
              </label>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full py-5 px-4 h-16 rounded-xl border-2 transition-all duration-200 text-left
                      ${category === cat
                        ? `bg-gradient-to-r ${getCategoryColor(cat)} text-white border-transparent`
                        : theme === 'dark'
                          ? 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                    variant={category === cat ? "default" : "outline"}
                  >
                    <div>
                      <div className="font-semibold">{t(`category${cat}`)}</div>
                      <div className={`text-xs ${
                        category === cat ? 'text-white/80' : theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {cat === 'Update' && t("categoryUpdateDesc")}
                        {cat === 'Event' && t("categoryEventDesc")}
                        {cat === 'Alert' && t("categoryAlertDesc")}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Pin Option */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {t("priority")}
              </label>
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={() => handlePinnedChange(false)}
                  className={`w-full py-5 px-4 h-16 rounded-xl border-2 transition-all duration-200 text-left
                    ${!pinned
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-blue-500 text-white border-blue-500'
                      : theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                  variant={!pinned ? "default" : "outline"}
                >
                  <div>
                    <div className="font-semibold">{t("priorityNormal")}</div>
                    <div className={`text-xs ${
                      !pinned ? 'text-white/80' : theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {t("priorityNormalDesc")}
                    </div>
                  </div>
                </Button>
                <Button
                  type="button"
                  onClick={() => handlePinnedChange(true)}
                  className={`w-full py-5 px-4 h-16 rounded-xl border-2 transition-all duration-200 text-left
                    ${pinned
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-transparent'
                      : theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                  variant={pinned ? "default" : "outline"}
                >
                  <div>
                    <div className="font-semibold">{t("priorityPinToTop")}</div>
                    <div className={`text-xs ${
                      pinned ? 'text-white/80' : theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {t("priorityPinToTopDesc")}
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {t("expiryDate")}
              </label>
              <DatePicker
                value={expiresAtDateObj}
                onChange={date => {
                  if (date) {
                    const formatted = date.toISOString().split("T")[0];
                    handleExpiresAtChange(formatted);
                  } else {
                    handleExpiresAtChange("");
                  }
                }}
                disabled={loading}
                className="w-full h-10"
                placeholder="mm / dd / yyyy"
              />
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {t("optionalExpiryDate")}
              </p>
              {/* Event Date (only for Event category, right under expiry date, same as expiry date selector) */}
              {category === 'Event' && (
                <div className="mt-4">
                  <label className={`block text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {t("eventDate") || "Event Date"}
                  </label>
                  <DatePicker
                    value={eventDateObj}
                    onChange={date => {
                      if (date) {
                        const formatted = date.toISOString().split("T")[0];
                        handleEventDateChange(formatted);
                      } else {
                        handleEventDateChange("");
                      }
                    }}
                    disabled={loading}
                    className="w-full h-10"
                    placeholder="mm / dd / yyyy"
                  />
                  <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {t("optionalExpiryDate")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className={`p-6 border-t ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={handleCancel}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={loading}
            variant="ghost"
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            onClick={handleFormSubmit}
            disabled={loading || !title || !content || !category}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
              loading || !title || !content || !category
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin w-4 h-4" />
                {t("publishing")}...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <FaBullhorn className="w-4 h-4" />
                {t("publishAnnouncement")}
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementForm;