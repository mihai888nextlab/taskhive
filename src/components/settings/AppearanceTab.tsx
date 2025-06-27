import React from "react";

interface AppearanceTabProps {
  theme: string;
  toggleTheme: () => void;
}

const AppearanceTab: React.FC<AppearanceTabProps> = ({ theme, toggleTheme }) => (
  <div className={`w-full max-w-2xl mx-auto px-2 sm:px-4 text-${theme === 'light' ? 'gray-900' : 'white'}`}>
    <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4">
      Appearance
    </h2>
    <p className="text-gray-300 text-sm sm:text-base mb-4 sm:mb-6 border-b border-gray-200 pb-3 sm:pb-4">
      Switch between light and dark mode, or customize themes.
    </p>
    <button
      onClick={toggleTheme}
      className={`mt-3 px-4 py-2 rounded-md bg-${theme === 'light' ? 'blue-600' : 'blue-400'} text-white w-full sm:w-auto`}
    >
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  </div>
);

export default AppearanceTab;