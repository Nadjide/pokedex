import React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

// Teintes lisibles sur les surfaces claires comme sombres.
export const CATEGORY_COLORS = {
  physical: '#e2553a',
  special: '#5a7de0',
  status: '#7f879b',
};

// Étoile à huit branches centrée sur l'icône 24×24.
const BURST_POINTS = Array.from({ length: 16 }, (_, index) => {
  const radius = index % 2 === 0 ? 10.5 : 5.2;
  const angle = ((index * 22.5 - 90) * Math.PI) / 180;
  return `${(12 + radius * Math.cos(angle)).toFixed(2)},${(12 + radius * Math.sin(angle)).toFixed(2)}`;
}).join(' ');

// Pictogrammes maison : éclat (physique), ondes (spéciale), équilibre (statut).
const SHAPES = {
  physical: <polygon points={BURST_POINTS} />,
  special: (
    <path
      fillRule="evenodd"
      d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 3.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"
    />
  ),
  status: (
    <path
      fillRule="evenodd"
      d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 1.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8Zm0 0a4.2 4.2 0 0 1 0 8.4 4.2 4.2 0 0 0 0 8.4 8.4 8.4 0 0 1 0-16.8Zm0 2.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Zm0 8.4a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Z"
    />
  ),
};

export default function MoveCategoryIcon({ category, sx, ...props }) {
  if (!SHAPES[category]) return null;
  return (
    <SvgIcon aria-hidden="true" sx={{ color: CATEGORY_COLORS[category], fontSize: 18, ...sx }} {...props}>
      {SHAPES[category]}
    </SvgIcon>
  );
}
