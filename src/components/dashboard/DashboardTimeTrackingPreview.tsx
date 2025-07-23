import React from "react";
import { FaClock } from "react-icons/fa";

interface Session {
  name: string;
  duration: number;
  tag?: string;
}

interface DashboardTimeTrackingPreviewProps {
  streak: number;
  sessions?: Session[];
  theme: string;
  t: any;
}

const DashboardTimeTrackingPreview: React.FC<DashboardTimeTrackingPreviewProps> = ({ streak, sessions = [], theme, t }) => {
  const displayedSessions = sessions.slice(0, 2);
  return (
    <div>
      {streak === null ? (
        <div className="flex flex-col justify-center items-center h-32 bg-primary-light/10 rounded-lg animate-pulse">
          <FaClock className="animate-spin text-primary text-4xl mb-3" />
          <p className="text-sm font-medium">{t("loadingTimeTracking", { default: "Loading time tracking..." })}</p>
        </div>
      ) : streak === 0 || displayedSessions.length === 0 ? (
        <div className="text-center py-16">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <FaClock className="text-2xl text-gray-400" />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t("noSessionsYet", { default: "No sessions yet." })}</h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t("startTracking", { default: "Start tracking your time to see your streak and sessions." })}</p>
        </div>
      ) : (
        <ul className="space-y-5">
          {displayedSessions.map((session, idx) => (
            <li key={idx} className={`relative flex items-start justify-between p-5 rounded-xl shadow-sm group cursor-pointer transition-all duration-200 border-l-4 border-blue-500 bg-transparent`}>
              <div className="flex-1 pr-4 relative z-10">
                <span className={`leading-tight font-bold flex items-center gap-2 text-lg text-blue-700`}>
                  <FaClock className="inline-block mr-1 text-blue-500 text-lg align-middle" />
                  {session.name}
                  {/* Show session type as a tag, like in TaskPreview */}
                  {session.tag && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full ml-2">
                      {session.tag}
                    </span>
                  )}
                </span>
                <p className={`mt-3 text-xs flex items-center gap-2 text-blue-700`}>
                  {t("lastSessionDuration", { default: "Duration" })}: {Math.round(session.duration / 60)} min
                </p>
              </div>
              <div className="self-center pl-3 relative z-10">
                <FaClock className="text-2xl text-blue-500" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default React.memo(DashboardTimeTrackingPreview);
