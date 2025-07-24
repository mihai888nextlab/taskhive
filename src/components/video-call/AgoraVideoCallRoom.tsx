import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import AgoraRTC, { AgoraRTCProvider, useRTCClient } from "agora-rtc-react";
import { useAgoraVideoCall } from "@/hooks/useAgoraVideoCall";
import { VideoCallHeader } from "./VideoCallHeader";
import { LocalVideo } from "./LocalVideo";
import { RemoteVideo } from "./RemoteVideo";
import { VideoCallControls } from "./VideoCallControls";

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
  const {
    micEnabled,
    cameraEnabled,
    isJoining,
    isConnected,
    remoteUsers,
    localMicrophoneTrack,
    localCameraTrack,
    totalParticipants,
    setIsJoining,
    handleLeave,
    handleMicToggle,
    handleCameraToggle,
  } = useAgoraVideoCall(credentials);

  // Get local tracks
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micEnabled);
  const { localCameraTrack } = useLocalCameraTrack(cameraEnabled);

  // Add debugging
  useEffect(() => {
    console.log("Local camera track:", localCameraTrack);
    console.log("Local microphone track:", localMicrophoneTrack);
    console.log("Camera enabled:", cameraEnabled);
    console.log("Mic enabled:", micEnabled);
  }, [localCameraTrack, localMicrophoneTrack, cameraEnabled, micEnabled]);

  // Publish local tracks
  usePublish([localMicrophoneTrack, localCameraTrack]);

  // Join the channel
  useJoin(
    {
      appid: credentials.appId,
      channel: credentials.channelName,
      token: credentials.token,
      uid: credentials.uid,
    },
    isJoining
  );

  const isConnected = useIsConnected();
  const remoteUsers = useRemoteUsers();

  const totalParticipants = remoteUsers.length + 1;

  useEffect(() => {
    if (isConnected) {
      console.log("Successfully connected to Agora channel");
    }
  }, [isConnected]);

  const handleLeave = useCallback(async () => {
    setIsJoining(false);
    if (localCameraTrack) {
      localCameraTrack.close();
    }
    if (localMicrophoneTrack) {
      localMicrophoneTrack.close();
    }
    onLeave();
  }, [localCameraTrack, localMicrophoneTrack, onLeave]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const getGridLayout = useCallback(() => {
    if (totalParticipants === 1) return "grid-cols-1";
    if (totalParticipants === 2) return "grid-cols-2";
    if (totalParticipants <= 4) return "grid-cols-2";
    if (totalParticipants <= 6) return "grid-cols-3";
    return "grid-cols-4";
  }, [totalParticipants]);
  const getGridRows = React.useCallback(() => {
    if (totalParticipants <= 2) return "grid-rows-1";
    if (totalParticipants <= 4) return "grid-rows-2";
    if (totalParticipants <= 6) return "grid-rows-2";
    return "grid-rows-3";
  }, [totalParticipants]);

  const handleMicToggle = useCallback(() => setMicEnabled((m) => !m), []);
  const handleCameraToggle = useCallback(() => setCameraEnabled((c) => !c), []);

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
          <LocalVideo
            audioTrack={localMicrophoneTrack}
            videoTrack={localCameraTrack}
            cameraOn={cameraEnabled}
            micOn={micEnabled}
          />
          {remoteUsers.map((user) => (
            <RemoteVideo key={user.uid} user={user} />
          ))}
        </div>
      </div>
      <VideoCallControls
        micEnabled={micEnabled}
        cameraEnabled={cameraEnabled}
        onMicToggle={handleMicToggle}
        onCameraToggle={handleCameraToggle}
        onLeave={() => { handleLeave(); onLeave(); }}
      />
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
