import React, { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { LanguageContext } from '../../Langue/LanguageContext';
import { Link } from 'react-router-dom';
import { TypesContext } from '../../Page_1/TypesContext/TypesContext';
import { usePokemon } from '../../context/PokemonContext.jsx';

function SimilarPokemon({ pokemon }) {
  const { language } = useContext(LanguageContext);
  const typesData = useContext(TypesContext) || {};
  const { getSimilarPokemons } = usePokemon();

  if (!pokemon) return null;

  const similarPokemons = getSimilarPokemons(pokemon, 12);
  if (similarPokemons.length === 0) return null;

  const primaryType = pokemon.types?.[0] || 'normal';
  const typeColor = typesData[primaryType]?.backgroundColor || '#888';

  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        variant="h6"
        sx={{
          color: 'rgba(255,255,255,0.8)',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
          mb: 2,
          textAlign: 'left',
          fontSize: '1.05rem',
        }}
      >
        {language === 'fr' ? 'Pokémons similaires' : 'Similar Pokémon'}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))',
          gap: '12px',
        }}
      >
        {similarPokemons.map((p) => {
          const pName = p.names?.[language] || p.names?.fr || p.names?.en || `#${p.id}`;
          return (
            <Link to={`/pokemon/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  padding: '12px 8px',
                  textAlign: 'center',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    background: `${typeColor}20`,
                    border: `1px solid ${typeColor}60`,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 20px ${typeColor}25`,
                  },
                }}
              >
                <img
                  src={p.image}
                  alt={pName}
                  loading="lazy"
                  decoding="async"
                  style={{ width: '70px', height: '70px', objectFit: 'contain', imageRendering: 'pixelated' }}
                />
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '0.72rem',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    mt: 0.5,
                  }}
                >
                  {pName}
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '0.62rem',
                    fontFamily: 'Poppins, sans-serif',
                  }}
                >
                  #{String(p.id).padStart(3, '0')}
                </Typography>
              </Box>
            </Link>
          );
        })}
      </Box>
    </Box>
  );
}

export default SimilarPokemon;
