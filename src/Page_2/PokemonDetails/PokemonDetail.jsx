import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, Button, Modal, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LanguageContext } from '../../Langue/LanguageContext';
import SimilarPokemon from '../SimilarPokemon/SimilarPokemon';
import { TypesContext } from '../../Page_1/TypesContext/TypesContext';

export default function PokemonDetail() {
  const { language } = useContext(LanguageContext);
  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const typesData = useContext(TypesContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('https://pokedex-jgabriele.vercel.app/pokemons.json')
      .then(response => response.json())
      .then(data => {
        const pokemonData = data.find(p => p.id === Number(id));
        setPokemon(pokemonData);
      });
  }, [id]);

  if (!pokemon) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins, sans-serif' }}>
          Chargement...
        </Typography>
      </Box>
    );
  }

  const primaryType = pokemon.types[0];
  const typeColor = typesData[primaryType]?.backgroundColor || '#888';

  return (
    <Box sx={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'Poppins, sans-serif',
            mb: 2,
            borderRadius: '50px',
            px: 2,
            '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.06)' },
          }}
        >
          Retour
        </Button>
      </Link>

      {/* Main card */}
      <Box
        sx={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${typeColor}40`,
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${typeColor}15`,
          position: 'relative',
        }}
      >
        {/* Top accent */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${typeColor}, ${typeColor}60)` }} />

        {/* Hero section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${typeColor}25 0%, ${typeColor}08 100%)`,
            padding: '48px 24px 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              position: 'absolute',
              top: '20px', left: '24px',
              color: 'rgba(255,255,255,0.3)',
              fontWeight: 700, fontSize: '1rem',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            #{String(pokemon.id).padStart(3, '0')}
          </Typography>

          <Box
            component="img"
            src={pokemon.image}
            alt={pokemon.names[language]}
            sx={{
              width: '220px', height: '220px',
              objectFit: 'contain',
              filter: `drop-shadow(0 10px 30px ${typeColor}70)`,
              imageRendering: 'pixelated',
            }}
          />

          <Typography
            variant="h4"
            sx={{
              color: '#fff', fontWeight: 800,
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'capitalize',
              mt: 2, mb: 1.5,
            }}
          >
            {pokemon.names[language]}
          </Typography>

          <Box sx={{ display: 'flex', gap: '8px' }}>
            {pokemon.types.map((type, index) => (
              <Chip
                key={index}
                label={typesData[type].translations[language]}
                sx={{
                  backgroundColor: typesData[type].backgroundColor,
                  color: '#fff', fontWeight: 600,
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '0.8rem',
                  '& .MuiChip-label': { px: 1.5 },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Stats row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {[
            { label: 'Taille', value: `${pokemon.height} m` },
            { label: 'Poids', value: `${pokemon.weight} kg` },
            { label: 'Capacités', value: pokemon.moves.length },
          ].map((stat, i, arr) => (
            <Box
              key={stat.label}
              sx={{
                flex: 1, textAlign: 'center', padding: '20px 8px',
                borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}
            >
              <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontFamily: 'Poppins, sans-serif', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>
                {stat.label}
              </Typography>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', fontFamily: 'Poppins, sans-serif' }}>
                {stat.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Moves button */}
        <Box sx={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
          <Button
            onClick={() => setIsModalOpen(true)}
            sx={{
              background: `linear-gradient(135deg, ${typeColor} 0%, ${typeColor}bb 100%)`,
              color: '#fff', fontFamily: 'Poppins, sans-serif', fontWeight: 600,
              px: 4, py: 1.5, borderRadius: '50px',
              boxShadow: `0 4px 20px ${typeColor}50`,
              '&:hover': {
                background: `linear-gradient(135deg, ${typeColor}dd 0%, ${typeColor} 100%)`,
                boxShadow: `0 6px 28px ${typeColor}70`,
              },
            }}
          >
            Voir les capacités ({pokemon.moves.length})
          </Button>
        </Box>
      </Box>

      <SimilarPokemon pokemon={pokemon} />
      <MovesModal moves={pokemon.moves} open={isModalOpen} onClose={() => setIsModalOpen(false)} typeColor={typeColor} />
    </Box>
  );
}

function MovesModal({ moves, open, onClose, typeColor }) {
  return (
    <Modal open={open} onClose={onClose} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
      <Box
        sx={{
          background: '#12121f',
          border: `1px solid ${typeColor}40`,
          borderRadius: '20px',
          width: '100%', maxWidth: '480px',
          maxHeight: '80vh', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 30px ${typeColor}20`,
          outline: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
            Capacités
          </Typography>
          <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.4)', minWidth: 0, borderRadius: '50%', p: 0.5, '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.08)' } }}>
            ✕
          </Button>
        </Box>
        <Box sx={{ overflow: 'auto', padding: '16px 24px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {moves.map((move, index) => (
            <Chip
              key={index}
              label={move}
              sx={{
                backgroundColor: `${typeColor}18`,
                color: 'rgba(255,255,255,0.85)',
                border: `1px solid ${typeColor}35`,
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.72rem',
                textTransform: 'capitalize',
              }}
            />
          ))}
        </Box>
      </Box>
    </Modal>
  );
}
