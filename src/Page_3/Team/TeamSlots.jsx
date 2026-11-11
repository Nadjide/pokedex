import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { usePokemonStats } from '../../hooks/usePokemonDetails.js';
import { useTranslation } from '../../i18n/translations.js';
import { getTypeColor } from '../../Theme/typeColors.js';
import { formatId, getPokemonName } from '../../utils/pokemon.js';
import PokemonArtwork from '../../components/PokemonArtwork.jsx';
import TypeBadge from '../../components/TypeBadge.jsx';
import { Shimmer } from '../../Page_1/PokemonCard/PokemonCardSkeleton.jsx';

const slotBaseSx = {
  position: 'relative',
  isolation: 'isolate',
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  height: '100%',
  minHeight: { xs: 214, sm: 246 },
  p: { xs: 1.5, sm: 2 },
  borderRadius: 'var(--radius-lg)',
};

const memberSx = {
  ...slotBaseSx,
  background:
    'linear-gradient(165deg, color-mix(in srgb, var(--type) var(--card-tint), var(--surface)) 0%, color-mix(in srgb, var(--type-2) 6%, var(--surface)) 72%)',
  border: '1px solid color-mix(in srgb, var(--type) 24%, var(--border))',
  boxShadow: 'var(--shadow-sm)',
  transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease',
  '&:hover, &:focus-within': {
    transform: 'translateY(-4px)',
    borderColor: 'color-mix(in srgb, var(--type) 60%, transparent)',
    boxShadow: 'var(--shadow-md)',
  },
  // Lien étiré : toute la carte mène à la fiche, le bouton de retrait reste au-dessus.
  '& .slot-link': { color: 'inherit', textDecoration: 'none', outline: 'none' },
  '& .slot-link::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    borderRadius: 'var(--radius-lg)',
  },
  '& .slot-link:focus-visible::after': { outline: '2px solid var(--accent)', outlineOffset: '-2px' },
};

const slotNumberSx = {
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: '0.86rem',
  letterSpacing: '0.04em',
  color: 'var(--text-muted)',
  fontVariantNumeric: 'tabular-nums',
};

// Membre de l'équipe. Ses statistiques de base sont chargées ici et remontées
// à la page (`onStats`) pour le calcul du total de l'équipe.
export function TeamMemberSlot({ pokemon, onRemove, onStats, removeRef }) {
  const { t, language } = useTranslation();
  const stats = usePokemonStats(pokemon.id);

  useEffect(() => {
    onStats?.(pokemon.id, stats);
  }, [pokemon.id, stats, onStats]);

  const types = pokemon.types?.length ? pokemon.types : ['normal'];
  const name = getPokemonName(pokemon, language);
  const removeLabel = t('team.removeMember', { name });

  return (
    <Box
      component="article"
      sx={memberSx}
      style={{ '--type': getTypeColor(types[0]), '--type-2': getTypeColor(types[1] || types[0]) }}
    >
      <Typography sx={{ ...slotNumberSx, minHeight: 34, display: 'flex', alignItems: 'center' }}>
        {formatId(pokemon.id)}
      </Typography>

      <Box sx={{ display: 'grid', placeItems: 'center', mb: 1 }}>
        <PokemonArtwork
          pokemon={pokemon}
          alt=""
          loading="eager"
          sx={{ width: { xs: '66%', sm: '72%' }, maxWidth: 150, filter: 'drop-shadow(0 10px 14px rgba(0, 0, 0, 0.28))' }}
        />
      </Box>

      <Typography
        component="h3"
        sx={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: { xs: '1rem', sm: '1.08rem' },
          lineHeight: 1.2,
          textTransform: 'capitalize',
          overflowWrap: 'anywhere',
          mb: 1,
        }}
      >
        <Link to={`/pokemon/${pokemon.id}`} className="slot-link">
          {name}
        </Link>
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, '& svg': { display: { xs: 'none', sm: 'block' } } }}>
        {types.map((type) => (
          <TypeBadge key={type} type={type} size="sm" />
        ))}
      </Box>

      <Box
        sx={{
          mt: 'auto',
          pt: 1.25,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 1,
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
          fontWeight: 600,
        }}
      >
        <span>{t('total')}</span>
        {stats.loading ? (
          <Shimmer sx={{ width: 34, height: 12 }} />
        ) : typeof stats.total === 'number' ? (
          <Box
            component="span"
            sx={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: 'var(--text)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {stats.total}
          </Box>
        ) : (
          <Box component="span" sx={{ color: 'var(--text-faint)', fontWeight: 500 }}>
            {t('unavailable')}
          </Box>
        )}
      </Box>

      {onRemove && (
        <Tooltip title={removeLabel} placement="left">
          <IconButton
            ref={removeRef}
            onClick={onRemove}
            aria-label={removeLabel}
            size="small"
            sx={{
              position: 'absolute',
              top: { xs: 8, sm: 12 },
              right: { xs: 8, sm: 12 },
              zIndex: 2,
              width: 34,
              height: 34,
              color: 'var(--text-muted)',
              background: 'color-mix(in srgb, var(--surface) 72%, transparent)',
              backdropFilter: 'blur(6px)',
              border: '1px solid var(--border)',
              transition: 'color 0.2s ease, background 0.2s ease, transform 0.2s ease',
              '&:hover': { color: 'var(--accent)', background: 'var(--surface)', transform: 'scale(1.08)' },
              '& svg': { fontSize: 18 },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

const emptySx = {
  ...slotBaseSx,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1,
  textAlign: 'center',
  border: '1.5px dashed var(--border-strong)',
  color: 'var(--text-muted)',
  textDecoration: 'none',
};

// Emplacement libre : un lien vers la liste, ou un simple repère quand l'équipe
// affichée n'est pas modifiable (aperçu d'une équipe partagée).
export function TeamEmptySlot({ index, interactive = true, linkRef }) {
  const { t } = useTranslation();

  const content = (
    <>
      <Typography aria-hidden="true" sx={{ ...slotNumberSx, position: 'absolute', top: { xs: 14, sm: 18 }, left: { xs: 12, sm: 16 } }}>
        {index}
      </Typography>
      <Box
        aria-hidden="true"
        className="slot-plus"
        sx={{
          width: 52,
          height: 52,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          border: '1.5px dashed var(--border-strong)',
          color: 'var(--text-faint)',
          transition: 'color 0.2s ease, border-color 0.2s ease, background 0.2s ease, transform 0.2s ease',
        }}
      >
        <AddIcon />
      </Box>
      <Typography sx={{ fontSize: '0.86rem', fontWeight: 600, lineHeight: 1.3 }}>
        {interactive ? t('team.emptySlotAction') : t('team.emptySlot')}
      </Typography>
    </>
  );

  if (!interactive) {
    return <Box sx={{ ...emptySx, opacity: 0.6 }}>{content}</Box>;
  }

  return (
    <Box
      component={Link}
      ref={linkRef}
      to="/"
      aria-label={t('team.emptySlotLabel', { index })}
      sx={{
        ...emptySx,
        transition: 'border-color 0.2s ease, color 0.2s ease, background 0.2s ease',
        '&:hover, &:focus-visible': {
          borderColor: 'var(--team)',
          color: 'var(--text)',
          background: 'var(--team-soft)',
        },
        '&:hover .slot-plus, &:focus-visible .slot-plus': {
          color: 'var(--team)',
          borderColor: 'var(--team)',
          transform: 'scale(1.06)',
        },
      }}
    >
      {content}
    </Box>
  );
}

export function TeamSlotSkeleton() {
  return (
    <Box sx={{ ...slotBaseSx, background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <Shimmer sx={{ width: 44, height: 16, mb: 2 }} />
      <Shimmer sx={{ width: '62%', aspectRatio: '1 / 1', mx: 'auto', borderRadius: '50%', mb: 2 }} />
      <Shimmer sx={{ width: '60%', height: 18, mb: 1.25 }} />
      <Shimmer sx={{ width: 62, height: 22, borderRadius: 999 }} />
    </Box>
  );
}
