import React, { createContext, useContext, useState, useEffect } from "react";

// Supported languages (must match your messages folder)
const SUPPORTED_LANGUAGES = [
  "en", "fr", "ro", "zh", "sr", "gr", "es", "pt", "hi", "ar"
];

type LanguageContextType = {
  lang: string;
  setLang: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load language from localStorage, default to 'en'
  const [lang, setLangState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lang") || "en";
    }
    return "en";
  });

  // Persist language to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", lang);
    }
  }, [lang]);

  // Provide setLang that updates state and localStorage
  const setLang = (newLang: string) => {
    setLangState(newLang);
    // localStorage is updated by useEffect
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);