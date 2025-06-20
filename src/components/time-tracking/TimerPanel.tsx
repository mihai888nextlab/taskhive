import React from "react";

interface TimerPanelProps {
  elapsedTime: number;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  theme: string;
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
}) => (
  <div className={`rounded-2xl p-6 sm:p-8 mb-8 hover:scale-[1.005] hover:shadow-2xl transition-all duration-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
    <div className="text-center mb-6">
      <h2 className={`text-4xl sm:text-5xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-mono tracking-wide`}>
        {formatTime(elapsedTime)}
      </h2>
    </div>
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

export default TimerPanel;