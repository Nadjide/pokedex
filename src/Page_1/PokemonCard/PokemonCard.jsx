import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Chip, Rating, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { LanguageContext } from '../../Langue/LanguageContext';
import { useFavorites } from '../../FavoritesContext';
import { TypesContext } from '../TypesContext/TypesContext';
import CompareButton from '../../components/CompareButton.jsx';

export default function PokemonCard({ pokemon }) {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const { isFavorite, toggleFavorite } = useFavorites();
  const typesData = useContext(TypesContext) || {};
  const [rating, setRating] = useState(0);

  const isFav = isFavorite(pokemon.id);

  useEffect(() => {
    try {
      const storedRating = localStorage.getItem(`rating-${pokemon.id}`);
      if (storedRating) setRating(Number(storedRating));
    } catch (e) {
      // ignore
    }
  }, [pokemon.id]);

  const handleRatingChange = (event, newValue) => {
    event.stopPropagation();
    const val = Number(newValue);
    setRating(val);
    try {
      localStorage.setItem(`rating-${pokemon.id}`, val);
    } catch (e) {
      // ignore
    }
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(pokemon.id);
  };

  const handleCardClick = () => {
    navigate(`/pokemon/${pokemon.id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/pokemon/${pokemon.id}`);
    }
  };

  const primaryType = pokemon.types?.[0] || 'normal';
  const typeColor = typesData[primaryType]?.backgroundColor || '#888';
  const pokemonName = pokemon.names?.[language] || pokemon.names?.fr || pokemon.names?.en || `#${pokemon.id}`;

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      sx={{
        position: 'relative',
        width: '210px',
        padding: '16px',
        margin: '10px',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${typeColor}40`,
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        overflow: 'hidden',
        textAlign: 'center',
        outline: 'none',
        '&:hover': {
          transform: 'translateY(-6px) scale(1.02)',
          boxShadow: `0 16px 40px rgba(0,0,0,0.5), 0 0 20px ${typeColor}50`,
          border: `1px solid ${typeColor}90`,
        },
        '&:focus-visible': {
          boxShadow: `0 0 0 3px #e63946, 0 16px 40px rgba(0,0,0,0.5)`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${typeColor}, ${typeColor}60)`,
          borderRadius: '20px 20px 0 0',
        },
      }}
    >
      <Typography
        sx={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        #{String(pokemon.id).padStart(3, '0')}
      </Typography>

      <IconButton
        onClick={handleFavoriteClick}
        aria-label={isFav ? (language === 'fr' ? 'Retirer des favoris' : 'Remove from favorites') : (language === 'fr' ? 'Ajouter aux favoris' : 'Add to favorites')}
        sx={{
          position: 'absolute',
          top: '6px',
          right: '6px',
          padding: '6px',
          color: isFav ? '#e63946' : 'rgba(255,255,255,0.3)',
          transition: 'all 0.2s ease',
          '&:hover': { color: '#e63946', background: 'rgba(230,57,70,0.15)' },
        }}
      >
        {isFav ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
      </IconButton>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2.5, mb: 1 }}>
        <img
          src={pokemon.image}
          alt={pokemonName}
          loading="lazy"
          decoding="async"
          style={{
            width: '110px',
            height: '110px',
            objectFit: 'contain',
            filter: `drop-shadow(0 4px 12px ${typeColor}60)`,
            imageRendering: 'pixelated',
          }}
        />
      </Box>

      <Typography
        sx={{
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.95rem',
          fontFamily: 'Poppins, sans-serif',
          textAlign: 'center',
          mb: 1,
          textTransform: 'capitalize',
        }}
      >
        {pokemonName}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap', mb: 1 }}>
        {pokemon.types?.map((type, index) => {
          const typeInfo = typesData[type];
          const typeLabel = typeInfo?.translations?.[language] || type;
          const bg = typeInfo?.backgroundColor || typeColor;

          return (
            <Chip
              key={index}
              label={typeLabel}
              size="small"
              sx={{
                backgroundColor: bg,
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.62rem',
                height: '20px',
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'capitalize',
                '& .MuiChip-label': { px: 0.8 },
              }}
            />
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', my: 0.5 }} onClick={(e) => e.stopPropagation()}>
        <Rating
          name={`pokemon-rating-${pokemon.id}`}
          value={rating}
          onChange={handleRatingChange}
          size="small"
          sx={{
            '& .MuiRating-iconFilled': { color: '#f4a261' },
            '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.15)' },
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <CompareButton pokemon={pokemon} />
      </Box>
    </Box>
  );
}
