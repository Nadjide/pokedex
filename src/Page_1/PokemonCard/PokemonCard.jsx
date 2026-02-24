import React, { useContext, useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Typography, Chip, Rating, IconButton } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { LanguageContext } from '../../Langue/LanguageContext'
import { FavoritesContext } from '../../FavoritesContext'
import { TypesContext } from '../TypesContext/TypesContext'

export default function PokemonCard({ pokemon }) {
  const { language } = useContext(LanguageContext)
  const [rating, setRating] = useState(0)
  const { favorites, setFavorites } = useContext(FavoritesContext)
  const [isFavorite, setIsFavorite] = useState(false)
  const typesData = useContext(TypesContext)

  useEffect(() => {
    const storedRating = localStorage.getItem(`rating-${pokemon.id}`)
    if (storedRating) setRating(Number(storedRating))
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || []
    setIsFavorite(storedFavorites.includes(pokemon.id))
  }, [pokemon.id])

  const handleRatingChange = (event, newValue) => {
    event.stopPropagation()
    setRating(Number(newValue))
  }

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    if (isFavorite) {
      const newFavorites = favorites.filter((id) => id !== pokemon.id)
      setFavorites(newFavorites)
      setIsFavorite(false)
    } else {
      const newFavorites = [...favorites, pokemon.id]
      setFavorites(newFavorites)
      setIsFavorite(true)
    }
  }

  useEffect(() => {
    localStorage.setItem(`rating-${pokemon.id}`, rating)
  }, [pokemon.id, rating])

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  const primaryType = pokemon.types[0]
  const typeColor = typesData[primaryType]?.backgroundColor || '#888'

  return (
    <RouterLink to={`/pokemon/${pokemon.id}`} style={{ textDecoration: 'none' }}>
      <Box
        sx={{
          position: 'relative',
          width: '200px',
          padding: '16px',
          margin: '10px',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${typeColor}40`,
          borderRadius: '20px',
          boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.03)',
            boxShadow: `0 16px 40px rgba(0,0,0,0.5), 0 0 20px ${typeColor}50`,
            border: `1px solid ${typeColor}90`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${typeColor}, ${typeColor}60)`,
            borderRadius: '20px 20px 0 0',
          },
        }}
      >
        <Typography
          sx={{
            position: 'absolute',
            top: '12px', left: '12px',
            color: 'rgba(255,255,255,0.35)',
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          #{String(pokemon.id).padStart(3, '0')}
        </Typography>

        <IconButton
          onClick={handleFavoriteClick}
          sx={{
            position: 'absolute',
            top: '4px', right: '4px',
            padding: '4px',
            color: isFavorite ? '#e63946' : 'rgba(255,255,255,0.25)',
            transition: 'all 0.2s ease',
            '&:hover': { color: '#e63946', background: 'rgba(230,57,70,0.1)' },
          }}
        >
          {isFavorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </IconButton>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2.5, mb: 1 }}>
          <img
            src={pokemon.image}
            alt={pokemon.names[language]}
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
            fontSize: '0.9rem',
            fontFamily: 'Poppins, sans-serif',
            textAlign: 'center',
            mb: 1,
            textTransform: 'capitalize',
          }}
        >
          {pokemon.names[language]}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap', mb: 1 }}>
          {pokemon.types.map((type, index) => (
            <Chip
              key={index}
              label={typesData[type].translations[language]}
              size="small"
              sx={{
                backgroundColor: typesData[type].backgroundColor,
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.62rem',
                height: '20px',
                fontFamily: 'Poppins, sans-serif',
                textTransform: 'capitalize',
                '& .MuiChip-label': { px: 0.8 },
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Rating
            name={`pokemon-rating-${pokemon.id}`}
            value={rating}
            onChange={handleRatingChange}
            onClick={(e) => e.preventDefault()}
            size="small"
            sx={{
              '& .MuiRating-iconFilled': { color: '#f4a261' },
              '& .MuiRating-iconEmpty': { color: 'rgba(255,255,255,0.15)' },
            }}
          />
        </Box>
      </Box>
    </RouterLink>
  )
}
