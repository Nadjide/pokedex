import React, { useEffect, useState, useContext } from 'react'
import { Box, Typography, Grid, Card, CardMedia, CardContent } from '@mui/material'
import { LanguageContext } from '../../Langue/LanguageContext'
import { Link } from 'react-router-dom'

function SimilarPokemon({ pokemon }) {
  const [similarPokemons, setSimilarPokemons] = useState([])
  const { language } = useContext(LanguageContext)

  useEffect(() => {
    fetch('https://pokedex-jgabriele.vercel.app/pokemons.json')
      .then((response) => response.json())
      .then((data) => {
        const similar = data.filter(
          (p) => p.types.some((type) => pokemon.types.includes(type)) && p.id !== pokemon.id
        )
        setSimilarPokemons(similar)
      })
  }, [pokemon])

  if (similarPokemons.length === 0) {
    return null
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">Pokémons similaires :</Typography>
      <Grid container spacing={2} direction="row-reverse">
        {similarPokemons.map((p) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
            <Link to={`/pokemon/${p.id}`} style={{ textDecoration: 'none' }}>
              <Card>
                <CardMedia component="img" height="140" image={p.image} alt={p.names[language]} />
                <CardContent>
                  <Typography>{p.names[language]}</Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default SimilarPokemon
