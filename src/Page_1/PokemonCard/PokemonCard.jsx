import React, { useContext } from 'react';
import './pokemoncard.css';
import typesData from '../PokemonList/types.json';
import { LanguageContext } from '../../Langue/LanguageContext';

export default function PokemonCard({ pokemon }) {
  const { language } = useContext(LanguageContext);

  return (
    <div className="pokemon-card">
      <img src={pokemon.image} alt={pokemon.names[language]} />
      <h2>{pokemon.names[language]}</h2>
      <div className="pokemon-types">
        {pokemon.types.map((type, index) => (
          <span
            key={index}
            className={`pokemon-type ${type}`}
            style={{ backgroundColor: typesData[type].backgroundColor }}
          >
            {typesData[type].translations[language]}
          </span>
        ))}
      </div>
    </div>
  );
}