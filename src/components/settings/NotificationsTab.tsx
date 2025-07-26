import React from "react";
import PushNotificationManager from "../PushNotificationManager";
import { useTheme } from "@/components/ThemeContext";

const NotificationsTab: React.FC<any> = React.memo((props) => {
  const { theme } = useTheme();
  return (
    <div className={theme === "dark" ? "text-white w-full" : "text-gray-900 w-full"}>
      <div className="mb-8 pb-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-1">Notifications</h2>
        <p className={`text-base mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Customize your notification preferences.</p>
      </div>
      <div className="w-full mt-6">
        <PushNotificationManager />
      </div>
    </div>
  );
});

export default React.memo(NotificationsTab);
