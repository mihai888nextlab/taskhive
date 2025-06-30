import React from "react";

interface TimerAndFormPanelProps {
  elapsedTime: number;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  theme: string;
  sessionName: string;
  sessionDescription: string;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSave: () => void;
  sessionTag: string;
  setSessionTag: (v: string) => void;
  // Pomodoro props
  pomodoroMode?: boolean;
  pomodoroPhase?: 'work' | 'break';
  pomodoroTime?: number;
  pomodoroCycles?: number;
  workDuration?: number;
  breakDuration?: number;
  persistent?: boolean;
  isAIWindowOpen?: boolean;
}

const TimerAndFormPanel: React.FC<TimerAndFormPanelProps> = ({
  elapsedTime,
  isRunning,
  onStart,
  onStop,
  onReset,
  theme,
  sessionName,
  sessionDescription,
  onNameChange,
  onDescriptionChange,
  onSave,
  sessionTag,
  setSessionTag,
  pomodoroMode = false,
  pomodoroPhase = 'work',
  pomodoroTime = 0,
  pomodoroCycles = 0,
  workDuration = 25 * 60,
  breakDuration = 5 * 60,
  persistent = false,
  isAIWindowOpen = false,
}) => {
  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };
  const tags = ["General", "Deep Work", "Meeting", "Break", "Learning"];

  // Pomodoro progress
  const totalPhase = pomodoroPhase === 'work' ? workDuration : breakDuration;
  const progress = pomodoroMode ? ((totalPhase - (pomodoroTime || 0)) / totalPhase) * 100 : 0;

  if (persistent) {
    return (
      <div className={`bg-white border border-gray-200 shadow-2xl rounded-xl transition-all duration-300 flex flex-col ${
        isAIWindowOpen ? 'p-3 gap-2' : 'p-4 gap-3'
      }`}>
        {/* Compact Timer */}
        <div className="text-center">
          {pomodoroMode ? (
            <>
              <div className={`font-bold mb-1 ${isAIWindowOpen ? 'text-xs' : 'text-sm'} ${pomodoroPhase === 'work' ? 'text-red-600' : 'text-blue-600'}`}>
                {pomodoroPhase === 'work' ? "Work" : "Break"} • Cycle {pomodoroCycles}
              </div>
              <div className={`w-full bg-gray-200 rounded-full ${isAIWindowOpen ? 'h-1.5 mb-1.5' : 'h-2 mb-2'}`}>
                <div
                  className={`${isAIWindowOpen ? 'h-1.5' : 'h-2'} rounded-full transition-all duration-300 ${pomodoroPhase === 'work' ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className={`font-mono font-bold text-gray-900 ${isAIWindowOpen ? 'text-xl mb-1.5' : 'text-2xl mb-2'}`}>
                {formatTime(pomodoroTime || 0)}
              </div>
            </>
          ) : (
            <div className={`font-mono font-bold text-gray-900 ${isAIWindowOpen ? 'text-xl mb-1.5' : 'text-2xl mb-2'}`}>
              {formatTime(elapsedTime)}
            </div>
          )}
          <div className={`flex justify-center ${isAIWindowOpen ? 'gap-1.5 mb-2' : 'gap-2 mb-3'}`}>
            <button
              onClick={onStart}
              className={`inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-green-700 text-white font-bold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-300 active:scale-95 text-xs ${
                isAIWindowOpen ? 'py-1 px-2 rounded-lg' : 'py-1 px-3 rounded-xl'
              }`}
              disabled={isRunning}
              type="button"
            >
              {isAIWindowOpen ? '▶' : 'Start'}
            </button>
            <button
              onClick={onStop}
              className={`inline-flex items-center justify-center bg-gradient-to-r from-red-500 to-red-700 text-white font-bold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-300 active:scale-95 text-xs ${
                isAIWindowOpen ? 'py-1 px-2 rounded-lg' : 'py-1 px-3 rounded-xl'
              }`}
              disabled={!isRunning}
              type="button"
            >
              {isAIWindowOpen ? '⏸' : 'Stop'}
            </button>
            <button
              onClick={onReset}
              className={`inline-flex items-center justify-center bg-gradient-to-r from-gray-500 to-gray-700 text-white font-bold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 active:scale-95 text-xs ${
                isAIWindowOpen ? 'py-1 px-2 rounded-lg' : 'py-1 px-3 rounded-xl'
              }`}
              type="button"
            >
              {isAIWindowOpen ? '↻' : 'Reset'}
            </button>
          </div>
        </div>
        {/* Compact Form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave();
          }}
          className={`flex flex-col ${isAIWindowOpen ? 'gap-1.5' : 'gap-2'}`}
        >
          <input
            type="text"
            className={`w-full border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
              isAIWindowOpen ? 'px-1.5 py-1 text-xs' : 'px-2 py-1 text-sm'
            }`}
            placeholder={isAIWindowOpen ? "Name" : "Session name"}
            value={sessionName}
            onChange={e => onNameChange(e.target.value)}
            required
          />
          <input
            type="text"
            className={`w-full border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
              isAIWindowOpen ? 'px-1.5 py-1 text-xs' : 'px-2 py-1 text-sm'
            }`}
            placeholder={isAIWindowOpen ? "Desc" : "Description"}
            value={sessionDescription}
            onChange={e => onDescriptionChange(e.target.value)}
            required
          />
          <select
            className={`w-full border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
              isAIWindowOpen ? 'px-1.5 py-1 text-xs' : 'px-2 py-1 text-sm'
            }`}
            value={sessionTag}
            onChange={e => setSessionTag(e.target.value)}
            required
          >
            <option value="">{isAIWindowOpen ? "Tag" : "Select tag"}</option>
            {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>
          <button
            type="submit"
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all ${
              isAIWindowOpen ? 'py-1.5 text-xs mt-1' : 'py-2 text-sm mt-1'
            }`}
          >
            {isAIWindowOpen ? 'Save' : 'Save Session'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-3xl shadow-2xl border border-gray-100 bg-white p-6 sm:p-8 flex flex-col gap-8 w-full max-w-xl mx-auto transition-all duration-300">
      {/* Timer at the top */}
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
            <div className="text-center mb-6">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-mono tracking-wide">
                {formatTime(pomodoroTime || 0)}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 justify-center items-center mb-2">
              <button
                onClick={onStart}
                className="inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-2 px-5 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-300 active:scale-95"
                disabled={isRunning}
                type="button"
              >
                Start
              </button>
              <button
                onClick={onStop}
                className="inline-flex items-center justify-center bg-gradient-to-r from-red-500 to-red-700 text-white font-bold py-2 px-5 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-300 active:scale-95"
                disabled={!isRunning}
                type="button"
              >
                Stop
              </button>
              <button
                onClick={onReset}
                className="inline-flex items-center justify-center bg-gradient-to-r from-gray-500 to-gray-700 text-white font-bold py-2 px-5 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 active:scale-95"
                type="button"
              >
                Reset
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center mb-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 font-mono tracking-wide mb-2">
            {formatTime(elapsedTime)}
          </h2>
          <div className="flex flex-wrap gap-3 justify-center items-center mb-2">
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-2 px-5 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-300 active:scale-95"
              disabled={isRunning}
              type="button"
            >
              Start
            </button>
            <button
              onClick={onStop}
              className="inline-flex items-center justify-center bg-gradient-to-r from-red-500 to-red-700 text-white font-bold py-2 px-5 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-300 active:scale-95"
              disabled={!isRunning}
              type="button"
            >
              Stop
            </button>
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center bg-gradient-to-r from-gray-500 to-gray-700 text-white font-bold py-2 px-5 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-300 active:scale-95"
              type="button"
            >
              Reset
            </button>
          </div>
        </div>
      )}
      {/* Session form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          onSave();
        }}
      >
        <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-6 mb-2">
          {/* Session Name */}
          <div className="flex flex-col">
            <label htmlFor="sessionName" className="block text-gray-700 text-sm font-semibold mb-1 after:content-['*'] after:ml-0.5 after:text-red-500">
              Session Name:
            </label>
            <input
              type="text"
              id="sessionName"
              className="w-full py-2 px-3 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-base shadow-sm"
              placeholder="e.g., Deep Work Sprint"
              value={sessionName}
              onChange={e => onNameChange(e.target.value)}
              required
              aria-label="Session name"
            />
          </div>
          {/* Description */}
          <div className="flex flex-col">
            <label htmlFor="sessionDescription" className="block text-gray-700 text-sm font-semibold mb-1 after:content-['*'] after:ml-0.5 after:text-red-500">
              Description:
            </label>
            <input
              type="text"
              id="sessionDescription"
              className="w-full py-2 px-3 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-base shadow-sm"
              placeholder="Add notes or context for this session..."
              value={sessionDescription}
              onChange={e => onDescriptionChange(e.target.value)}
              aria-label="Session description"
              required
            />
          </div>
          {/* Tag */}
          <div className="flex flex-col">
            <label htmlFor="sessionTag" className="block text-gray-700 text-sm font-semibold mb-1 after:content-['*'] after:ml-0.5 after:text-red-500">
              Tag:
            </label>
            <select
              id="sessionTag"
              className="w-full py-2 px-3 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 text-base shadow-sm"
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
            <span className="mr-2">
              {/* Save icon */}
              <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7.293 11.293a1 1 0 0 1 1.414 0l3-3a1 1 0 0 0-1.414-1.414L8 8.586 6.707 7.293A1 1 0 0 0 5.293 8.707l3 3z"/></svg>
            </span>
            Save Session
          </button>
        </div>
      </form>
    </div>
  );
};

export default TimerAndFormPanel;
