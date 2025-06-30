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
// import { AgoraCredentials } from '@/types/agora';

interface VideoCallRoomProps {
  credentials: {
    appId: string;
    token: string;
    uid: number;
    channelName: string;
  };
  onLeave: () => void;
}

const VideoCallContent: React.FC<VideoCallRoomProps> = ({
  credentials,
  onLeave,
}) => {
  const router = useRouter();
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isJoining, setIsJoining] = useState(true);

  // Get local tracks
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micEnabled);
  const { localCameraTrack } = useLocalCameraTrack(cameraEnabled);

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

  useEffect(() => {
    if (isConnected) {
      console.log("Successfully connected to Agora channel");
    }
  }, [isConnected]);

  const handleLeave = useCallback(async () => {
    setIsJoining(false);
    // Close local tracks
    if (localCameraTrack) {
      localCameraTrack.close();
    }
    if (localMicrophoneTrack) {
      localMicrophoneTrack.close();
    }
    onLeave();
  }, [localCameraTrack, localMicrophoneTrack, onLeave]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        <p className="text-white mt-4 text-lg">Connecting to video call...</p>
        <p className="text-gray-400 text-sm mt-2">
          Channel: {credentials.channelName}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-semibold">
          Video Call - {credentials.channelName}
        </h1>
        <div className="text-gray-400 text-sm">
          {remoteUsers.length + 1} participant
          {remoteUsers.length !== 0 ? "s" : ""}
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          {/* Local User */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
            <LocalUser
              audioTrack={localMicrophoneTrack}
              videoTrack={localCameraTrack}
              cameraOn={cameraEnabled}
              micOn={micEnabled}
              playAudio={false}
              className="w-full h-full"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              You {!micEnabled && "🔇"} {!cameraEnabled && "📷"}
            </div>
          </div>

          {/* Remote Users */}
          {remoteUsers.map((user) => (
            <div
              key={user.uid}
              className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video"
            >
              <RemoteUser user={user} className="w-full h-full" />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                User {user.uid}
                {!user.hasAudio && " 🔇"}
                {!user.hasVideo && " 📷"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setMicEnabled(!micEnabled)}
            className={`p-3 rounded-full ${
              micEnabled
                ? "bg-gray-600 hover:bg-gray-500"
                : "bg-red-600 hover:bg-red-500"
            } text-white transition-colors`}
          >
            {micEnabled ? "🎤" : "🔇"}
          </button>

          <button
            onClick={() => setCameraEnabled(!cameraEnabled)}
            className={`p-3 rounded-full ${
              cameraEnabled
                ? "bg-gray-600 hover:bg-gray-500"
                : "bg-red-600 hover:bg-red-500"
            } text-white transition-colors`}
          >
            {cameraEnabled ? "📹" : "📷"}
          </button>

          <button
            onClick={handleLeave}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition-colors"
          >
            Leave Call
          </button>
        </div>
      </div>
    </div>
  );
};

const VideoCallRoom: React.FC<VideoCallRoomProps> = ({
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
};

export default VideoCallRoom;
