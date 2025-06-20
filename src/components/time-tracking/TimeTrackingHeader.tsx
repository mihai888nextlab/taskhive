import React from "react";

interface Props {
  theme: string;
  streak: number;
  pomodoroMode: boolean;
  onExport: () => void;
  onPomodoroToggle: () => void;
}

const TimeTrackingHeader: React.FC<Props> = ({
  theme,
  streak,
  pomodoroMode,
  onExport,
  onPomodoroToggle,
}) => (
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
    <div className="flex flex-wrap gap-3 items-center">
      <button
        className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all"
        onClick={onExport}
      >
        Export Sessions as CSV
      </button>
      <button
        className={`px-4 py-2 rounded-full font-semibold shadow transition-all duration-200 ${
          pomodoroMode
            ? "bg-red-600 text-white"
            : "bg-gray-200 text-gray-800 hover:bg-red-100"
        }`}
        onClick={onPomodoroToggle}
      >
        {pomodoroMode ? "Exit Pomodoro Mode" : "Pomodoro Mode"}
      </button>
    </div>
    <div className="flex justify-center md:justify-end">
      <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-lg shadow">
        🔥 Productivity Streak: {streak} day{streak !== 1 ? "s" : ""}
      </span>
    </div>
  </div>
);

export default TimeTrackingHeader;