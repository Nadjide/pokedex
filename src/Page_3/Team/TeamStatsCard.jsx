import React from 'react';
import { Box, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SectionCard, { mutedTextSx } from '../../Page_2/PokemonDetails/SectionCard.jsx';
import { BAR_SCALE, statTierColor } from '../../Page_2/PokemonDetails/StatsCard.jsx';
import { Shimmer } from '../../Page_1/PokemonCard/PokemonCardSkeleton.jsx';
import { pillButtonSx } from '../../components/FavoriteButton.jsx';
import { STAT_KEYS } from '../../api/pokeapi.js';
import { useTranslation } from '../../i18n/translations.js';

const figureSx = {
  minWidth: 0,
  p: { xs: 1.5, md: 2 },
  borderRadius: 'var(--radius-md)',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
};

const figureLabelSx = {
  color: 'var(--text-muted)',
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
};

const figureValueSx = {
  m: 0,
  mt: 0.5,
  fontFamily: 'var(--font-display)',
  fontWeight: 800,
  fontSize: { xs: '1.6rem', md: '1.9rem' },
  lineHeight: 1.1,
  fontVariantNumeric: 'tabular-nums',
};

const rowSx = {
  display: 'grid',
  gridTemplateColumns: 'minmax(70px, 92px) 36px minmax(0, 1fr)',
  alignItems: 'center',
  columnGap: 1.5,
  py: '7px',
};

// Total et moyenne des statistiques de base de l'équipe (`summary` vient de
// summarizeTeamStats). Les membres sans statistiques ne sont jamais estimés.
export default function TeamStatsCard({ summary, loading, onRetry, sx }) {
  const { t } = useTranslation();

  let body;
  if (summary.members === 0) {
    body = <Typography sx={mutedTextSx}>{t('team.statsEmpty')}</Typography>;
  } else if (loading) {
    body = (
      <Box aria-busy="true" aria-label={t('loadingStats')}>
        <Shimmer sx={{ height: 78, borderRadius: 'var(--radius-md)', mb: 2 }} />
        {STAT_KEYS.map((key) => (
          <Shimmer key={key} sx={{ height: 12, my: 1.75 }} />
        ))}
      </Box>
    );
  } else {
    const missing = summary.members - summary.counted;
    const retry = onRetry && (
      <Box component="button" type="button" onClick={onRetry} sx={{ ...pillButtonSx, height: 36, mt: 1.5 }}>
        <RefreshIcon />
        {t('retry')}
      </Box>
    );

    body =
      summary.counted === 0 ? (
        <Box>
          <Typography sx={mutedTextSx}>{t('statsUnavailable')}</Typography>
          {retry}
        </Box>
      ) : (
        <>
          {missing > 0 && (
            <Box
              role="status"
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 'var(--radius-sm)',
                background: 'color-mix(in srgb, var(--star) 12%, transparent)',
                border: '1px solid color-mix(in srgb, var(--star) 45%, transparent)',
                fontSize: '0.86rem',
              }}
            >
              {t('team.statsPartial', { missing, counted: summary.counted, members: summary.members })}
              <div>{retry}</div>
            </Box>
          )}

          <Box component="dl" sx={{ m: 0, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
            <Box sx={figureSx}>
              <Typography component="dt" sx={figureLabelSx}>
                {t('team.statsTotal')}
              </Typography>
              <Typography component="dd" sx={figureValueSx}>
                {summary.total}
              </Typography>
            </Box>
            <Box sx={figureSx}>
              <Typography component="dt" sx={figureLabelSx}>
                {t('team.statsAverage')}
              </Typography>
              <Typography component="dd" sx={figureValueSx}>
                {Math.round(summary.average)}
              </Typography>
            </Box>
          </Box>

          <Typography component="h3" sx={{ ...figureLabelSx, mt: 2.5, mb: 0.75 }}>
            {t('team.statsPerStat')}
          </Typography>
          <Box component="dl" sx={{ m: 0 }}>
            {STAT_KEYS.map((key, index) => {
              const value = Math.round(summary.perStat[key].average);
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
                  <Box aria-hidden="true" sx={{ height: 8, borderRadius: 999, background: 'var(--surface-3)', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${Math.min(100, (value / BAR_SCALE) * 100)}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: statTierColor(value),
                        transition: 'width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
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
        </>
      );
  }

  return (
    <SectionCard title={t('team.stats')} hint={t('team.statsHint')} sx={sx}>
      {body}
    </SectionCard>
  );
}
