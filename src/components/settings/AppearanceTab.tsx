import React from "react";
import { useTheme } from "@/components/ThemeContext";

interface AppearanceTabProps {
  toggleTheme: () => void;
}

const AppearanceTab: React.FC<AppearanceTabProps> = React.memo(({ toggleTheme }) => {
  const { theme } = useTheme();
  return (
    <div className={theme === "dark" ? "text-white w-full" : "text-gray-900 w-full"}>
      <div className="mb-8 pb-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-1">Appearance</h2>
        <p className={`text-base mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Switch between light and dark mode, or customize themes.</p>
      </div>
      <div className="w-full mt-6">
        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-md w-full sm:w-auto ${theme === "dark" ? "bg-blue-400 hover:bg-blue-500" : "bg-blue-600 hover:bg-blue-700"} text-white`}
        >
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>
    </div>
  );
});

export default React.memo(AppearanceTab);