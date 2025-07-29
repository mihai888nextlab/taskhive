
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { urlBase64ToUint8Array } from "@/utils/webPushUtils";

interface PushNotificationManagerProps {}

const PushNotificationManager: React.FC<PushNotificationManagerProps> = () => {
  const { user, isAuthenticated, loadingUser } = useAuth();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  const registerServiceWorker = useCallback(async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration =
          await navigator.serviceWorker.register("/service-worker.js");
        console.log("Service Worker registered successfully:", registration);
        return registration;
      } catch (err) {
        console.error("Service Worker registration failed:", err);
        setError("Failed to register push service.");
        return null;
      }
    } else {
      console.warn("Service Workers are not supported in this browser.");
      setError("Push notifications not supported by your browser.");
      return null;
    }
  }, []);

  const subscribeToPush = useCallback(async () => {
    if (!VAPID_PUBLIC_KEY) {
      setError("VAPID Public Key is not configured.");
      return;
    }
    if (!isAuthenticated || !user?._id) {
      setError("User not authenticated. Cannot subscribe.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const registration = await registerServiceWorker();
      if (!registration) return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Notification permission denied.");
        setPermissionGranted(false);
        setLoading(false);
        return;
      }
      setPermissionGranted(true);

      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      console.log("Push Subscription created:", subscription);

      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user._id}`,
        },
        body: JSON.stringify(subscription),
      });

      if (res.ok) {
        setIsSubscribed(true);
        console.log("Subscription sent to backend successfully.");
      } else {
        const errData = await res.json();
        throw new Error(
          errData.message || "Failed to send subscription to backend."
        );
      }
    } catch (err: any) {
      console.error("Error subscribing to push:", err);
      setError(err.message || "Failed to subscribe to push notifications.");
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?._id, VAPID_PUBLIC_KEY, registerServiceWorker]);

  useEffect(() => {
    if (loadingUser || !isAuthenticated || !user?._id) return;

    const checkSubscriptionStatus = async () => {
      if ("serviceWorker" in navigator && "PushManager" in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setIsSubscribed(true);
          console.log("Already subscribed:", subscription);
        } else {
          setIsSubscribed(false);
          console.log("Not yet subscribed.");
        }
        if (Notification.permission === "granted") {
          setPermissionGranted(true);
        } else {
          setPermissionGranted(false);
        }
      }
    };
    checkSubscriptionStatus();
  }, [loadingUser, isAuthenticated, user?._id]);

  if (loadingUser || !isAuthenticated) {
    return null;
  }

  return (
    <div className="p-0">
      <h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      {loading && <p className="text-blue-600 text-sm mb-2">Processing...</p>}
      {!permissionGranted && (
        <p className="text-yellow-600 text-sm mb-2">
          Notification permission is not granted.
        </p>
      )}
      {isSubscribed ? (
        <p className="text-green-600 text-sm">
          You are subscribed to push notifications!
        </p>
      ) : (
        <button
          onClick={subscribeToPush}
          disabled={
            loading || !VAPID_PUBLIC_KEY || !isAuthenticated || !user?._id
          }
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Subscribing..." : "Enable Push Notifications"}
        </button>
      )}
    </div>
  );
};

export default PushNotificationManager;
