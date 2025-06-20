import React from "react";

interface AppearanceTabProps {
  theme: string;
  toggleTheme: () => void;
}

const AppearanceTab: React.FC<AppearanceTabProps> = ({ theme, toggleTheme }) => (
  <div className={`text-${theme === 'light' ? 'gray-900' : 'white'}`}>
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4">
      Appearance
    </h2>
    <p className="text-gray-300 text-base sm:text-lg mb-6 sm:mb-8 border-b border-gray-200 pb-4 sm:pb-6">
      Switch between light and dark mode, or customize themes.
    </p>
    <button
      onClick={toggleTheme}
      className={`mt-4 px-4 py-2 rounded-md bg-${theme === 'light' ? 'blue-600' : 'blue-400'} text-white`}
    >
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  </div>
);

export default AppearanceTab;