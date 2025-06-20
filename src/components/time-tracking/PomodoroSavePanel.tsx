import React from "react";

interface Props {
  onSave: () => void;
  message: string;
}

const PomodoroSavePanel: React.FC<Props> = ({ onSave, message }) => (
  <div className="flex flex-col items-center mb-8">
    <button
      className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold shadow hover:bg-red-700 transition-all text-lg"
      onClick={onSave}
    >
      Save Pomodoro Session
    </button>
    {message && (
      <div className="mt-3 text-red-600 font-semibold text-center">
        {message}
      </div>
    )}
  </div>
);

export default PomodoroSavePanel;