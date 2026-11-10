import React from 'react';
import { Box, Typography } from '@mui/material';
import { useComparison } from '../Comparison/ComparisonContext.jsx';
import { useTranslation } from '../i18n/translations.js';

export default function Footer() {
  const { t } = useTranslation();
  const { selectedPokemons } = useComparison();
  // Le dock du comparateur flotte en bas de page : on lui laisse la place.
  const dockVisible = selectedPokemons.length > 0;

  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        pt: 3.5,
        pb: dockVisible ? '104px' : '28px',
        px: { xs: 2, md: 3 },
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        transition: 'padding-bottom 0.3s ease',
      }}
    >
      <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: 640, mx: 'auto' }}>
        <Box
          component="a"
          href="https://pokeapi.co/"
          target="_blank"
          rel="noreferrer"
          sx={{ color: 'var(--text)', fontWeight: 600, textDecoration: 'none', '&:hover': { color: 'var(--accent)' } }}
        >
          {t('footerData')}
        </Box>
        {' · '}
        {t('footerDisclaimer')}
      </Typography>
    </Box>
  );
}
