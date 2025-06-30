import React from "react";
import { FaTrash } from "react-icons/fa";

interface Session {
  _id: string;
  name: string;
  description: string;
  duration: number;
  createdAt?: string;
  tag?: string;
  cycles?: number; // <-- add this
}

interface SessionListProps {
  sessions: Session[];
  onDelete: (id: string) => void;
  theme: string;
  // Add controls state and handlers
  sessionSearch: string;
  setSessionSearch: (v: string) => void;
  sessionTagFilter: string;
  setSessionTagFilter: (v: string) => void;
  sessionSort: string;
  setSessionSort: (v: string) => void;
}

const formatTime = (timeInSeconds: number) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const tagColors: Record<string, string> = {
  Pomodoro: "bg-red-500",
  Tasks: "bg-blue-600", // Add Tasks tag color
  "Deep Work": "bg-blue-500",
  Meeting: "bg-green-500",
  Break: "bg-yellow-500",
  Learning: "bg-purple-500",
  General: "bg-gray-400",
};

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  onDelete,
  theme,
  sessionSearch,
  setSessionSearch,
  sessionTagFilter,
  setSessionTagFilter,
  sessionSort,
  setSessionSort,
}) => {
  // Filtering and sorting logic inside SessionList
  const getDate = (d?: string) => d ? new Date(d).getTime() : 0;
  const filteredSessions = sessions.filter(s => {
    const matchesSearch =
      sessionSearch.trim() === "" ||
      s.name?.toLowerCase().includes(sessionSearch.toLowerCase()) ||
      s.description?.toLowerCase().includes(sessionSearch.toLowerCase());
    const matchesTag =
      sessionTagFilter === "all" || (s.tag || "General") === sessionTagFilter;
    return matchesSearch && matchesTag;
  }).sort((a, b) => {
    if (sessionSort === "dateDesc") {
      return getDate(b.createdAt) - getDate(a.createdAt);
    } else if (sessionSort === "dateAsc") {
      return getDate(a.createdAt) - getDate(b.createdAt);
    } else if (sessionSort === "durationDesc") {
      return b.duration - a.duration;
    } else if (sessionSort === "durationAsc") {
      return a.duration - b.duration;
    }
    return 0;
  });

  return (
    <div className={`rounded-2xl shadow-xl p-6 sm:p-8 my-3 hover:scale-[1.005] hover:shadow-2xl transition-all duration-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-4 border-b-2 border-blue-200 pb-2`}>
        Saved Sessions
      </h2>
      {/* Controls bar below title, above cards */}
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between flex-wrap gap-4 mb-4 p-4 rounded-2xl shadow-sm bg-gray-50/80 border border-gray-100 box-border">
        <input
          type="text"
          placeholder="Search sessions..."
          value={sessionSearch}
          onChange={e => setSessionSearch(e.target.value)}
          className="flex-1 min-w-[120px] max-w-xs px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base placeholder-gray-400 outline-none"
        />
        <select
          value={sessionTagFilter}
          onChange={e => setSessionTagFilter(e.target.value)}
          className="w-full md:w-auto px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base outline-none"
        >
          <option value="all">Tag: All</option>
          <option value="Pomodoro">Pomodoro</option>
          <option value="Tasks">Tasks</option>
          <option value="Deep Work">Deep Work</option>
          <option value="Meeting">Meeting</option>
          <option value="Break">Break</option>
          <option value="Learning">Learning</option>
          <option value="General">General</option>
        </select>
        <select
          value={sessionSort}
          onChange={e => setSessionSort(e.target.value)}
          className="w-full md:w-auto px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-base outline-none"
        >
          <option value="dateDesc">Sort: Newest First</option>
          <option value="dateAsc">Sort: Oldest First</option>
          <option value="durationDesc">Sort: Longest Duration</option>
          <option value="durationAsc">Sort: Shortest Duration</option>
        </select>
      </div>
      <ul className="space-y-4 max-h-[580px] overflow-y-auto pr-2">
        {filteredSessions.length === 0 ? (
          <p className={`text-gray-600 italic text-center py-4 ${theme === 'dark' ? 'text-gray-400' : ''}`}>No sessions saved yet.</p>
        ) : (
          filteredSessions.map((session) => (
            <li
              key={session._id}
              className={`p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'} hover:border-blue-200 transition-transform transform hover:scale-101 hover:shadow-md transition-all duration-200`}
            >
              <div className="flex-1 mb-2 sm:mb-0">
                <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{session.name}</p>
                <p className={`text-md ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{session.description}</p>
                {session.createdAt && (
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                    Saved on: {new Date(session.createdAt).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex items-center">
                {session.tag === "Pomodoro" ? (
                  <span className="text-lg font-mono text-red-500 font-bold mr-4">
                    {session.cycles ?? 1} cycle{(session.cycles ?? 1) > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className={`text-2xl font-mono ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'} font-bold mr-4`}>
                    {formatTime(session.duration)}
                  </span>
                )}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${tagColors[session.tag ?? "General"] || 'bg-gray-400'}`}>
                  {session.tag || "General"}
                </span>
                <button
                  onClick={() => onDelete(session._id)}
                  className={`text-red-500 hover:text-red-700 p-3 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors active:scale-95`}
                  title="Delete Session"
                >
                  <FaTrash className="text-lg" />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default SessionList;