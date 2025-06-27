// components/AgoraVideoCall.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth"; // Your authentication hook

// Import hooks and components from agora-rtc-react
import AgoraRTC, {
  AgoraRTCProvider,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  useRemoteUsers,
  usePublish,
  useJoin,
  LocalVideoTrack,
  RemoteUser,
} from "agora-rtc-react";

// 1. Create your Agora client instance outside the component
// This client instance will be provided to the entire Agora context.
const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

interface AgoraVideoCallProps {
  channelName: string; // The Agora channel name
}

// --- NEW INNER COMPONENT: AgoraCallContent ---
// This component will contain all the Agora-specific hooks
const AgoraCallContent: React.FC<AgoraVideoCallProps> = ({ channelName }) => {
  const router = useRouter();
  const { user, isAuthenticated, loadingUser } = useAuth(); // Re-use auth for sanity, though main check is in outer comp

  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null); // Initialize with null directly

  // Agora Hooks - These MUST be called inside a component wrapped by AgoraRTCProvider
  const {
    localCameraTrack,
    isLoading: cameraLoading,
    error: cameraError,
  } = useLocalCameraTrack();
  const {
    localMicrophoneTrack,
    isLoading: micLoading,
    error: micError,
  } = useLocalMicrophoneTrack();

  const tracksReady =
    !cameraLoading &&
    !micLoading &&
    localCameraTrack !== undefined &&
    localMicrophoneTrack !== undefined;
  const tracksError = cameraError || micError;

  const remoteUsers = useRemoteUsers(agoraClient); // Pass the client instance here

  usePublish([localMicrophoneTrack, localCameraTrack]);

  const [token, setToken] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [uid, setUid] = useState<number | string | null>(null);

  // Effect to fetch token and prepare join when tracks are ready
  useEffect(() => {
    const fetchTokenAndPrepareJoin = async () => {
      // Don't proceed if already joined, or missing critical auth/channel info
      if (
        isJoined ||
        !isAuthenticated ||
        loadingUser ||
        !channelName ||
        !tracksReady
      ) {
        return;
      }
      // If token/appId already fetched, no need to refetch unless forcing a new session
      if (token && appId) return;

      setError(null); // Clear previous errors

      try {
        const tokenResponse = await fetch("/api/agora/generate-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelName }),
        });

        if (!tokenResponse.ok) {
          const errData = await tokenResponse.json();
          throw new Error(errData.message || "Failed to get Agora token.");
        }

        const data = await tokenResponse.json();
        setToken(data.token);
        setAppId(data.appId);
        setUid(data.uid);
        console.log("Token, App ID, UID fetched:", data);
      } catch (err: any) {
        console.error("Error fetching Agora token:", err);
        setError(err.message || "Failed to initialize video call.");
      }
    };

    fetchTokenAndPrepareJoin();
  }, [
    isAuthenticated,
    loadingUser,
    channelName,
    tracksReady,
    isJoined,
    token,
    appId,
  ]); // Depend on token/appId to prevent refetch

  // useJoin hook for connecting to the Agora channel
  // The 'ready' condition is crucial here: join only when we have all credentials.
  useJoin(
    {
      appid: appId || "",
      channel: channelName,
      token: token,
      uid: uid || 0,
    },
    !!appId && !!token
  ); // Condition: only join when both appId and token are non-null

  // Agora client event listeners
  useEffect(() => {
    // Define named functions for event handlers for proper cleanup
    const handleConnectionStateChange = (
      curState: string,
      prevState: string
    ) => {
      console.log("Connection state changed:", curState, prevState);
      if (curState === "CONNECTED") {
        console.log("Successfully joined channel!");
        setIsJoined(true);
        setError(null);
      } else if (curState === "DISCONNECTED" && prevState === "CONNECTED") {
        console.log("Left channel.");
        setIsJoined(false);
        // Explicitly close tracks here to ensure cleanup even if component doesn't unmount immediately
        if (localMicrophoneTrack) localMicrophoneTrack.close();
        if (localCameraTrack) localCameraTrack.close();
        router.push("/dashboard"); // Redirect after leaving
      }
    };

    const handleClientError = (err: any) => {
      console.error("Agora client error:", err);
      setError(`Agora Error: ${err.message || err.code}`);
    };

    agoraClient.on("connection-state-change", handleConnectionStateChange);
    agoraClient.on("error", handleClientError);

    // Cleanup listeners when component unmounts or dependencies change
    return () => {
      agoraClient.off("connection-state-change", handleConnectionStateChange);
      agoraClient.off("error", handleClientError);

      // Also ensure tracks are closed if component unmounts directly
      if (localMicrophoneTrack) localMicrophoneTrack.close();
      if (localCameraTrack) localCameraTrack.close();
    };
  }, [agoraClient, router, localMicrophoneTrack, localCameraTrack]); // Add AgoraClient, router, and tracks to dependencies

  // Manual leave function for the button
  const leaveCall = useCallback(async () => {
    if (agoraClient && isJoined) {
      try {
        await agoraClient.leave();
        console.log("Explicitly left the call.");
        setIsJoined(false); // Update state to reflect leaving
        // The connection-state-change listener will handle redirect
      } catch (err) {
        console.error("Error leaving Agora call:", err);
        setError("Failed to leave call gracefully.");
      }
    }
  }, [agoraClient, isJoined]);

  // --- Render Loading/Error States specific to Agora interaction ---
  if (tracksError) {
    return (
      <div className="text-center text-red-500 py-8">
        Error accessing mic/camera: {tracksError.message}
      </div>
    );
  }

  if (cameraLoading || micLoading) {
    return (
      <div className="text-center py-8 text-blue-600">
        Requesting microphone and camera permissions...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">Error: {error}</div>;
  }

  if (!isJoined && (!token || !appId)) {
    return (
      <div className="text-center py-8 text-blue-600">
        Initializing call and fetching token...
      </div>
    );
  }

  // --- Main Content Render ---
  return (
    <div className="relative w-full h-[calc(100vh-100px)] bg-gray-900 rounded-lg shadow-lg flex flex-col p-4">
      <h2 className="text-xl font-semibold text-white mb-4">
        Video Call: {channelName}
      </h2>
      <p className="text-white mb-4">
        Status: {isJoined ? "Joined" : "Connecting..."}
      </p>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
        {/* Local user video */}
        {localCameraTrack && (
          <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center text-white">
            <LocalVideoTrack
              track={localCameraTrack}
              play={true}
              className="w-full h-full object-cover"
            />
            <p className="absolute bottom-2 left-2 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              You
            </p>
          </div>
        )}

        {/* Remote users video/audio */}
        {remoteUsers.map((user) => (
          <div
            key={user.uid}
            className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center text-white"
          >
            <RemoteUser
              user={user}
              playVideo={true}
              playAudio={true}
              className="w-full h-full object-cover"
            />
            <p className="absolute bottom-2 left-2 text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              User {user.uid}
            </p>
          </div>
        ))}
      </div>

      {/* Call controls */}
      <div className="flex justify-center p-4 bg-gray-800 rounded-b-lg">
        <button
          onClick={leaveCall}
          className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200"
        >
          Leave Call
        </button>
        {/* Mute/unmute controls */}
        {localMicrophoneTrack && (
          <button
            onClick={() => {
              localMicrophoneTrack.setMuted(!localMicrophoneTrack.muted);
              console.log(
                `Mic ${localMicrophoneTrack.muted ? "muted" : "unmuted"}`
              );
            }}
            className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 ml-4"
          >
            {localMicrophoneTrack.muted ? "Unmute Mic" : "Mute Mic"}
          </button>
        )}
        {localCameraTrack && (
          <button
            onClick={() => {
              localCameraTrack.setMuted(!localCameraTrack.muted);
              console.log(`Camera ${localCameraTrack.muted ? "off" : "on"}`);
            }}
            className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 ml-2"
          >
            {localCameraTrack.muted ? "Video On" : "Video Off"}
          </button>
        )}
      </div>
    </div>
  );
};

// --- OUTER COMPONENT: AgoraVideoCall ---
// This component handles the initial setup and wraps AgoraCallContent with AgoraRTCProvider
const AgoraVideoCall: React.FC<AgoraVideoCallProps> = ({ channelName }) => {
  const { isAuthenticated, loadingUser } = useAuth();

  // Handle initial loading and authentication checks
  if (loadingUser) {
    return (
      <div className="text-center py-8 text-gray-700">Loading user data...</div>
    );
  }

  if (!isAuthenticated) {
    // Optionally redirect here if not authenticated
    return (
      <div className="text-center text-red-500 py-8">
        You must be logged in to access video calls.
      </div>
    );
  }

  // Once authenticated and loaded, render the provider and the content component
  return (
    <AgoraRTCProvider client={agoraClient}>
      <AgoraCallContent channelName={channelName} />
    </AgoraRTCProvider>
  );
};

export default AgoraVideoCall;
