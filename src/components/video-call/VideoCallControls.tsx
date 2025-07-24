import React from "react";

interface ControlsProps {
  micEnabled: boolean;
  cameraEnabled: boolean;
  onMicToggle: () => void;
  onCameraToggle: () => void;
  onLeave: () => void;
}

export const VideoCallControls: React.FC<ControlsProps> = ({ micEnabled, cameraEnabled, onMicToggle, onCameraToggle, onLeave }) => (
  <div className="bg-black/20 backdrop-blur-sm border-t border-slate-700/50 p-6">
    <div className="flex justify-center items-center space-x-4 max-w-md mx-auto">
      <button
        onClick={onMicToggle}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
          micEnabled
            ? "bg-slate-700/80 hover:bg-slate-600/80 text-white"
            : "bg-red-600/90 hover:bg-red-500/90 text-white"
        } backdrop-blur-sm border border-slate-600/30 hover:border-slate-500/50 hover:scale-105`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          {micEnabled ? (
            <path d="M10 2a3 3 0 00-3 3v4a3 3 0 006 0V5a3 3 0 00-3-3zM3.5 9.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v.5A4.5 4.5 0 0010 14.5a4.5 4.5 0 004.5-4.5V9.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v.5A6.5 6.5 0 0110 16.5a6.5 6.5 0 01-6.5-6.5V9.5z" />
          ) : (
            <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22zM8.5 6.146L10.354 8H10a.75.75 0 000 1.5h1.293l.957.957A2.755 2.755 0 018.5 8.207V6.146zM10 4.75a.75.75 0 00-1.5 0v.396L10 6.646V4.75z" clipRule="evenodd" />
          )}
        </svg>
      </button>
      <button
        onClick={onCameraToggle}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
          cameraEnabled
            ? "bg-slate-700/80 hover:bg-slate-600/80 text-white"
            : "bg-red-600/90 hover:bg-red-500/90 text-white"
        } backdrop-blur-sm border border-slate-600/30 hover:border-slate-500/50 hover:scale-105`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          {cameraEnabled ? (
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          ) : (
            <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22zM4.5 6.5v7A1.5 1.5 0 006 15h8a1.5 1.5 0 001.5-1.5v-1.293l1.854 1.854a.5.5 0 00.853-.353V5.792a.5.5 0 00-.853-.353L15.5 7.293V6A1.5 1.5 0 0014 4.5H7.793L4.5 6.5z" clipRule="evenodd" />
          )}
        </svg>
      </button>
      <button
        onClick={onLeave}
        className="bg-red-600/90 hover:bg-red-500/90 text-white px-6 py-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-red-500/30 hover:border-red-400/50 hover:scale-105 font-medium"
      >
        Leave
      </button>
    </div>
  </div>
);
