import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useIsConnected,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";

export function useAgoraVideoCall(credentials: {
  appId: string;
  token: string;
  uid: number;
  channelName: string;
}) {
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isJoining, setIsJoining] = useState(true);

  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micEnabled);
  const { localCameraTrack } = useLocalCameraTrack(cameraEnabled);

  usePublish([localMicrophoneTrack, localCameraTrack]);

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
  const totalParticipants = useMemo(() => remoteUsers.length + 1, [remoteUsers]);

  const handleLeave = useCallback(() => {
    setIsJoining(false);
    if (localCameraTrack) localCameraTrack.close();
    if (localMicrophoneTrack) localMicrophoneTrack.close();
  }, [localCameraTrack, localMicrophoneTrack]);

  const handleMicToggle = useCallback(() => setMicEnabled((m) => !m), []);
  const handleCameraToggle = useCallback(() => setCameraEnabled((c) => !c), []);

  return {
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
  };
}
