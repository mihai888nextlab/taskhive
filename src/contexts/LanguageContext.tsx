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

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<string>("en");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    // Only run once on mount
    setInitialized(true);

    // Try to detect language from browser first
    let browserLang = navigator.language?.split("-")[0]?.toLowerCase();
    if (browserLang && SUPPORTED_LANGUAGES.includes(browserLang)) {
      setLang(browserLang);
      return;
    }

    // Fallback: Detect country from IP and map to language
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        // Map country code to language code
        const countryLangMap: Record<string, string> = {
          FR: "fr",
          RO: "ro",
          CN: "zh",
          SR: "sr",
          GR: "gr",
          ES: "es",
          PT: "pt",
          IN: "hi",
          AE: "ar",
          // Add more mappings as needed
        };
        const countryCode = data.country_code;
        const detectedLang = countryLangMap[countryCode];
        if (detectedLang && SUPPORTED_LANGUAGES.includes(detectedLang)) {
          setLang(detectedLang);
        } else {
          setLang("en");
        }
      })
      .catch(() => {
        setLang("en");
      });
  }, [initialized]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};