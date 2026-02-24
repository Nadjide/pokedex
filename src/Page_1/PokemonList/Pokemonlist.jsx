import React, { useContext, useState, useEffect } from 'react'
import { Box, Select, MenuItem, Typography } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchBar from '../SearchBar/SearchBar'
import PokemonCard from '../PokemonCard/PokemonCard'
import { LanguageContext } from '../../Langue/LanguageContext'
import { FavoritesContext } from '../../FavoritesContext'
import { TypesContext } from '../TypesContext/TypesContext'

export default function PokemonList() {
  const { language } = useContext(LanguageContext)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const { favorites } = useContext(FavoritesContext)
  const [pokemonData, setPokemonData] = useState([])
  const types = useContext(TypesContext)

  useEffect(() => {
    fetch('https://pokedex-jgabriele.vercel.app/pokemons.json')
      .then((response) => response.json())
      .then((data) => setPokemonData(data))
  }, [])

  if (!pokemonData.length || !Object.keys(types).length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Poppins, sans-serif', fontSize: '1.1rem' }}>
          Chargement...
        </Typography>
      </Box>
    )
  }

  const uniqueTypes = Array.from(new Set(pokemonData.flatMap((pokemon) => pokemon.types)))

  const filteredPokemons = pokemonData
    .filter((pokemon) => pokemon.names[language].toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((pokemon) => (typeFilter ? pokemon.types.includes(typeFilter) : true))
    .sort((a, b) => {
      const aIsFavorite = favorites.includes(a.id)
      const bIsFavorite = favorites.includes(b.id)
      if (aIsFavorite && !bIsFavorite) return -1
      if (bIsFavorite && !aIsFavorite) return 1
      return 0
    })

  return (
    <Box sx={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: '16px', mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flex: 1, minWidth: '200px' }}>
          <SearchBar setSearchTerm={setSearchTerm} />
        </Box>
        <Select
          value={typeFilter}
          displayEmpty
          onChange={(e) => setTypeFilter(e.target.value)}
          startAdornment={<FilterListIcon sx={{ color: 'rgba(255,255,255,0.4)', ml: 1, mr: 0.5, fontSize: '1.1rem' }} />}
          sx={{
            minWidth: '190px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '50px',
            color: 'white',
            fontFamily: 'Poppins, sans-serif',
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.4)' },
            '& .MuiSelect-select': { padding: '10px 16px 10px 4px' },
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(230,57,70,0.5)',
            },
          }}
        >
          <MenuItem value="" style={{ fontFamily: 'Poppins, sans-serif' }}>Tous les types</MenuItem>
          {uniqueTypes.map((type) => (
            <MenuItem key={type} value={type} style={{ fontFamily: 'Poppins, sans-serif' }}>
              {types[type] ? types[type].translations[language] : type}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Typography
        sx={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.8rem',
          fontFamily: 'Poppins, sans-serif',
          mb: 2,
          textAlign: 'left',
        }}
      >
        {filteredPokemons.length} Pokémon{filteredPokemons.length > 1 ? 's' : ''}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {filteredPokemons.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </Box>
    </Box>
  )
}
