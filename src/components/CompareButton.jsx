import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CheckIcon from '@mui/icons-material/Check';
import { useComparison } from '../Comparison/ComparisonContext.jsx';
import { useTranslation } from '../i18n/translations.js';
import { pillButtonSx } from './FavoriteButton.jsx';

const CompareButton = ({ pokemon, variant = 'pill', className, sx }) => {
  const { toggleComparison, selectedPokemons } = useComparison();
  const { t } = useTranslation();
  const isSelected = selectedPokemons.some((p) => p.id === pokemon.id);
  const label = isSelected ? t('removeFromCompare') : t('addToCompare');

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleComparison(pokemon);
  };

  if (variant === 'icon') {
    return (
      <Tooltip title={label} placement="left">
        <IconButton
          onClick={handleClick}
          aria-label={label}
          aria-pressed={isSelected}
          size="small"
          className={className}
          sx={{
            width: 34,
            height: 34,
            color: isSelected ? '#0b1220' : 'var(--text-muted)',
            background: isSelected ? 'var(--compare)' : 'color-mix(in srgb, var(--surface) 72%, transparent)',
            backdropFilter: 'blur(6px)',
            border: '1px solid',
            borderColor: isSelected ? 'var(--compare)' : 'var(--border)',
            transition: 'color 0.2s ease, background 0.2s ease, transform 0.2s ease, opacity 0.2s ease',
            '&:hover': {
              color: isSelected ? '#0b1220' : 'var(--compare)',
              background: isSelected ? 'var(--compare)' : 'var(--surface)',
              transform: 'scale(1.08)',
            },
            '& svg': { fontSize: 18 },
            ...sx,
          }}
        >
          {isSelected ? <CheckIcon /> : <CompareArrowsIcon />}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Box
      component="button"
      type="button"
      onClick={handleClick}
      aria-pressed={isSelected}
      className={className}
      sx={{
        ...pillButtonSx,
        ...(isSelected && {
          background: 'var(--compare)',
          borderColor: 'var(--compare)',
          color: '#0b1220',
          '&:hover': { transform: 'translateY(-2px)', borderColor: 'var(--compare)' },
        }),
        ...sx,
      }}
    >
      {isSelected ? <CheckIcon /> : <CompareArrowsIcon />}
      {isSelected ? t('selected') : t('compare')}
    </Box>
  );
};

export default CompareButton;
