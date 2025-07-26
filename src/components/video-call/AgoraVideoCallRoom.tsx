import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import AgoraRTC, {
  AgoraRTCProvider,
  LocalUser,
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteUsers,
  useRTCClient,
} from "agora-rtc-react";

interface VideoCallRoomProps {
  credentials: {
    appId: string;
    token: string;
    uid: number;
    channelName: string;
  };
  onLeave: () => void;
  chatName?: string | null;
}

const VideoCallContent: React.FC<VideoCallRoomProps> = ({
  credentials,
  onLeave,
  chatName,
}) => {
  const router = useRouter();
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isJoining, setIsJoining] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Add debugging
  useEffect(() => {
    console.log("Local camera track:", localCameraTrack);
    console.log("Local microphone track:", localMicrophoneTrack);
    console.log("Camera enabled:", cameraEnabled);
    console.log("Mic enabled:", micEnabled);
  }, [localCameraTrack, localMicrophoneTrack, cameraEnabled, micEnabled]);

  useEffect(() => {
    if (isConnected) {
      console.log("Successfully connected to Agora channel");
    }
  }, [isConnected]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      //setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      //setIsFullscreen(false);
    }
  }, []);

  const getGridLayout = useCallback(() => {
    if (totalParticipants === 1) return "grid-cols-1";
    if (totalParticipants === 2) return "grid-cols-2";
    if (totalParticipants <= 4) return "grid-cols-2";
    if (totalParticipants <= 6) return "grid-cols-3";
    return "grid-cols-4";
  }, [totalParticipants]);
  const getGridRows = useCallback(() => {
    if (totalParticipants <= 2) return "grid-rows-1";
    if (totalParticipants <= 4) return "grid-rows-2";
    if (totalParticipants <= 6) return "grid-rows-2";
    return "grid-rows-3";
  }, [totalParticipants]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-ping"></div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-white text-lg font-medium">Connecting...</p>
          <p className="text-slate-400 text-sm mt-1">
            Joining {chatName ? chatName : credentials.channelName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col relative">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h1 className="text-white text-lg font-semibold tracking-tight">
              {chatName ? chatName : credentials.channelName}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-slate-300 text-sm font-medium bg-slate-800/50 px-3 py-1 rounded-full">
              {totalParticipants} participant
              {totalParticipants !== 1 ? "s" : ""}
            </div>
            <button
              onClick={toggleFullscreen}
              className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800/50"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6">
        <div
          className={`grid ${getGridLayout()} ${getGridRows()} gap-4 h-full max-w-7xl mx-auto`}
          style={{ minHeight: "calc(100vh - 200px)" }}
        >
          {/* Local User */}
          <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/30 group hover:border-slate-600/50 transition-all duration-300 min-h-[300px]">
            <LocalUser
              audioTrack={localMicrophoneTrack}
              videoTrack={localCameraTrack}
              cameraOn={cameraEnabled}
              micOn={micEnabled}
              playAudio={false}
              playVideo={cameraEnabled}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                objectFit: "cover",
              }}
            />

            {/* Fallback when camera is off or loading */}
            {(!cameraEnabled || !localCameraTrack) && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-700 z-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-slate-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-300 text-sm">
                    {!localCameraTrack ? "Loading camera..." : "Camera Off"}
                  </p>
                </div>
              </div>
            )}

            {/* User overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-20"></div>
            <div className="absolute bottom-3 left-3 flex items-center space-x-2 z-30">
              <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                You
              </div>
              <div className="flex space-x-1">
                {!micEnabled && (
                  <div className="w-6 h-6 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22zM8.5 6.146L10.354 8H10a.75.75 0 000 1.5h1.293l.957.957A2.755 2.755 0 018.5 8.207V6.146zM10 4.75a.75.75 0 00-1.5 0v.396L10 6.646V4.75z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
                {!cameraEnabled && (
                  <div className="w-6 h-6 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22zM4.5 6.5v7A1.5 1.5 0 006 15h8a1.5 1.5 0 001.5-1.5v-1.293l1.854 1.854a.5.5 0 00.853-.353V5.792a.5.5 0 00-.853-.353L15.5 7.293V6A1.5 1.5 0 0014 4.5H7.793L4.5 6.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            {/* Connection indicator */}
            <div className="absolute top-3 right-3 z-30">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>

          {/* Remote Users */}
          {remoteUsers.map((user) => (
            <div
              key={user.uid}
              className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700/30 group hover:border-slate-600/50 transition-all duration-300 min-h-[300px]"
            >
              <RemoteUser
                user={user}
                playVideo={true}
                playAudio={true}
                style={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  objectFit: "cover",
                }}
              />

              {/* Fallback when remote user camera is off */}
              {!user.hasVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-700 z-10">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-slate-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-300 text-sm">Camera Off</p>
                  </div>
                </div>
              )}

              {/* User overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-20"></div>
              <div className="absolute bottom-3 left-3 flex items-center space-x-2 z-30">
                <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                  User {user.uid}
                </div>
                <div className="flex space-x-1">
                  {!user.hasAudio && (
                    <div className="w-6 h-6 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22zM8.5 6.146L10.354 8H10a.75.75 0 000 6.646V4.75z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  {!user.hasVideo && (
                    <div className="w-6 h-6 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22zM4.5 6.5v7A1.5 1.5 0 006 15h8a1.5 1.5 0 001.5-1.5v-1.293l1.854 1.854a.5.5 0 00.853-.353V5.792a.5.5 0 00-.853-.353L15.5 7.293V6A1.5 1.5 0 0014 4.5H7.793L4.5 6.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              {/* Connection indicator */}
              <div className="absolute top-3 right-3 z-30">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black/20 backdrop-blur-sm border-t border-slate-700/50 p-6">
        <div className="flex justify-center items-center space-x-4 max-w-md mx-auto">
          <button
            onClick={handleMicToggle}
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
                <path
                  fillRule="evenodd"
                  d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22zM8.5 6.146L10.354 8H10a.75.75 0 000 1.5h1.293l.957.957A2.755 2.755 0 018.5 8.207V6.146zM10 4.75a.75.75 0 00-1.5 0v.396L10 6.646V4.75z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </button>

          <button
            onClick={handleCameraToggle}
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
                <path
                  fillRule="evenodd"
                  d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22zM4.5 6.5v7A1.5 1.5 0 006 15h8a1.5 1.5 0 001.5-1.5v-1.293l1.854 1.854a.5.5 0 00.853-.353V5.792a.5.5 0 00-.853-.353L15.5 7.293V6A1.5 1.5 0 0014 4.5H7.793L4.5 6.5z"
                  clipRule="evenodd"
                />
              )}
            </svg>
          </button>

          <button
            onClick={handleLeave}
            className="bg-red-600/90 hover:bg-red-500/90 text-white px-6 py-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-red-500/30 hover:border-red-400/50 hover:scale-105 font-medium"
          >
            Leave
          </button>
        </div>
      </div>

      <style jsx global>{`
        .agora_video_player {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }

        .agora_video_player video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          background: #1e293b;
        }
      `}</style>
    </div>
  );
};

const VideoCallRoom: React.FC<VideoCallRoomProps> = ({
  credentials,
  onLeave,
  chatName,
}) => {
  const client = useRTCClient(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" })
  );

  return (
    <AgoraRTCProvider client={client}>
      <VideoCallContent
        credentials={credentials}
        onLeave={onLeave}
        chatName={chatName}
      />
    </AgoraRTCProvider>
  );
};

export default VideoCallRoom;
