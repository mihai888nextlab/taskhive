import React, { useMemo } from "react";

interface AppearanceTabProps {
  theme: string;
  toggleTheme: () => void;
}

const AppearanceTab: React.FC<AppearanceTabProps> = React.memo(({ theme, toggleTheme }) => {
  // Memoize classes
  const textClass = useMemo(() => `text-${theme === 'light' ? 'gray-900' : 'white'}`, [theme]);

  return (
    <div className={`w-full max-w-2xl mx-auto px-2 sm:px-4 ${textClass}`}>
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
});

export default React.memo(AppearanceTab);