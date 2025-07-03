import React from "react";
import { FaPlay, FaPause, FaStop, FaTimes } from "react-icons/fa";
import { useTheme } from "@/components/ThemeContext";

interface PersistentTimerProps {
  elapsedTime: number;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onClose: () => void;
  // Pomodoro props
  pomodoroMode?: boolean;
  pomodoroPhase?: 'work' | 'break';
  pomodoroTime?: number;
  pomodoroCycles?: number;
  workDuration?: number;
  breakDuration?: number;
  inSidebar?: boolean;
}

const PersistentTimer: React.FC<PersistentTimerProps> = ({
  elapsedTime,
  isRunning,
  onStart,
  onStop,
  onReset,
  onClose,
  pomodoroMode = false,
  pomodoroPhase = 'work',
  pomodoroTime = 0,
  pomodoroCycles = 0,
  workDuration = 25 * 60,
  breakDuration = 5 * 60,
  inSidebar = false,
}) => {
  const { theme } = useTheme();

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Pomodoro progress
  const totalPhase = pomodoroPhase === 'work' ? workDuration : breakDuration;
  const progress = pomodoroMode ? ((totalPhase - (pomodoroTime || 0)) / totalPhase) * 100 : 0;

  if (inSidebar) {
    return (
      <div className="p-3 m-3 bg-gray-800 rounded-xl border border-gray-700">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-lg transition-all duration-200 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
        >
          <FaTimes className="w-3 h-3" />
        </button>

        {/* Pomodoro info */}
        {pomodoroMode && (
          <div className="text-center mb-3">
            <div className={`text-xs font-medium mb-2 ${pomodoroPhase === 'work' ? 'text-red-400' : 'text-blue-400'}`}>
              {pomodoroPhase === 'work' ? "Work" : "Break"} • Cycle {pomodoroCycles}
            </div>
            <div className="w-full rounded-full h-1.5 mb-2 bg-gray-600">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${pomodoroPhase === 'work' ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Timer display */}
        <div className="text-center mb-3">
          <div className="text-xl font-mono font-bold text-white">
            {formatTime(pomodoroMode ? (pomodoroTime || 0) : elapsedTime)}
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex justify-center gap-1">
          <button
            onClick={onStart}
            disabled={isRunning}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              isRunning
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <FaPlay className="w-2 h-2" />
            Start
          </button>
          <button
            onClick={onStop}
            disabled={!isRunning}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              !isRunning
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <FaPause className="w-2 h-2" />
            Stop
          </button>
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 bg-gray-600 text-white hover:bg-gray-700"
          >
            <FaStop className="w-2 h-2" />
            Reset
          </button>
        </div>
      </div>
    );
  }

  // Original floating timer (fallback)
  return (
    <div className={`fixed bottom-4 left-6 z-40 rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="p-4 relative flex flex-col items-center justify-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20'
              : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <FaTimes className="w-3 h-3" />
        </button>

        {/* Pomodoro info */}
        {pomodoroMode && (
          <div className="text-center mb-3 w-full">
            <div className={`text-xs font-medium mb-2 ${pomodoroPhase === 'work' ? 'text-red-600' : 'text-blue-600'}`}>
              {pomodoroPhase === 'work' ? "Work" : "Break"} • Cycle {pomodoroCycles}
            </div>
            <div className={`w-full rounded-full h-1.5 mb-2 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}>
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${pomodoroPhase === 'work' ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Timer display */}
        <div className="text-center mb-4 w-full">
          <div className={`text-2xl font-mono font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatTime(pomodoroMode ? (pomodoroTime || 0) : elapsedTime)}
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex justify-center gap-2 w-full">
          <button
            onClick={onStart}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 shadow-sm ${
              isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
                  : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-md'
            }`}
          >
            <FaPlay className="w-2.5 h-2.5" />
            Start
          </button>
          <button
            onClick={onStop}
            disabled={!isRunning}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 shadow-sm ${
              !isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : theme === 'dark'
                  ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md'
                  : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-md'
            }`}
          >
            <FaPause className="w-2.5 h-2.5" />
            Stop
          </button>
          <button
            onClick={onReset}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 shadow-sm ${
              theme === 'dark'
                ? 'bg-gray-600 text-white hover:bg-gray-700 hover:shadow-md'
                : 'bg-gray-500 text-white hover:bg-gray-600 hover:shadow-md'
            }`}
          >
            <FaStop className="w-2.5 h-2.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersistentTimer;