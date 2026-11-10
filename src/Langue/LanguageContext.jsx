import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'pokedex-language';
const SUPPORTED = ['fr', 'en'];

export const LanguageContext = React.createContext({ language: 'fr', setLanguage: () => {} });

const readInitialLanguage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(stored)) return stored;
  } catch (e) {
    // localStorage indisponible
  }
  return 'fr';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(readInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (e) {
      // ignore
    }
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
