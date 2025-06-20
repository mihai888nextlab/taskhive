import React from "react";

const NotificationsTab: React.FC = () => (
  <div>
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">
      Notifications
    </h2>
    <p className="text-gray-700 text-base sm:text-lg mb-6 sm:mb-8 border-b border-gray-200 pb-4 sm:pb-6">
      Customize your notification preferences.
    </p>
    <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
      <p>
        Notification settings will go here (e.g., email alerts, push notifications).
      </p>
    </div>
  </div>
);

export default NotificationsTab;