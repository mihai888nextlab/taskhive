import React from "react";
import { LocalUser } from "agora-rtc-react";

interface LocalVideoProps {
  audioTrack: any;
  videoTrack: any;
  cameraOn: boolean;
  micOn: boolean;
}

export const LocalVideo: React.FC<LocalVideoProps> = ({ audioTrack, videoTrack, cameraOn, micOn }) => (
  <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/30 group hover:border-slate-600/50 transition-all duration-300 min-h-[300px]">
    <LocalUser
      audioTrack={audioTrack}
      videoTrack={videoTrack}
      cameraOn={cameraOn}
      micOn={micOn}
      playAudio={false}
      playVideo={cameraOn}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        objectFit: "cover",
      }}
    />
    {(!cameraOn || !videoTrack) && (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-700 z-10">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-slate-300 text-sm">{!videoTrack ? "Loading camera..." : "Camera Off"}</p>
        </div>
      </div>
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-20"></div>
    <div className="absolute bottom-3 left-3 flex items-center space-x-2 z-30">
      <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">You</div>
      <div className="flex space-x-1">
        {!micOn && (
          <div className="w-6 h-6 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22zM8.5 6.146L10.354 8H10a.75.75 0 000 1.5h1.293l.957.957A2.755 2.755 0 018.5 8.207V6.146zM10 4.75a.75.75 0 00-1.5 0v.396L10 6.646V4.75z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {!cameraOn && (
          <div className="w-6 h-6 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22zM4.5 6.5v7A1.5 1.5 0 006 15h8a1.5 1.5 0 001.5-1.5v-1.293l1.854 1.854a.5.5 0 00.853-.353V5.792a.5.5 0 00-.853-.353L15.5 7.293V6A1.5 1.5 0 0014 4.5H7.793L4.5 6.5z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </div>
    <div className="absolute top-3 right-3 z-30">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
    </div>
  </div>
);
