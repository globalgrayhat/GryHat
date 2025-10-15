import React, { createContext, useContext, useState, useCallback } from "react";
// Import TypeScript translation modules instead of JSON. This avoids JSON
// parsing issues in Webpack and provides type inference for nested keys.
import en from "../i18n/en";
import ar from "../i18n/ar";

// Define a type for resources. For simplicity we allow any nested structure.
interface Resources {
  [key: string]: string | Resources;
}

const resources: Resources = {
  en,
  ar,
};

interface LanguageContextValue {
  language: string;
  t: (key: string) => string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("language");
      if (stored && resources[stored]) {
        return stored;
      }
    }
    return "en";
  });

  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".");
      let result: string | Resources = resources[language];
      for (const k of keys) {
        if (result && typeof result === "object" && k in result) {
          result = result[k];
        } else {
          // Fallback: return the last segment instead of the full key (e.g. "nav.community" -> "community")
          return keys[keys.length - 1];
        }
      }
      return typeof result === "string" ? result : keys[keys.length - 1];
    },
    [language]
  );

  const setLanguage = (lang: string) => {
    if (resources[lang]) {
      localStorage.setItem("language", lang);
      setLanguageState(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export { LanguageProvider };
