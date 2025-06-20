import React from "react";

interface TimerPanelProps {
  elapsedTime: number;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  theme: string;
  // Pomodoro-specific
  pomodoroMode?: boolean;
  pomodoroPhase?: 'work' | 'break';
  pomodoroTime?: number;
  pomodoroCycles?: number;
  workDuration?: number;
  breakDuration?: number;
}

const formatTime = (timeInSeconds: number) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const TimerPanel: React.FC<TimerPanelProps> = ({
  elapsedTime,
  isRunning,
  onStart,
  onStop,
  onReset,
  theme,
  pomodoroMode = false,
  pomodoroPhase = 'work',
  pomodoroTime = 0,
  pomodoroCycles = 0,
  workDuration = 25 * 60,
  breakDuration = 5 * 60,
}) => {
  // For Pomodoro progress bar
  const totalPhase = pomodoroPhase === 'work' ? workDuration : breakDuration;
  const progress = pomodoroMode ? ((totalPhase - (pomodoroTime || 0)) / totalPhase) * 100 : 0;

  return (
    <div className={`rounded-2xl p-6 sm:p-8 mb-2 hover:scale-[1.005] hover:shadow-2xl transition-all duration-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
      {pomodoroMode ? (
        <>
          <div className="mb-4 text-center">
            <div className={`text-lg font-bold mb-2 ${pomodoroPhase === 'work' ? 'text-red-600' : 'text-blue-600'}`}>
              {pomodoroPhase === 'work' ? "Pomodoro: Work" : "Pomodoro: Break"}
            </div>
            <div className="mb-2">
              <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold text-sm">
                Cycles: {pomodoroCycles}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${pomodoroPhase === 'work' ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className={`text-4xl sm:text-5xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-mono tracking-wide`}>
              {formatTime(pomodoroTime || 0)}
            </h2>
          </div>
        </>
      ) : (
        <div className="text-center mb-6">
          <h2 className={`text-4xl sm:text-5xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-mono tracking-wide`}>
            {formatTime(elapsedTime)}
          </h2>
        </div>
      )}
      <div className="flex flex-wrap gap-3 justify-center items-center mb-4">
        <button
          onClick={onStart}
          className={`inline-flex items-center justify-center ${theme === 'dark' ? 'bg-green-600' : 'bg-gradient-to-r from-green-500 to-green-700'} text-white font-bold py-2 px-5 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-300 active:scale-95`}
          disabled={isRunning}
        >
          Start
        </button>
        <button
          onClick={onStop}
          className={`inline-flex items-center justify-center ${theme === 'dark' ? 'bg-red-600' : 'bg-gradient-to-r from-red-500 to-red-700'} text-white font-bold py-2 px-5 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-300 active:scale-95`}
          disabled={!isRunning}
        >
          Stop
        </button>
        <button
          onClick={onReset}
          className={`inline-flex items-center justify-center ${theme === 'dark' ? 'bg-gray-600' : 'bg-gradient-to-r from-gray-500 to-gray-700'} text-white font-bold py-2 px-5 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 active:scale-95`}
        >
          Reset
        </button>
      </div>
    </div>
    
  );
};

export default TimerPanel;
