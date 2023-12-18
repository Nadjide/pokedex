import React, { useContext, useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Card, CardContent, Typography, Chip, Rating, IconButton } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { LanguageContext } from '../../Langue/LanguageContext'
import { FavoritesContext } from '../../FavoritesContext'
import { CircularProgress } from '@mui/material'
import { TypesContext } from '../TypesContext/TypesContext'

export default function PokemonCard({ pokemon }) {
  const { language } = useContext(LanguageContext)
  const [rating, setRating] = useState(0)
  const { favorites, setFavorites } = useContext(FavoritesContext)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const typesData = useContext(TypesContext);

  useEffect(() => {
    setIsLoading(true)
    const storedRating = localStorage.getItem(`rating-${pokemon.id}`)
    if (storedRating) {
      setRating(Number(storedRating))
    }

    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || []
    setIsFavorite(storedFavorites.includes(pokemon.id))
    setIsLoading(false)
  }, [pokemon.id])

  const handleRatingChange = (event, newValue) => {
    event.stopPropagation()
    const numericValue = Number(newValue)
    setRating(numericValue)
  }

  const handleFavoriteClick = () => {
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

  const LinkBehavior = React.forwardRef((props, ref) => (
    <RouterLink ref={ref} to={`/pokemon/${pokemon.id}`} {...props} />
  ))

  if (isLoading) {
    return <CircularProgress />
  }

  return (
    <Card
      sx={{
        position: 'relative',
        border: '1px solid #000000',
        borderRadius: '2px',
        padding: '20px',
        margin: '20px',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
        width: '200px',
        height: '200px',
        '&:hover': {
          textDecoration: 'none',
        },
      }}
    >
      <IconButton
        onClick={handleFavoriteClick}
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
        }}
      >
        {isFavorite ? <FavoriteIcon color="primary" /> : <FavoriteBorderIcon />}
      </IconButton>
      <Typography
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: 'bold',
          fontSize: '0.75rem',
        }}
      >
        N°{String(pokemon.id).padStart(3, '0')}
      </Typography>
      <CardContent component={LinkBehavior} style={{ textDecoration: 'none', color: '#000000' }}>
        <img src={pokemon.image} alt={pokemon.names[language]} />
        <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          {pokemon.names[language]}
        </Typography>
        <Rating
          name={`pokemon-rating-${pokemon.id}`}
          value={rating}
          onChange={handleRatingChange}
          onClick={(event) => event.stopPropagation()}
        />
        <div
          sx={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            marginBottom: '10px',
            flexWrap: 'wrap',
          }}
        >
          {pokemon.types.map((type, index) => (
            <Chip
              key={index}
              label={typesData[type].translations[language]}
              sx={{
                padding: '5px',
                borderRadius: '5px',
                textTransform: 'capitalize',
                textAlign: 'center',
                textShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
                backgroundColor: typesData[type].backgroundColor,
                color: '#ffffff',
                fontWeight: 'bold',
                margin: '5px',
                border: '1px solid #000000',
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
