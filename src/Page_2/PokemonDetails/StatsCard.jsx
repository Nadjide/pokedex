import React from 'react';
import { Box, Typography } from '@mui/material';
import SectionCard, { mutedTextSx } from './SectionCard.jsx';
import { Shimmer } from '../../Page_1/PokemonCard/PokemonCardSkeleton.jsx';
import { STAT_KEYS } from '../../api/pokeapi.js';
import { useTranslation } from '../../i18n/translations.js';

// Échelle visuelle : rares sont les stats au-delà de 180, la barre plafonne ensuite.
const BAR_SCALE = 180;

const statTierColor = (value) => {
  if (value < 50) return '#f0616d';
  if (value < 75) return '#f59f45';
  if (value < 100) return '#eec23a';
  if (value < 125) return '#86cd5c';
  return '#35c8ad';
};

const rowSx = {
  display: 'grid',
  gridTemplateColumns: 'minmax(70px, 92px) 36px minmax(0, 1fr)',
  alignItems: 'center',
  columnGap: 1.5,
  py: '7px',
};

export default function StatsCard({ loading, stats, total, sx }) {
  const { t } = useTranslation();

  let body;
  if (loading) {
    body = (
      <Box aria-busy="true">
        {STAT_KEYS.map((key) => (
          <Box key={key} sx={rowSx}>
            <Shimmer sx={{ height: 12, width: '80%' }} />
            <Shimmer sx={{ height: 12 }} />
            <Shimmer sx={{ height: 8, borderRadius: 999 }} />
          </Box>
        ))}
      </Box>
    );
  } else if (!stats) {
    body = <Typography sx={mutedTextSx}>{t('statsUnavailable')}</Typography>;
  } else {
    body = (
      <>
        <Box component="dl" sx={{ m: 0 }}>
          {STAT_KEYS.map((key, index) => {
            const value = stats[key];
            return (
              <Box key={key} sx={rowSx}>
                <Typography component="dt" sx={{ color: 'var(--text-muted)', fontSize: '0.86rem', fontWeight: 500 }}>
                  {t(`stats.${key}`)}
                </Typography>
                <Typography
                  component="dd"
                  sx={{
                    m: 0,
                    textAlign: 'right',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {value}
                </Typography>
                <Box
                  aria-hidden="true"
                  sx={{ height: 8, borderRadius: 999, background: 'var(--surface-3)', overflow: 'hidden' }}
                >
                  <Box
                    sx={{
                      width: `${Math.min(100, (value / BAR_SCALE) * 100)}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: statTierColor(value),
                      transformOrigin: 'left center',
                      animation: 'bar-grow 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
                      animationDelay: `${index * 70}ms`,
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </Box>
        <Box
          sx={{
            ...rowSx,
            mt: 1.25,
            pt: 1.75,
            borderTop: '1px solid var(--border)',
          }}
        >
          <Typography sx={{ fontSize: '0.86rem', fontWeight: 600 }}>{t('total')}</Typography>
          <Typography
            sx={{
              textAlign: 'right',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.05rem',
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--text)',
            }}
          >
            {total}
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <SectionCard title={t('baseStats')} sx={sx}>
      {body}
    </SectionCard>
  );
}
