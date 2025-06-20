import React from "react";
import { FaBullhorn } from "react-icons/fa";

interface AnnouncementFormProps {
  title: string;
  content: string;
  loading: boolean;
  formError: string | null;
  theme: string;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AnnouncementForm: React.FC<AnnouncementFormProps> = ({
  title,
  content,
  loading,
  formError,
  theme,
  onTitleChange,
  onContentChange,
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
      placeholder="Content"
      className={`w-full mb-4 p-3 border border-primary/40 rounded-lg ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'} focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y transition-all duration-200 placeholder-gray-400 text-base shadow-sm`}
      value={content}
      onChange={(e) => onContentChange(e.target.value)}
      required
      rows={4}
      disabled={loading}
    />
    <button
      type="submit"
      className={`w-full py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 text-lg`}
    >
      Post Announcement
    </button>
  </form>
);

export default AnnouncementForm;