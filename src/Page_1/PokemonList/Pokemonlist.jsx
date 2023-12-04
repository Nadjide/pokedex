import React from 'react';
import './pokemonlist.css';
import PokemonCard from '../PokemonCard/PokemonCard.jsx';
import pokemonData from './pokemons.json';

export default function Pokemonlist() {
  return (
    <div className="pokemonlist">
      {pokemonData.map((pokemon) => (
        <PokemonCard key={pokemon.id} pokemon={pokemon} />
      ))}
    </div>
  );
}