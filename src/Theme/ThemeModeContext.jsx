import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from './theme.js';

const STORAGE_KEY = 'pokedex-theme';
const META_COLORS = { dark: '#0a0c13', light: '#f2f3f8' };

const ThemeModeContext = createContext({ mode: 'dark', toggleMode: () => {} });

export const useThemeMode = () => useContext(ThemeModeContext);

const readInitialMode = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch (e) {
    // localStorage indisponible : on garde le thème par défaut
  }
  return 'dark';
};

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(readInitialMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLORS[mode]);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      // ignore
    }
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
};
