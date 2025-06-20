import React from "react";
import { FaSave } from "react-icons/fa";

interface SessionFormProps {
  sessionName: string;
  sessionDescription: string;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSave: () => void;
  theme: string;
  sessionTag: string;
  setSessionTag: (v: string) => void;
}

const SessionForm: React.FC<SessionFormProps> = ({
  sessionName,
  sessionDescription,
  onNameChange,
  onDescriptionChange,
  onSave,
  theme,
  sessionTag,
  setSessionTag,
}) => {
  const tags = ["General", "Deep Work", "Meeting", "Break", "Learning"];

  return (
    <div className="transition-all duration-500 ease-in-out py-4">
      <div
        className={`bg-${theme === 'light' ? 'gray-50' : 'gray-800'} p-4 md:p-6 rounded-2xl shadow-xl border border-gray-200 animate-fadeIn`}
      >
        <h2 className={`text-2xl font-bold text-${theme === 'light' ? 'gray-800' : 'white'} mb-4 text-center`}>
          Log a New Session
        </h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave();
          }}
        >
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="sessionName" className={`block text-${theme === 'light' ? 'gray-700' : 'gray-300'} text-sm font-semibold mb-1 after:content-['*'] after:ml-0.5 after:text-red-500`}>
                Session Name:
              </label>
              <input
                type="text"
                id="sessionName"
                className={`w-full py-2 px-3 bg-${theme === 'light' ? 'white' : 'gray-700'} border border-gray-300 rounded-lg text-${theme === 'light' ? 'gray-800' : 'white'} focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-base`}
                placeholder="e.g., Deep Work Sprint"
                value={sessionName}
                onChange={e => onNameChange(e.target.value)}
                required
                aria-label="Session name"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="sessionDescription" className={`block text-${theme === 'light' ? 'gray-700' : 'gray-300'} text-sm font-semibold mb-1`}>
                Description (Optional):
              </label>
              <input
                type="text"
                id="sessionDescription"
                className={`w-full py-2 px-3 bg-${theme === 'light' ? 'white' : 'gray-700'} border border-gray-300 rounded-lg text-${theme === 'light' ? 'gray-800' : 'white'} focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-base`}
                placeholder="Add notes or context for this session..."
                value={sessionDescription}
                onChange={e => onDescriptionChange(e.target.value)}
                aria-label="Session description"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="sessionTag" className={`block text-${theme === 'light' ? 'gray-700' : 'gray-300'} text-sm font-semibold mb-1 after:content-['*'] after:ml-0.5 after:text-red-500`}>
                Tag:
              </label>
              <select
                id="sessionTag"
                className={`w-full py-2 px-3 bg-${theme === 'light' ? 'white' : 'gray-700'} border border-gray-300 rounded-lg text-${theme === 'light' ? 'gray-800' : 'white'} focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-base`}
                value={sessionTag}
                onChange={e => setSessionTag(e.target.value)}
                required
              >
                <option value="">Select tag</option>
                {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-2 px-5 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 text-base"
            >
              <FaSave className="mr-2" />
              Save Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionForm;