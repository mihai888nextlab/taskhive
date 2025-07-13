import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

// Supported languages (must match your messages folder)
const SUPPORTED_LANGUAGES = [
  "en", "fr", "ro", "zh", "sr", "gr", "es", "pt", "hi", "ar"
];

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = React.memo(({ children }) => {
  const [lang, setLangState] = useState("en");

  // Memoize setLang
  const setLang = useCallback((newLang: string) => {
    setLangState(newLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
});

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
};