import React, { useEffect, useState, useContext } from 'react'
import { Box, Typography } from '@mui/material'
import { LanguageContext } from '../../Langue/LanguageContext'
import { Link } from 'react-router-dom'
import { TypesContext } from '../../Page_1/TypesContext/TypesContext'

function SimilarPokemon({ pokemon }) {
  const [similarPokemons, setSimilarPokemons] = useState([])
  const { language } = useContext(LanguageContext)
  const typesData = useContext(TypesContext)

  useEffect(() => {
    fetch('https://pokedex-jgabriele.vercel.app/pokemons.json')
      .then((response) => response.json())
      .then((data) => {
        const similar = data.filter(
          (p) => p.types.some((type) => pokemon.types.includes(type)) && p.id !== pokemon.id
        )
        setSimilarPokemons(similar.slice(0, 12))
      })
  }, [pokemon])

  if (similarPokemons.length === 0) return null

  const primaryType = pokemon.types[0]
  const typeColor = typesData[primaryType]?.backgroundColor || '#888'

  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        variant="h6"
        sx={{
          color: 'rgba(255,255,255,0.7)',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
          mb: 2,
          textAlign: 'left',
        }}
      >
        Pokémons similaires
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '12px',
        }}
      >
        {similarPokemons.map((p) => (
          <Link to={`/pokemon/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '12px 8px',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: `${typeColor}15`,
                  border: `1px solid ${typeColor}40`,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <img
                src={p.image}
                alt={p.names[language]}
                style={{ width: '70px', height: '70px', objectFit: 'contain', imageRendering: 'pixelated' }}
              />
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: '0.68rem',
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  mt: 0.5,
                }}
              >
                {p.names[language]}
              </Typography>
            </Box>
          </Link>
        ))}
      </Box>
    </Box>
  )
}

export default SimilarPokemon
