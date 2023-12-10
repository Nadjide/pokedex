import React, { useState, useContext } from 'react';
import './pokemonlist.css';
import PokemonCard from '../PokemonCard/PokemonCard.jsx';
import pokemonData from './pokemons.json';
import SearchBar from '../SearchBar/SearchBar';
import { LanguageContext } from '../../Langue/LanguageContext';

export default function PokemonList() {
  const { language } = useContext(LanguageContext);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPokemons = pokemonData.filter((pokemon) =>
    pokemon.names[language].toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pokemonlist">
      <SearchBar setSearchTerm={setSearchTerm} />
      {filteredPokemons.map((pokemon) => (
        <PokemonCard key={pokemon.id} pokemon={pokemon} />
      ))}
    </div>
  );
}