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
  <div className="flex flex-col gap-3 w-full">
    <div className="flex flex-row gap-3 w-full">
      <button
        className="flex-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all text-base min-w-[120px]"
        onClick={onExport}
      >
        Export Sessions as CSV
      </button>
      <button
        className={`flex-1 px-4 py-2 rounded-xl font-semibold shadow transition-all duration-200 min-w-[120px] text-base ${
          pomodoroMode
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-gray-200 text-gray-800 hover:bg-red-100"
        }`}
        onClick={onPomodoroToggle}
      >
        {pomodoroMode ? "Exit Pomodoro Mode" : "Pomodoro Mode"}
      </button>
    </div>
    <div className="flex w-full justify-center">
      <span className="inline-block bg-green-100 text-green-700 px-5 py-2 rounded-xl font-bold text-base shadow text-center w-full">
        🔥 Productivity Streak: {streak} day{streak !== 1 ? "s" : ""}
      </span>
    </div>
  </div>
);

export default TimeTrackingHeader;