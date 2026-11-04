import React from 'react';
import { Box, Skeleton } from '@mui/material';

export default function PokemonCardSkeleton() {
  return (
    <Box
      sx={{
        width: '210px',
        padding: '16px',
        margin: '10px',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Skeleton variant="text" width={40} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Skeleton variant="circular" width={24} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
      </Box>

      <Skeleton
        variant="rectangular"
        width={100}
        height={100}
        sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '12px', my: 1.5 }}
      />

      <Skeleton variant="text" width={110} height={26} sx={{ bgcolor: 'rgba(255,255,255,0.12)', mb: 1 }} />

      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <Skeleton variant="rounded" width={55} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '10px' }} />
        <Skeleton variant="rounded" width={55} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '10px' }} />
      </Box>

      <Skeleton variant="text" width={90} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mt: 0.5 }} />
      <Skeleton variant="rounded" width={80} height={26} sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '14px', mt: 1 }} />
    </Box>
  );
}
