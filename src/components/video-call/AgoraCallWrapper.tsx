
import React from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import VideoCallRoom from "./AgoraVideoCallRoom";
import { useAgoraCredentials } from "../../hooks/useAgoraCredentials";

interface AgoraCredentials {
  appId: string;
  token: string;
  uid: number;
  channelName: string;
}

interface VideoCallWrapperProps {
  channelName: string;
}

const VideoCallWrapper: React.FC<VideoCallWrapperProps> = ({ channelName }) => {
  const router = useRouter();
  const { isAuthenticated, loadingUser } = useAuth();
  const { credentials, loading, error, refetch } = useAgoraCredentials(channelName, isAuthenticated, loadingUser);

  const handleLeave = () => {
    router.push("/app");
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-pulse text-blue-500 text-xl">
            Loading user data...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">
            Authentication Required
          </div>
          <p className="text-gray-400">
            You must be logged in to join video calls
          </p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Connection Error</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mr-2"
          >
            Retry
          </button>
          <button
            onClick={() => router.push("/app")}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading || !credentials) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <div className="text-blue-500 text-xl mt-4">
            Initializing video call...
          </div>
          <p className="text-gray-400 mt-2">
            Setting up connection to {channelName}
          </p>
        </div>
      </div>
    );
  }

  return <VideoCallRoom credentials={credentials} onLeave={handleLeave} />;
};

export default VideoCallWrapper;
