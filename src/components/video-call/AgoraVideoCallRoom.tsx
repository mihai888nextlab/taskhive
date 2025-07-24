import React from "react";
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
}

const VideoCallContent: React.FC<VideoCallRoomProps> = React.memo(({ credentials, onLeave }) => {
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

  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const toggleFullscreen = React.useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const getGridLayout = React.useCallback(() => {
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
            Joining {credentials.channelName}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col relative">
      <VideoCallHeader
        channelName={credentials.channelName}
        totalParticipants={totalParticipants}
        onFullscreen={toggleFullscreen}
      />
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
});

const VideoCallRoom: React.FC<VideoCallRoomProps> = React.memo(({
  credentials,
  onLeave,
}) => {
  const client = useRTCClient(
    AgoraRTC.createClient({ codec: "vp8", mode: "rtc" })
  );

  return (
    <AgoraRTCProvider client={client}>
      <VideoCallContent credentials={credentials} onLeave={onLeave} />
    </AgoraRTCProvider>
  );
});

export default React.memo(VideoCallRoom);
