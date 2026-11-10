import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Badge, Box, IconButton, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { LanguageContext } from '../../Langue/LanguageContext.jsx';
import { useFavorites } from '../../FavoritesContext.jsx';
import { useFilter } from '../../components/FilterShield/FilterContext.jsx';
import { useThemeMode } from '../../Theme/ThemeModeContext.jsx';
import { useTranslation } from '../../i18n/translations.js';
import PokeballMark from '../../components/PokeballMark.jsx';

const LANGUAGES = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'en', label: 'EN', name: 'English' },
];

const iconButtonSx = {
  width: 40,
  height: 40,
  color: 'var(--text-muted)',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  transition: 'color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
  '&:hover': { color: 'var(--text)', borderColor: 'var(--border-strong)', background: 'var(--surface)' },
  '& svg': { fontSize: 20 },
};

export default function Header() {
  const { language, setLanguage } = useContext(LanguageContext);
  const { favorites } = useFavorites();
  const { favoritesOnly, setFavoritesOnly } = useFilter();
  const { mode, toggleMode } = useThemeMode();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const onHome = location.pathname === '/';
  const favoritesActive = onHome && favoritesOnly;

  const handleFavorites = () => {
    if (onHome) {
      setFavoritesOnly(!favoritesOnly);
    } else {
      setFavoritesOnly(true);
      navigate('/');
    }
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        height: 'var(--header-h)',
        background: 'color-mix(in srgb, var(--bg) 78%, transparent)',
        backdropFilter: 'blur(18px) saturate(160%)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <Box
        sx={{
          maxWidth: 'var(--page-max)',
          height: '100%',
          mx: 'auto',
          px: { xs: 2, md: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box
          component={Link}
          to="/"
          aria-label={`${t('appTitle')} — ${t('home')}`}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1.25,
            textDecoration: 'none',
            color: 'var(--text)',
            borderRadius: 2,
            '& svg': { transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' },
            '&:hover svg': { transform: 'rotate(180deg)' },
          }}
        >
          <PokeballMark size={32} />
          <Box
            component="span"
            sx={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.35rem',
              letterSpacing: '-0.01em',
            }}
          >
            Poké
            <Box component="span" sx={{ color: 'var(--accent)' }}>
              dex
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1.25 } }}>
          <Tooltip title={t('showFavorites')}>
            <IconButton
              onClick={handleFavorites}
              aria-label={`${t('showFavorites')} (${favorites.length})`}
              aria-pressed={favoritesActive}
              sx={{
                ...iconButtonSx,
                ...(favoritesActive && {
                  color: 'var(--accent)',
                  borderColor: 'var(--accent)',
                  background: 'var(--accent-soft)',
                }),
              }}
            >
              <Badge
                badgeContent={favorites.length}
                max={99}
                color="primary"
                sx={{ '& .MuiBadge-badge': { fontWeight: 700, fontSize: '0.65rem', minWidth: 17, height: 17 } }}
              >
                {favoritesActive ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </Badge>
            </IconButton>
          </Tooltip>

          <Box
            role="group"
            aria-label={t('language')}
            sx={{
              display: 'inline-flex',
              p: '3px',
              borderRadius: 999,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          >
            {LANGUAGES.map(({ code, label, name }) => (
              <Box
                key={code}
                component="button"
                type="button"
                onClick={() => setLanguage(code)}
                aria-pressed={language === code}
                aria-label={name}
                lang={code}
                sx={{
                  height: 32,
                  minWidth: 40,
                  px: 1.25,
                  border: 0,
                  borderRadius: 999,
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  font: 'inherit',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease, color 0.2s ease',
                  '&:hover': { color: 'var(--text)' },
                  '&[aria-pressed="true"]': { background: 'var(--text)', color: 'var(--bg)' },
                }}
              >
                {label}
              </Box>
            ))}
          </Box>

          <Tooltip title={mode === 'dark' ? t('switchToLight') : t('switchToDark')}>
            <IconButton
              onClick={toggleMode}
              aria-label={mode === 'dark' ? t('switchToLight') : t('switchToDark')}
              sx={iconButtonSx}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
