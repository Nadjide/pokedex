import { createTheme } from '@mui/material/styles';

const FONT_BODY = "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const FONT_DISPLAY = "'Outfit', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

// Les valeurs reprennent les tokens CSS de index.css : les composants MUI
// "flottants" (menus, tooltips, drawers) restent ainsi cohérents avec le reste.
const PALETTES = {
  dark: {
    primary: '#ff4b5c',
    bg: '#0a0c13',
    paper: '#171b27',
    text: '#f3f5fa',
    textSecondary: '#a6adbf',
    divider: 'rgba(255,255,255,0.08)',
  },
  light: {
    primary: '#e63946',
    bg: '#f2f3f8',
    paper: '#ffffff',
    text: '#12141d',
    textSecondary: '#545b6f',
    divider: 'rgba(18,24,48,0.09)',
  },
};

export const createAppTheme = (mode = 'dark') => {
  const p = PALETTES[mode] || PALETTES.dark;

  return createTheme({
    palette: {
      mode,
      primary: { main: p.primary, contrastText: '#fff' },
      secondary: { main: '#4cc9f0' },
      background: { default: p.bg, paper: p.paper },
      text: { primary: p.text, secondary: p.textSecondary },
      divider: p.divider,
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: FONT_BODY,
      h1: { fontFamily: FONT_DISPLAY, fontWeight: 800 },
      h2: { fontFamily: FONT_DISPLAY, fontWeight: 700 },
      h3: { fontFamily: FONT_DISPLAY, fontWeight: 700 },
      h4: { fontFamily: FONT_DISPLAY, fontWeight: 700 },
      h5: { fontFamily: FONT_DISPLAY, fontWeight: 700 },
      h6: { fontFamily: FONT_DISPLAY, fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 999 } },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            border: `1px solid ${p.divider}`,
            boxShadow: 'var(--shadow-md)',
            marginTop: 8,
          },
          list: { padding: 6 },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: { borderRadius: 10, fontSize: '0.9rem', minHeight: 40 },
        },
      },
      MuiTooltip: {
        defaultProps: { arrow: true, enterDelay: 350 },
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'dark' ? '#2a3042' : '#1b1e2a',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 500,
            borderRadius: 8,
            padding: '6px 10px',
          },
          arrow: { color: mode === 'dark' ? '#2a3042' : '#1b1e2a' },
        },
      },
    },
  });
};
