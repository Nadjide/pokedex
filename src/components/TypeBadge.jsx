import React, { useContext } from 'react';
import { Box } from '@mui/material';
import TypeIcon from './TypeIcon.jsx';
import { TypesContext } from '../Page_1/TypesContext/TypesContext.jsx';
import { LanguageContext } from '../Langue/LanguageContext.jsx';
import { getReadableTextColor, getTypeColor, getTypeLabel } from '../Theme/typeColors.js';
import { formatMultiplier } from '../data/typeChart.js';

const SIZES = {
  sm: { height: 22, fontSize: '0.7rem', icon: 13, px: '8px', gap: '4px' },
  md: { height: 28, fontSize: '0.8rem', icon: 15, px: '11px', gap: '5px' },
  lg: { height: 34, fontSize: '0.9rem', icon: 18, px: '14px', gap: '6px' },
};

export default function TypeBadge({ type, size = 'md', multiplier, sx }) {
  const typesData = useContext(TypesContext) || {};
  const { language } = useContext(LanguageContext);
  const dims = SIZES[size] || SIZES.md;
  const color = getTypeColor(type);
  const textColor = getReadableTextColor(color);

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dims.gap,
        height: dims.height,
        px: dims.px,
        borderRadius: 999,
        background: color,
        color: textColor,
        fontSize: dims.fontSize,
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...sx,
      }}
    >
      <TypeIcon type={type} sx={{ fontSize: dims.icon }} />
      {getTypeLabel(type, language, typesData)}
      {multiplier !== undefined && (
        <Box
          component="span"
          sx={{
            ml: '2px',
            mr: '-5px',
            px: '7px',
            height: dims.height - 8,
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: 999,
            background: textColor === '#ffffff' ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.5)',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatMultiplier(multiplier)}
        </Box>
      )}
    </Box>
  );
}
