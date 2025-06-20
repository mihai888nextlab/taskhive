import React from "react";

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
    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 justify-center items-center mb-8">
      <input
        type="text"
        value={sessionName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Session Name"
        className={`w-full sm:w-auto flex-grow px-4 py-2 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
      />
      <input
        type="text"
        value={sessionDescription}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="Session Description"
        className={`w-full sm:w-auto flex-grow px-4 py-2 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
      />
      <select
        value={sessionTag}
        onChange={e => setSessionTag(e.target.value)}
        className={`w-full sm:w-auto flex-grow px-4 py-2 border ${theme === 'dark' ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200`}
      >
        <option value="">Select tag</option>
        {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
      </select>
      <button
        onClick={onSave}
        className={`w-full sm:w-auto inline-flex items-center justify-center ${theme === 'dark' ? 'bg-blue-600' : 'bg-gradient-to-r from-blue-500 to-blue-700'} text-white font-bold py-2 px-5 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 active:scale-95`}
      >
        Save Session
      </button>
    </div>
  );
};

export default SessionForm;