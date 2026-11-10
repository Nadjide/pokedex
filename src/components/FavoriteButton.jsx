import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useFavorites } from '../FavoritesContext.jsx';
import { useTranslation } from '../i18n/translations.js';

export const pillButtonSx = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  height: 42,
  px: '16px',
  borderRadius: 999,
  border: '1px solid var(--border-strong)',
  background: 'color-mix(in srgb, var(--surface) 70%, transparent)',
  backdropFilter: 'blur(8px)',
  color: 'var(--text)',
  font: 'inherit',
  fontSize: '0.88rem',
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
  '&:hover': { transform: 'translateY(-2px)', borderColor: 'var(--text-muted)' },
  '&:active': { transform: 'translateY(0)' },
  '&:disabled': { opacity: 0.45, cursor: 'not-allowed', transform: 'none' },
  '& svg': { fontSize: 19 },
};

export default function FavoriteButton({ pokemonId, variant = 'icon', sx }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useTranslation();
  const active = isFavorite(pokemonId);
  const label = active ? t('removeFavorite') : t('addFavorite');

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(pokemonId);
  };

  // `key` relance l'animation à chaque ajout aux favoris.
  const icon = active ? (
    <FavoriteIcon key="on" sx={{ animation: 'heart-pop 0.35s ease' }} />
  ) : (
    <FavoriteBorderIcon key="off" />
  );

  if (variant === 'pill') {
    return (
      <Box
        component="button"
        type="button"
        onClick={handleClick}
        aria-pressed={active}
        aria-label={label}
        sx={{
          ...pillButtonSx,
          ...(active && {
            background: 'var(--accent)',
            borderColor: 'var(--accent)',
            color: '#fff',
            '&:hover': { transform: 'translateY(-2px)', borderColor: 'var(--accent)' },
          }),
          ...sx,
        }}
      >
        {icon}
        {t('favorite')}
      </Box>
    );
  }

  return (
    <Tooltip title={label} placement="left">
      <IconButton
        onClick={handleClick}
        aria-label={label}
        aria-pressed={active}
        size="small"
        sx={{
          width: 34,
          height: 34,
          color: active ? 'var(--accent)' : 'var(--text-muted)',
          background: 'color-mix(in srgb, var(--surface) 72%, transparent)',
          backdropFilter: 'blur(6px)',
          border: '1px solid var(--border)',
          transition: 'color 0.2s ease, background 0.2s ease, transform 0.2s ease',
          '&:hover': {
            color: 'var(--accent)',
            background: 'var(--surface)',
            transform: 'scale(1.08)',
          },
          '& svg': { fontSize: 18 },
          ...sx,
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  );
}
