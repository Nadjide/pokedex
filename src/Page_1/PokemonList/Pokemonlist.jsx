import React, { useState, useContext } from 'react';
import './pokemonlist.css';
import PokemonCard from '../PokemonCard/PokemonCard.jsx';
import pokemonData from './pokemons.json';
import SearchBar from '../SearchBar/SearchBar';
import { LanguageContext } from '../../Langue/LanguageContext';
import types from './types.json';

export default function PokemonList() {
  const { language } = useContext(LanguageContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const uniqueTypes = Array.from(new Set(pokemonData.flatMap(pokemon => pokemon.types)));

  const filteredPokemons = pokemonData
    .filter(pokemon =>
      pokemon.names[language].toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(pokemon => {
      return typeFilter ? pokemon.types.includes(typeFilter) : true;
    });

  return (
    <div className="pokemonlist">
      <SearchBar setSearchTerm={setSearchTerm} />
      <select className='typeSelect' value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
        <option value="">{types.normal.translations[language]}</option>
        {uniqueTypes.map(type => (
          <option key={type} value={type}>
            {types[type].translations[language]}
          </option>
        ))}
      </select>
      {filteredPokemons.map(pokemon => (
        <PokemonCard key={pokemon.id} pokemon={pokemon} />
      ))}
    </div>
  );
}