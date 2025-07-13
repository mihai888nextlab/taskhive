import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import VideoCallRoom from "./AgoraVideoCallRoom";

interface AgoraCredentials {
  appId: string;
  token: string;
  uid: number;
  channelName: string;
}

interface VideoCallWrapperProps {
  channelName: string;
}

const VideoCallWrapper: React.FC<VideoCallWrapperProps> = React.memo(
  ({ channelName }) => {
    const router = useRouter();
    const { isAuthenticated, loadingUser } = useAuth();

    const [credentials, setCredentials] = useState<AgoraCredentials | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchCredentials = async () => {
        if (!isAuthenticated || loadingUser) {
          return;
        }

        try {
          setLoading(true);
          setError(null);

          const response = await fetch("/api/agora/generate-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ channelName }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Failed to get video call credentials"
            );
          }

          const data = await response.json();

          if (!data.appId || !data.token) {
            throw new Error("Invalid credentials received from server");
          }

          setCredentials({
            appId: data.appId,
            token: data.token,
            uid: data.uid || 0,
            channelName,
          });

          console.log("Agora credentials fetched successfully");
        } catch (err) {
          console.error("Error fetching Agora credentials:", err);
          setError(
            err instanceof Error ? err.message : "Failed to initialize video call"
          );
        } finally {
          setLoading(false);
        }
      };

      fetchCredentials();
    }, [isAuthenticated, loadingUser, channelName]);

    // Memoize handleLeave
    const handleLeave = useCallback(() => {
      router.push("/app");
    }, [router]);

    // Loading states
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
              onClick={useCallback(() => router.push("/login"), [router])}
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
              onClick={useCallback(() => window.location.reload(), [])}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mr-2"
            >
              Retry
            </button>
            <button
              onClick={useCallback(() => router.push("/app"), [router])}
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
  }
);

export default React.memo(VideoCallWrapper);
