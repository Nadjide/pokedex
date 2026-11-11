import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { useTranslation } from '../../i18n/translations.js';
import { useRating } from '../../hooks/useRating.js';
import { getTypeColor } from '../../Theme/typeColors.js';
import { formatId, getPokemonName } from '../../utils/pokemon.js';
import PokemonArtwork from '../../components/PokemonArtwork.jsx';
import TypeBadge from '../../components/TypeBadge.jsx';
import FavoriteButton from '../../components/FavoriteButton.jsx';
import CompareButton from '../../components/CompareButton.jsx';
import TeamButton from '../../components/TeamButton.jsx';
import PokeballMark from '../../components/PokeballMark.jsx';

// Les couleurs du type arrivent par variables CSS (--type, --type-2) : le style
// reste identique pour toutes les cartes et n'est généré qu'une seule fois.
const cardSx = {
  position: 'relative',
  isolation: 'isolate',
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  p: { xs: 1.5, sm: 2 },
  borderRadius: 'var(--radius-lg)',
  background:
    'linear-gradient(165deg, color-mix(in srgb, var(--type) var(--card-tint), var(--surface)) 0%, color-mix(in srgb, var(--type-2) 6%, var(--surface)) 72%)',
  border: '1px solid color-mix(in srgb, var(--type) 24%, var(--border))',
  boxShadow: 'var(--shadow-sm)',
  overflow: 'hidden',
  transition:
    'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.35s ease, border-color 0.35s ease',
  // `backwards` : après l'animation d'entrée, le survol reprend la main sur transform.
  animation: 'card-in 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) backwards',
  animationDelay: 'calc(var(--i, 0) * 28ms)',

  '&:hover, &:focus-within': {
    transform: 'translateY(-6px)',
    borderColor: 'color-mix(in srgb, var(--type) 60%, transparent)',
    boxShadow: '0 24px 44px -20px color-mix(in srgb, var(--type) 70%, transparent), var(--shadow-md)',
  },
  '&:hover .card-art, &:focus-within .card-art': {
    transform: 'scale(1.1) translateY(-4px)',
  },
  '&:hover .card-ring, &:focus-within .card-ring': {
    transform: 'rotate(40deg) scale(1.05)',
    opacity: 0.2,
  },

  // Sur les appareils à pointeur, « Comparer » et « Équipe » n'apparaissent qu'au
  // survol ou au focus (ils restent visibles une fois activés).
  '@media (hover: hover)': {
    '& .card-compare:not([aria-pressed="true"]), & .card-team:not([aria-pressed="true"])': {
      opacity: 0,
      transform: 'translateX(6px)',
    },
    '&:hover .card-compare, &:focus-within .card-compare, &:hover .card-team, &:focus-within .card-team': {
      opacity: 1,
      transform: 'none',
    },
  },

  // Lien étiré : toute la carte est cliquable, les boutons restent au-dessus.
  '& .card-link': { color: 'inherit', textDecoration: 'none', outline: 'none' },
  '& .card-link::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    borderRadius: 'var(--radius-lg)',
  },
  '& .card-link:focus-visible::after': {
    outline: '2px solid var(--accent)',
    outlineOffset: '-2px',
  },
};

const artZoneSx = {
  position: 'relative',
  display: 'grid',
  placeItems: 'center',
  mt: 0.5,
  mb: 1,
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '78%',
    aspectRatio: '1 / 1',
    borderRadius: '50%',
    background: 'radial-gradient(circle, color-mix(in srgb, var(--type) 55%, transparent) 0%, transparent 68%)',
    opacity: 0.55,
    zIndex: -1,
  },
};

function PokemonCard({ pokemon, index = 0 }) {
  const { t, language } = useTranslation();
  const [rating] = useRating(pokemon.id);

  const types = pokemon.types?.length ? pokemon.types : ['normal'];
  const name = getPokemonName(pokemon, language);

  return (
    <Box
      component="article"
      style={{
        '--type': getTypeColor(types[0]),
        '--type-2': getTypeColor(types[1] || types[0]),
        '--i': Math.min(index, 16),
      }}
      sx={cardSx}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minHeight: 34 }}>
        <Typography
          sx={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.86rem',
            letterSpacing: '0.04em',
            color: 'var(--text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatId(pokemon.id)}
        </Typography>
        {rating > 0 && (
          <Box
            component="span"
            aria-label={t('ratedOutOf5', { value: rating })}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              color: 'var(--star)',
              fontSize: '0.76rem',
              fontWeight: 700,
            }}
          >
            <StarIcon sx={{ fontSize: 14 }} />
            {rating}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: { xs: 8, sm: 12 },
          right: { xs: 8, sm: 12 },
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
        }}
      >
        <FavoriteButton pokemonId={pokemon.id} />
        <CompareButton pokemon={pokemon} variant="icon" className="card-compare" />
        <TeamButton pokemonId={pokemon.id} variant="icon" className="card-team" />
      </Box>

      <Box sx={artZoneSx}>
        <PokeballMark
          outline
          size={100}
          className="card-ring"
          style={{
            position: 'absolute',
            width: '82%',
            height: 'auto',
            zIndex: -1,
            color: 'var(--type)',
            opacity: 0.12,
            transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease',
          }}
        />
        <PokemonArtwork
          pokemon={pokemon}
          alt=""
          className="card-art"
          sx={{
            width: '74%',
            filter: 'drop-shadow(0 10px 14px rgba(0, 0, 0, 0.28))',
          }}
        />
      </Box>

      <Typography
        component="h2"
        sx={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: { xs: '1rem', sm: '1.12rem' },
          lineHeight: 1.2,
          color: 'var(--text)',
          textTransform: 'capitalize',
          mb: 1,
          overflowWrap: 'anywhere',
        }}
      >
        <Link to={`/pokemon/${pokemon.id}`} className="card-link">
          {name}
        </Link>
      </Typography>

      {/* Sur mobile (2 colonnes étroites), les badges perdent leur icône pour tenir sur une ligne */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, '& svg': { display: { xs: 'none', sm: 'block' } } }}>
        {types.map((type) => (
          <TypeBadge key={type} type={type} size="sm" />
        ))}
      </Box>
    </Box>
  );
}

export default React.memo(PokemonCard);
