import { useState, useEffect, useCallback } from "react";

export interface AgoraCredentials {
  appId: string;
  token: string;
  uid: number;
  channelName: string;
}

export function useAgoraCredentials(
  channelName: string,
  isAuthenticated: boolean,
  loadingUser: boolean
) {
  const [credentials, setCredentials] = useState<AgoraCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredentials = useCallback(async () => {
    if (!isAuthenticated || loadingUser) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/agora/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get video call credentials");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize video call");
      setCredentials(null);
    } finally {
      setLoading(false);
    }
  }, [channelName, isAuthenticated, loadingUser]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  return {
    credentials,
    loading,
    error,
    refetch: fetchCredentials,
  };
}
