// src/components/ComparisonDock/ComparisonDock.jsx
import React, { useEffect, useState } from 'react';
import { Box, ButtonBase, Drawer, IconButton, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useComparison } from '../../Comparison/ComparisonContext.jsx';
import { usePokemonStats } from '../../hooks/usePokemonDetails.js';
import { STAT_KEYS } from '../../api/pokeapi.js';
import { useTranslation } from '../../i18n/translations.js';
import { formatId, getPokemonName } from '../../utils/pokemon.js';
import PokemonArtwork from '../PokemonArtwork.jsx';
import TypeBadge from '../TypeBadge.jsx';
import { Shimmer } from '../../Page_1/PokemonCard/PokemonCardSkeleton.jsx';

// Wrapper Lazy pour le graphique (recharts reste hors du bundle initial)
const PokemonRadarChart = React.lazy(() => import('../PokemonRadarChart/PokemonRadarChart.jsx'));

const SLOT_COLORS = ['var(--accent)', 'var(--compare)'];

function DockSlot({ pokemon, color, onRemove }) {
  const { t, language } = useTranslation();

  if (!pokemon) {
    return (
      <Box
        aria-hidden="true"
        sx={{
          width: 44,
          height: 44,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          border: '1.5px dashed var(--border-strong)',
          color: 'var(--text-faint)',
        }}
      >
        <AddIcon sx={{ fontSize: 18 }} />
      </Box>
    );
  }

  const name = getPokemonName(pokemon, language);
  return (
    <Tooltip title={`${t('remove')} ${name}`}>
      <ButtonBase
        onClick={onRemove}
        aria-label={`${t('remove')} ${name}`}
        sx={{
          position: 'relative',
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '2px solid',
          borderColor: color,
          background: 'var(--surface-2)',
          '&:hover .slot-remove': { opacity: 1 },
        }}
      >
        <PokemonArtwork pokemon={pokemon} alt="" loading="eager" sx={{ width: 34 }} />
        <Box
          className="slot-remove"
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '50%',
            background: 'rgba(10, 12, 19, 0.72)',
            color: '#fff',
            opacity: 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </Box>
      </ButtonBase>
    </Tooltip>
  );
}

function Fighter({ pokemon, color, onRemove }) {
  const { t, language } = useTranslation();

  if (!pokemon) {
    return (
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 200,
          display: 'grid',
          placeItems: 'center',
          p: 2,
          borderRadius: 'var(--radius-md)',
          border: '1.5px dashed var(--border-strong)',
          color: 'var(--text-muted)',
          fontSize: '0.88rem',
          textAlign: 'center',
        }}
      >
        {t('selectSecondPokemon')}
      </Box>
    );
  }

  const name = getPokemonName(pokemon, language);
  return (
    <Box
      sx={{
        position: 'relative',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: { xs: 1.5, sm: 2 },
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderTop: '3px solid',
        borderTopColor: color,
      }}
    >
      <Tooltip title={t('remove')}>
        <IconButton
          size="small"
          onClick={onRemove}
          aria-label={`${t('remove')} ${name}`}
          sx={{ position: 'absolute', top: 6, right: 6, color: 'var(--text-faint)', '&:hover': { color: 'var(--text)' } }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <PokemonArtwork pokemon={pokemon} alt="" loading="eager" sx={{ width: { xs: 88, sm: 120 } }} />
      <Typography
        sx={{
          mt: 1,
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: { xs: '1rem', sm: '1.15rem' },
          textTransform: 'capitalize',
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        {name}
      </Typography>
      <Typography sx={{ color: 'var(--text-faint)', fontSize: '0.78rem', mb: 1, fontVariantNumeric: 'tabular-nums' }}>
        {formatId(pokemon.id)}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5 }}>
        {(pokemon.types || []).map((type) => (
          <TypeBadge key={type} type={type} size="sm" />
        ))}
      </Box>
    </Box>
  );
}

// Demi-ligne du duel : valeur + barre orientée vers le centre.
function DuelSide({ value, rival, color, side, max }) {
  const hasValue = typeof value === 'number';
  const wins = hasValue && typeof rival === 'number' && value > rival;
  const loses = hasValue && typeof rival === 'number' && value < rival;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexDirection: side === 'left' ? 'row' : 'row-reverse' }}>
      <Typography
        sx={{
          width: 34,
          textAlign: side === 'left' ? 'left' : 'right',
          fontFamily: 'var(--font-display)',
          fontWeight: wins ? 800 : 600,
          fontSize: '0.95rem',
          fontVariantNumeric: 'tabular-nums',
          color: loses ? 'var(--text-faint)' : 'var(--text)',
        }}
      >
        {hasValue ? value : '—'}
      </Typography>
      <Box
        aria-hidden="true"
        sx={{
          flex: 1,
          height: 8,
          display: 'flex',
          justifyContent: side === 'left' ? 'flex-end' : 'flex-start',
          borderRadius: 999,
          background: 'var(--surface-3)',
          overflow: 'hidden',
        }}
      >
        {hasValue && (
          <Box
            sx={{
              width: `${Math.min(100, (value / max) * 100)}%`,
              borderRadius: 999,
              background: color,
              opacity: loses ? 0.45 : 1,
              transition: 'width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          />
        )}
      </Box>
    </Box>
  );
}

function ComparisonPanel({ first, second }) {
  const { t, language } = useTranslation();
  const { toggleComparison } = useComparison();
  const firstStats = usePokemonStats(first?.id);
  const secondStats = usePokemonStats(second?.id);

  const loading = firstStats.loading || secondStats.loading;
  const statsMissing = !loading && (!firstStats.stats || (second && !secondStats.stats));

  const allValues = [firstStats.stats, secondStats.stats]
    .filter(Boolean)
    .flatMap((stats) => STAT_KEYS.map((key) => stats[key]));
  const max = Math.max(140, ...allValues);

  const rows = STAT_KEYS.map((key) => ({
    key,
    label: t(`statsShort.${key}`),
    a: firstStats.stats?.[key],
    b: secondStats.stats?.[key],
    max,
  }));

  const series = [
    firstStats.stats && { name: getPokemonName(first, language), color: SLOT_COLORS[0], stats: firstStats.stats },
    second && secondStats.stats && { name: getPokemonName(second, language), color: SLOT_COLORS[1], stats: secondStats.stats },
  ].filter(Boolean);

  const labels = Object.fromEntries(STAT_KEYS.map((key) => [key, t(`statsShort.${key}`)]));

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1080,
        mx: 'auto',
        p: { xs: 2, md: 4 },
        pt: { xs: 1, md: 2 },
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.05fr) minmax(0, 0.95fr)' },
        gap: { xs: 2, md: 5 },
        alignItems: 'center',
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'stretch', gap: { xs: 1, sm: 1.5 } }}>
          <Fighter pokemon={first} color={SLOT_COLORS[0]} onRemove={() => toggleComparison(first)} />
          <Box
            aria-hidden="true"
            sx={{
              alignSelf: 'center',
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '50%',
              background: 'var(--surface-2)',
              border: '1px solid var(--border-strong)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}
          >
            {t('versus')}
          </Box>
          <Fighter pokemon={second} color={SLOT_COLORS[1]} onRemove={() => second && toggleComparison(second)} />
        </Box>

        <Box sx={{ mt: 3 }}>
          {loading ? (
            <Box aria-busy="true" aria-label={t('loadingStats')}>
              {STAT_KEYS.map((key) => (
                <Shimmer key={key} sx={{ height: 12, my: 1.5 }} />
              ))}
            </Box>
          ) : statsMissing ? (
            <Typography sx={{ color: 'var(--text-muted)', fontSize: '0.92rem', textAlign: 'center', py: 2 }}>
              {t('statsUnavailable')}
            </Typography>
          ) : (
            <>
              {rows.map((row) => (
                <Box
                  key={row.key}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 72px minmax(0, 1fr)',
                    alignItems: 'center',
                    columnGap: 1,
                    py: '7px',
                  }}
                >
                  <DuelSide value={row.a} rival={row.b} color={SLOT_COLORS[0]} side="left" max={row.max} />
                  <Typography
                    sx={{
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {row.label}
                  </Typography>
                  <DuelSide value={row.b} rival={row.a} color={SLOT_COLORS[1]} side="right" max={row.max} />
                </Box>
              ))}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) 72px minmax(0, 1fr)',
                  alignItems: 'center',
                  columnGap: 1,
                  mt: 1,
                  pt: 1.5,
                  borderTop: '1px solid var(--border)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <Box sx={{ color: firstStats.total >= (secondStats.total ?? 0) ? SLOT_COLORS[0] : 'var(--text-faint)' }}>
                  {firstStats.total ?? '—'}
                </Box>
                <Typography
                  sx={{
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {t('total')}
                </Typography>
                <Box
                  sx={{
                    textAlign: 'right',
                    color: (secondStats.total ?? 0) >= firstStats.total ? SLOT_COLORS[1] : 'var(--text-faint)',
                  }}
                >
                  {secondStats.total ?? '—'}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>

      <Box sx={{ minWidth: 0, minHeight: { xs: 280, md: 340 } }}>
        {series.length > 0 && (
          <React.Suspense
            fallback={
              <Box sx={{ display: 'grid', placeItems: 'center', height: 320, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {t('loadingChart')}
              </Box>
            }
          >
            <PokemonRadarChart series={series} labels={labels} />
          </React.Suspense>
        )}
      </Box>
    </Box>
  );
}

const ComparisonDock = () => {
  const { selectedPokemons, clearComparison, toggleComparison } = useComparison();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const count = selectedPokemons.length;

  // Ouverture automatique dès que le duel est complet.
  useEffect(() => {
    if (count === 2) setOpen(true);
    if (count === 0) setOpen(false);
  }, [count]);

  if (count === 0) return null;

  const [first, second] = selectedPokemons;

  return (
    <>
      {/* Dock flottant */}
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: { xs: 12, sm: 20 },
          zIndex: 1200,
          display: 'flex',
          justifyContent: 'center',
          px: 2,
          pointerEvents: 'none',
        }}
      >
        <Box
          role="region"
          aria-label={t('comparatorTitle')}
          sx={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: '7px',
            borderRadius: 999,
            background: 'color-mix(in srgb, var(--surface) 88%, transparent)',
            backdropFilter: 'blur(20px) saturate(160%)',
            border: '1px solid var(--border-strong)',
            boxShadow: 'var(--shadow-lg)',
            animation: 'card-in 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            <DockSlot pokemon={first} color={SLOT_COLORS[0]} onRemove={() => toggleComparison(first)} />
            <DockSlot pokemon={second} color={SLOT_COLORS[1]} onRemove={() => toggleComparison(second)} />
          </Box>

          <ButtonBase
            onClick={() => setOpen(true)}
            aria-label={`${t('openComparator')} (${count}/2)`}
            sx={{
              height: 44,
              px: 2.25,
              gap: 1,
              borderRadius: 999,
              background: 'var(--accent)',
              color: '#fff',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              fontWeight: 700,
              transition: 'background 0.2s ease, transform 0.2s ease',
              '&:hover': { background: 'var(--accent-strong)', transform: 'translateY(-1px)' },
            }}
          >
            <CompareArrowsIcon sx={{ fontSize: 20 }} />
            {t('compare')}
            <Box component="span" sx={{ opacity: 0.8, fontVariantNumeric: 'tabular-nums' }}>
              {count}/2
            </Box>
          </ButtonBase>

          <Tooltip title={t('clear')}>
            <IconButton
              onClick={clearComparison}
              aria-label={t('clear')}
              sx={{ width: 44, height: 44, color: 'var(--text-muted)', '&:hover': { color: 'var(--accent)' } }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Panneau de comparaison */}
      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          'aria-label': t('comparatorTitle'),
          sx: {
            background: 'var(--bg)',
            color: 'var(--text)',
            borderTop: '1px solid var(--border-strong)',
            borderRadius: '28px 28px 0 0',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: '92vh',
          },
        }}
      >
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            px: { xs: 2, md: 4 },
            py: 1.5,
            background: 'var(--bg)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <CompareArrowsIcon sx={{ color: 'var(--accent)' }} />
            <Typography component="h2" sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>
              {t('comparatorTitle')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ButtonBase
              onClick={clearComparison}
              sx={{
                height: 38,
                px: 1.5,
                gap: 0.75,
                borderRadius: 999,
                color: 'var(--text-muted)',
                fontFamily: 'inherit',
                fontSize: '0.86rem',
                fontWeight: 600,
                '&:hover': { color: 'var(--accent)', background: 'var(--accent-soft)' },
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 19 }} />
              {t('clear')}
            </ButtonBase>
            <IconButton onClick={() => setOpen(false)} aria-label={t('close')} sx={{ color: 'var(--text-muted)' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <ComparisonPanel first={first} second={second} />
      </Drawer>
    </>
  );
};

export default ComparisonDock;
