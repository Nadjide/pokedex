import React, { useContext, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Modal, Chip, Skeleton, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CloseIcon from '@mui/icons-material/Close';
import { LanguageContext } from '../../Langue/LanguageContext';
import { useFavorites } from '../../FavoritesContext';
import { usePokemon } from '../../context/PokemonContext.jsx';
import SimilarPokemon from '../SimilarPokemon/SimilarPokemon';
import { TypesContext } from '../../Page_1/TypesContext/TypesContext';
import { getTypeBackground } from '../../Theme/typeColors';
import CompareButton from '../../components/CompareButton.jsx';

export default function PokemonDetail() {
  const { language } = useContext(LanguageContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPokemonById, loading } = usePokemon();
  const { isFavorite, toggleFavorite } = useFavorites();
  const typesData = useContext(TypesContext) || {};
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pokemon = getPokemonById(id);

  if (loading) {
    return (
      <Box sx={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
        <Skeleton variant="rounded" width={110} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '50px', mb: 2 }} />
        <Box sx={{ p: 4, borderRadius: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Skeleton variant="circular" width={180} height={180} sx={{ bgcolor: 'rgba(255,255,255,0.08)', mb: 2 }} />
          <Skeleton variant="text" width={200} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Box sx={{ display: 'flex', gap: 1, my: 2 }}>
            <Skeleton variant="rounded" width={80} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '14px' }} />
            <Skeleton variant="rounded" width={80} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '14px' }} />
          </Box>
        </Box>
      </Box>
    );
  }

  if (!pokemon) {
    return (
      <Box sx={{ maxWidth: '600px', margin: '80px auto', padding: '24px', textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, fontFamily: 'Poppins, sans-serif', mb: 1.5 }}>
          {language === 'fr' ? 'Pokémon introuvable' : 'Pokémon not found'}
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins, sans-serif', mb: 3 }}>
          {language === 'fr'
            ? `Aucun Pokémon ne correspond à l'identifiant #${id}.`
            : `No Pokémon matches identifier #${id}.`}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          startIcon={<ArrowBackIcon />}
          sx={{
            background: '#e63946',
            color: '#fff',
            borderRadius: '50px',
            fontFamily: 'Poppins, sans-serif',
            textTransform: 'none',
            px: 3,
            '&:hover': { background: '#d62828' },
          }}
        >
          {language === 'fr' ? 'Retour au Pokédex' : 'Back to Pokédex'}
        </Button>
      </Box>
    );
  }

  const primaryType = pokemon.types?.[0] || 'normal';
  const typeColor = typesData[primaryType]?.backgroundColor || '#888';
  const dynamicBg = getTypeBackground(primaryType);
  const isFav = isFavorite(pokemon.id);
  const pokemonName = pokemon.names?.[language] || pokemon.names?.fr || pokemon.names?.en || `#${pokemon.id}`;

  return (
    <Box
      sx={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '24px',
        background: `radial-gradient(circle at 50% 20%, ${dynamicBg} 0%, transparent 65%)`,
        transition: 'background 0.8s ease-in-out',
        borderRadius: '24px',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              fontFamily: 'Poppins, sans-serif',
              borderRadius: '50px',
              px: 2,
              textTransform: 'none',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.1)' },
            }}
          >
            {language === 'fr' ? 'Retour' : 'Back'}
          </Button>
        </Link>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <CompareButton pokemon={pokemon} />
          <IconButton
            onClick={() => toggleFavorite(pokemon.id)}
            aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            sx={{
              color: isFav ? '#e63946' : 'rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              '&:hover': { color: '#e63946', background: 'rgba(230,57,70,0.15)' },
            }}
          >
            {isFav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>
      </Box>

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
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${typeColor}, ${typeColor}60)`,
          }}
        />

        {/* Hero section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${typeColor}25 0%, ${typeColor}08 100%)`,
            padding: '48px 24px 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Typography
            sx={{
              position: 'absolute',
              top: '20px',
              left: '24px',
              color: 'rgba(255,255,255,0.45)',
              fontWeight: 700,
              fontSize: '1rem',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            #{String(pokemon.id).padStart(3, '0')}
          </Typography>

          <Box
            component="img"
            src={pokemon.image}
            alt={pokemonName}
            sx={{
              width: '220px',
              height: '220px',
              objectFit: 'contain',
              filter: `drop-shadow(0 10px 30px ${typeColor}70)`,
              imageRendering: 'pixelated',
            }}
          />

          <Typography
            variant="h4"
            sx={{
              color: '#fff',
              fontWeight: 800,
              fontFamily: 'Poppins, sans-serif',
              textTransform: 'capitalize',
              mt: 2,
              mb: 1.5,
              fontSize: { xs: '1.8rem', md: '2.2rem' },
            }}
          >
            {pokemonName}
          </Typography>

          <Box sx={{ display: 'flex', gap: '8px' }}>
            {pokemon.types?.map((type, index) => {
              const typeInfo = typesData[type];
              const typeLabel = typeInfo?.translations?.[language] || type;
              const bg = typeInfo?.backgroundColor || typeColor;

              return (
                <Chip
                  key={index}
                  label={typeLabel}
                  sx={{
                    backgroundColor: bg,
                    color: '#fff',
                    fontWeight: 600,
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '0.8rem',
                    textTransform: 'capitalize',
                    '& .MuiChip-label': { px: 1.5 },
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {/* Stats row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {[
            {
              label: language === 'fr' ? 'Taille' : 'Height',
              value: `${(pokemon.height / 10).toFixed(1)} m`,
            },
            {
              label: language === 'fr' ? 'Poids' : 'Weight',
              value: `${(pokemon.weight / 10).toFixed(1)} kg`,
            },
            {
              label: language === 'fr' ? 'Capacités' : 'Moves',
              value: pokemon.moves?.length || 0,
            },
          ].map((stat, i, arr) => (
            <Box
              key={stat.label}
              sx={{
                flex: 1,
                textAlign: 'center',
                padding: '20px 8px',
                borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}
            >
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: '0.72rem',
                  fontFamily: 'Poppins, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  mb: 0.5,
                }}
              >
                {stat.label}
              </Typography>
              <Typography
                sx={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
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
              color: '#fff',
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: '50px',
              textTransform: 'none',
              fontSize: '0.95rem',
              boxShadow: `0 4px 20px ${typeColor}50`,
              '&:hover': {
                background: `linear-gradient(135deg, ${typeColor}dd 0%, ${typeColor} 100%)`,
                boxShadow: `0 6px 28px ${typeColor}70`,
              },
            }}
          >
            {language === 'fr'
              ? `Voir les capacités (${pokemon.moves?.length || 0})`
              : `View moves (${pokemon.moves?.length || 0})`}
          </Button>
        </Box>
      </Box>

      <SimilarPokemon pokemon={pokemon} />
      <MovesModal
        moves={pokemon.moves || []}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        typeColor={typeColor}
        language={language}
      />
    </Box>
  );
}

function MovesModal({ moves, open, onClose, typeColor, language }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}
    >
      <Box
        sx={{
          background: '#12121f',
          border: `1px solid ${typeColor}40`,
          borderRadius: '24px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 30px ${typeColor}20`,
          outline: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box
          sx={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
            {language === 'fr' ? 'Capacités' : 'Moves'} ({moves.length})
          </Typography>
          <IconButton
            onClick={onClose}
            aria-label="Fermer"
            sx={{
              color: 'rgba(255,255,255,0.5)',
              p: 0.8,
              '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.08)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ overflow: 'auto', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {moves.map((move, index) => (
            <Chip
              key={index}
              label={move.replace(/-/g, ' ')}
              sx={{
                backgroundColor: `${typeColor}20`,
                color: 'rgba(255,255,255,0.9)',
                border: `1px solid ${typeColor}40`,
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.75rem',
                textTransform: 'capitalize',
                fontWeight: 500,
              }}
            />
          ))}
        </Box>
      </Box>
    </Modal>
  );
}
