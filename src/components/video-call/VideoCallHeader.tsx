import React from "react";

interface HeaderProps {
  channelName: string;
  totalParticipants: number;
  onFullscreen: () => void;
}

export const VideoCallHeader: React.FC<HeaderProps> = ({ channelName, totalParticipants, onFullscreen }) => (
  <div className="bg-black/20 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <h1 className="text-white text-lg font-semibold tracking-tight">{channelName}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-slate-300 text-sm font-medium bg-slate-800/50 px-3 py-1 rounded-full">
          {totalParticipants} participant{totalParticipants !== 1 ? "s" : ""}
        </div>
        <button
          onClick={onFullscreen}
          className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800/50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);
