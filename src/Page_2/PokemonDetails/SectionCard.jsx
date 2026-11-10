import React from 'react';
import { Box, Typography } from '@mui/material';

export default function SectionCard({ title, hint, action, children, sx }) {
  return (
    <Box
      component="section"
      sx={{
        minWidth: 0,
        p: { xs: 2.25, md: 3.25 },
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="h2"
            sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', lineHeight: 1.25 }}
          >
            {title}
          </Typography>
          {hint && (
            <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.82rem', mt: 0.25 }}>{hint}</Typography>
          )}
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  );
}

export const mutedTextSx = { color: 'var(--text-muted)', fontSize: '0.92rem' };
