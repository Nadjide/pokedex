import React, { useContext, useState, useEffect } from 'react';
import { Box, Select, MenuItem } from '@mui/material';
import SearchBar from '../SearchBar/SearchBar';
import PokemonCard from '../PokemonCard/PokemonCard';
import pokemonData from './pokemons.json';
import types from './types.json';
import { LanguageContext } from '../../Langue/LanguageContext';

export default function PokemonList() {
  const { language } = useContext(LanguageContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  }, []);

  const uniqueTypes = Array.from(new Set(pokemonData.flatMap(pokemon => pokemon.types)));

  const filteredPokemons = pokemonData
    .filter(pokemon =>
      pokemon.names[language].toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(pokemon => {
      return typeFilter ? pokemon.types.includes(typeFilter) : true;
    })
    .sort((a, b) => {
      const aIsFavorite = favorites.includes(a.id);
      const bIsFavorite = favorites.includes(b.id);

      if (aIsFavorite && !bIsFavorite) {
        return -1;
      }

      if (bIsFavorite && !aIsFavorite) {
        return 1;
      }

      return 0;
    });

  return (
    <Box sx={{
      display: 'flex',
      flexFlow: 'row wrap',
      margin: '0 auto',
      maxWidth: '1200px',
      padding: '20px',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <SearchBar setSearchTerm={setSearchTerm} />
      <Select
        value={typeFilter}
        displayEmpty
        onChange={e => setTypeFilter(e.target.value)}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          margin: '20px 0',
          marginTop: '10px',
          backgroundColor: '#282c34',
          border: '1px solid #ffffff',
          color: 'white',
          textAlign: 'center',
          textDecoration: 'none',
          fontSize: '16px',
          borderRadius: '4px',
          cursor: 'pointer',
          padding: '3px',
          height: '50px', 
        }}
      >
        <MenuItem value="" style={{ opacity: 0.7 }}>{types.normal.translations[language] || "Tous"}</MenuItem>
        {uniqueTypes.map(type => (
          <MenuItem key={type} value={type}>
            {types[type].translations[language]}
          </MenuItem>
        ))}
      </Select>
      {filteredPokemons.map(pokemon => (
        <PokemonCard key={pokemon.id} pokemon={pokemon} />
      ))}
    </Box>
  );
}