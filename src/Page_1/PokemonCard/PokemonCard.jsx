import React from 'react';
import './pokemoncard.css';

export default function PokemonCard({ pokemon }) {
  return (
    <div className="pokemon-card">
      <img src={pokemon.image} alt={pokemon.names.fr} />
      <h2>{pokemon.names.fr}</h2>
      <div className="pokemon-types">
        {pokemon.types.map((type, index) => (
          <span key={index} className={`pokemon-type ${type}`}>
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}