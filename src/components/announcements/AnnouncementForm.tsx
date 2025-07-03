import React, { useState } from "react";
import { FaBullhorn, FaSpinner, FaMagic, FaTimes } from "react-icons/fa";

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

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
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
}) => {
  const [generatingContent, setGeneratingContent] = useState(false);

  const handleGenerateContent = async () => {
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
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header */}
      <div className={`p-6 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} shadow-lg`}>
              <FaBullhorn className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Create Announcement
              </h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Share important updates with your team
              </p>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onCancel}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
            aria-label="Close form"
          >
            <FaTimes className="w-5 h-5" />
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

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Announcement Title *
            </label>
            <input
              type="text"
              placeholder="Enter announcement title..."
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className={`w-full px-4 py-3 text-base rounded-xl border transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
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
                Content *
              </label>
              <button
                type="button"
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  !title || generatingContent
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : theme === 'dark'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
                onClick={handleGenerateContent}
                disabled={!title || generatingContent}
                title="Generate content from title"
              >
                {generatingContent ? (
                  <FaSpinner className="animate-spin w-3.5 h-3.5" />
                ) : (
                  <FaMagic className="w-3.5 h-3.5" />
                )}
                Generate
              </button>
            </div>
            <textarea
              placeholder="Write your announcement content here... (Markdown supported)"
              value={content}
              onChange={e => onContentChange(e.target.value)}
              rows={6}
              className={`w-full px-4 py-3 text-base rounded-xl border transition-all duration-200 resize-y ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              }`}
              required
              disabled={loading || generatingContent}
            />
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              You can use <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer" className="underline">Markdown</a> for formatting.
            </p>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Category *
              </label>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onCategoryChange(cat)}
                    className={`w-full p-3 rounded-xl border-2 transition-all duration-200 ${
                      category === cat
                        ? `bg-gradient-to-r ${getCategoryColor(cat)} text-white border-transparent shadow-lg`
                        : theme === 'dark'
                          ? 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{cat}</div>
                      <div className={`text-xs ${
                        category === cat ? 'text-white/80' : theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        {cat === 'Update' && 'General company updates'}
                        {cat === 'Event' && 'Upcoming events & meetings'}
                        {cat === 'Alert' && 'Urgent notifications'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pin Option */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Priority
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onPinnedChange(false)}
                  className={`w-full p-3 rounded-xl border-2 transition-all duration-200 ${
                    !pinned
                      ? theme === 'dark'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                        : 'bg-blue-500 text-white border-blue-500 shadow-lg'
                      : theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold">Normal</div>
                    <div className={`text-xs ${
                      !pinned ? 'text-white/80' : theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      Standard announcement
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onPinnedChange(true)}
                  className={`w-full p-3 rounded-xl border-2 transition-all duration-200 ${
                    pinned
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-transparent shadow-lg'
                      : theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold">Pin to Top</div>
                    <div className={`text-xs ${
                      pinned ? 'text-white/80' : theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      High priority announcement
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Expiry Date
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={e => onExpiresAtChange(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full px-4 py-3 text-base rounded-xl border transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
              />
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Optional: When this announcement should stop being visible
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className={`p-6 border-t ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading || !title || !content || !category}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
              loading || !title || !content || !category
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin w-4 h-4" />
                Publishing...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <FaBullhorn className="w-4 h-4" />
                Publish Announcement
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementForm;