import React, { useState, useContext } from 'react';
import './pokemonlist.css';
import PokemonCard from '../PokemonCard/PokemonCard.jsx';
import pokemonData from './pokemons.json';
import SearchBar from '../SearchBar/SearchBar';
import { LanguageContext } from '../../Langue/LanguageContext';

export default function PokemonList() {
  const { language } = useContext(LanguageContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

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
          <option value="">Tous les types</option>
          {pokemonData
            .flatMap(pokemon => pokemon.types)
            .filter((type, index, self) => self.indexOf(type) === index)
            .map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
        </select>
        {filteredPokemons.map(pokemon => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>
    );
}