import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { usePokemon } from '../../context/PokemonContext.jsx';
import { useTranslation } from '../../i18n/translations.js';
import { getTypeColor } from '../../Theme/typeColors.js';
import { formatId, getPokemonName } from '../../utils/pokemon.js';
import PokemonArtwork from '../../components/PokemonArtwork.jsx';
import TypeBadge from '../../components/TypeBadge.jsx';

const miniCardSx = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  p: 1.5,
  borderRadius: 'var(--radius-md)',
  textDecoration: 'none',
  color: 'var(--text)',
  background:
    'linear-gradient(165deg, color-mix(in srgb, var(--type) var(--card-tint), var(--surface)) 0%, var(--surface) 75%)',
  border: '1px solid color-mix(in srgb, var(--type) 24%, var(--border))',
  transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    borderColor: 'color-mix(in srgb, var(--type) 60%, transparent)',
    boxShadow: '0 18px 32px -18px color-mix(in srgb, var(--type) 70%, transparent)',
  },
  '&:hover img': { transform: 'scale(1.08)' },
};

function SimilarPokemon({ pokemon }) {
  const { t, language } = useTranslation();
  const { getSimilarPokemons } = usePokemon();

  if (!pokemon) return null;

  const similarPokemons = getSimilarPokemons(pokemon, 12);
  if (similarPokemons.length === 0) return null;

  return (
    <Box component="section" sx={{ mt: 5 }}>
      <Typography
        component="h2"
        sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.35rem', mb: 2 }}
      >
        {t('similarPokemon')}
      </Typography>
      <Box
        component="ul"
        sx={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: { xs: '148px', sm: '168px' },
          gap: 1.75,
          m: 0,
          mx: { xs: -2, md: 0 },
          px: { xs: 2, md: 0 },
          pt: 1,
          pb: 2,
          listStyle: 'none',
          overflowX: 'auto',
          scrollSnapType: 'x proximity',
          scrollPaddingInline: '16px',
        }}
      >
        {similarPokemons.map((p) => {
          const types = p.types?.length ? p.types : ['normal'];
          return (
            <Box component="li" key={p.id} sx={{ scrollSnapAlign: 'start' }}>
              <Box
                component={Link}
                to={`/pokemon/${p.id}`}
                style={{ '--type': getTypeColor(types[0]) }}
                sx={miniCardSx}
              >
                <Typography
                  sx={{
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatId(p.id)}
                </Typography>
                <PokemonArtwork pokemon={p} alt="" sx={{ width: '78%', mx: 'auto', my: 0.75 }} />
                <Typography
                  sx={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    textTransform: 'capitalize',
                    lineHeight: 1.2,
                    mb: 1,
                  }}
                >
                  {getPokemonName(p, language)}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 'auto' }}>
                  {types.map((type) => (
                    <TypeBadge key={type} type={type} size="sm" />
                  ))}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default SimilarPokemon;
