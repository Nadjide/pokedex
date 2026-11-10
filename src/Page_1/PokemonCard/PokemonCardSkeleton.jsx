import React from 'react';
import { Box } from '@mui/material';

const shimmerSx = {
  borderRadius: '10px',
  background:
    'linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.6s linear infinite',
};

export const Shimmer = ({ sx, ...props }) => <Box aria-hidden="true" sx={{ ...shimmerSx, ...sx }} {...props} />;

export default function PokemonCardSkeleton() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <Shimmer sx={{ width: 44, height: 16, mb: 2 }} />
      <Shimmer sx={{ width: '70%', aspectRatio: '1 / 1', mx: 'auto', borderRadius: '50%', mb: 2 }} />
      <Shimmer sx={{ width: '60%', height: 20, mb: 1.25 }} />
      <Box sx={{ display: 'flex', gap: 0.75 }}>
        <Shimmer sx={{ width: 62, height: 22, borderRadius: 999 }} />
        <Shimmer sx={{ width: 52, height: 22, borderRadius: 999 }} />
      </Box>
    </Box>
  );
}
