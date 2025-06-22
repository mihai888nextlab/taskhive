import React from "react";
import { FaBullhorn } from "react-icons/fa";

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
}

const categories = ["Update", "Event", "Alert"];

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
}) => (
  <form
    onSubmit={onSubmit}
    className={`bg-${theme === 'light' ? 'gradient-to-br from-gray-50 to-gray-100' : 'bg-gray-700'} p-8 rounded-2xl shadow-xl border border-gray-200 mb-8 animate-fadeIn`}
  >
    <h2 className={`text-3xl font-bold ${theme === 'light' ? 'text-gray-800' : 'text-white'} mb-6 text-center`}>
      Create Announcement
    </h2>
    {formError && (
      <div className="bg-red-100 text-red-700 p-4 mb-6 rounded-lg font-semibold text-center">
        {formError}
      </div>
    )}
    <input
      type="text"
      placeholder="Title"
      className={`w-full mb-4 p-3 border border-primary/40 rounded-lg ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 placeholder-gray-400 text-lg font-semibold shadow-sm`}
      value={title}
      onChange={(e) => onTitleChange(e.target.value)}
      required
      disabled={loading}
    />
    <textarea
      placeholder="Content (Markdown supported!)"
      className={`w-full mb-2 p-3 border border-primary/40 rounded-lg ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y transition-all duration-200 placeholder-gray-400 text-base shadow-sm`}
      value={content}
      onChange={(e) => onContentChange(e.target.value)}
      required
      rows={4}
      disabled={loading}
    />
    <div className="text-xs text-gray-400 mb-4">You can use <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer" className="underline">Markdown</a> for formatting.</div>
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      {/* Category Selector */}
      <div className="flex-1 flex flex-col">
        <label
          className={`mb-1 font-semibold ${theme === 'light' ? 'text-black' : 'text-gray-200'}`}
          htmlFor="category"
        >
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={e => onCategoryChange(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${theme === 'light' ? 'text-black' : 'text-gray-200'}`}
          aria-label="Category"
        >
          <option value="" disabled>
            Select category
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      {/* Pin to Top Checkbox */}
      <div className="flex flex-col justify-center items-center sm:w-32">
        <label className="inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={pinned}
            onChange={e => onPinnedChange(e.target.checked)}
            className="form-checkbox h-5 w-5 text-primary rounded transition"
            disabled={loading}
          />
          <span className={`ml-2 text-sm font-medium ${theme === 'light' ? 'text-black' : 'text-gray-200'}`}>
            Pin to top
          </span>
        </label>
      </div>
      {/* Date Selector */}
      <div className="flex-1 flex flex-col">
        <label
          className={`mb-1 font-semibold ${theme === 'light' ? 'text-black' : 'text-gray-200'}`}
          htmlFor="expiresAt"
        >
          Expiry Date
        </label>
        <input
          id="expiresAt"
          type="date"
          value={expiresAt}
          onChange={e => onExpiresAtChange(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${theme === 'light' ? 'text-black' : 'text-gray-200'}`}
          aria-label="Expiry date"
          min={new Date().toISOString().split("T")[0]}
        />
        <span className="text-xs text-gray-400 mt-2 ml-1 italic">
          This is the date when the announcement will expire (it will be visible through this date).
        </span>
      </div>
    </div>
    <button
      type="submit"
      className={`w-full py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 text-lg`}
    >
      Post Announcement
    </button>
  </form>
);

export default AnnouncementForm;