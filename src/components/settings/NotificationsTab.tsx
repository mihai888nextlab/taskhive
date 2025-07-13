import React from "react";

const NotificationsTab: React.FC<any> = React.memo((props) => (
  <div className="w-full max-w-2xl mx-auto px-2 sm:px-4">
    <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 text-gray-900">
      Notifications
    </h2>
    <p className="text-gray-700 text-sm sm:text-base mb-4 sm:mb-6 border-b border-gray-200 pb-3 sm:pb-4">
      Customize your notification preferences.
    </p>
    <div className="mt-2 sm:mt-4 p-3 sm:p-6 bg-gray-50 border border-gray-200 rounded-md text-gray-700 text-sm sm:text-base">
      <p>
        Notification settings will go here (e.g., email alerts, push notifications).
      </p>
    </div>
  </div>
));

export default React.memo(NotificationsTab);