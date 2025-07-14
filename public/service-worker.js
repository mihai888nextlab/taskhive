// public/service-worker.js
// This file runs in the background. It cannot access window/document.

console.log("Service Worker registered!");

// Event listener for push notifications
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  console.log("Push received:", data);

  const title = data.title || "New Notification";
  const options = {
    body: data.body || "You have a new message.",
    icon: data.icon || "/icons/notification-icon.png", // Default icon
    badge: "/icons/badge-icon.png", // Optional: for mobile
    data: {
      url: data.url || "/", // URL to open on click
    },
    // Other options: image, vibrate, actions, etc.
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Event listener for notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close(); // Close the notification

  const urlToOpen = event.notification.data.url || "/";
  event.waitUntil(
    clients.openWindow(urlToOpen) // Open the URL in a new tab/window
  );
});

// Basic activate event (optional, for cleanup)
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated!");
  event.waitUntil(clients.claim()); // Take control of the page immediately
});

// Basic install event (optional)
self.addEventListener("install", (event) => {
  console.log("Service Worker installed!");
  // Skip waiting to activate immediately
  self.skipWaiting();
});
