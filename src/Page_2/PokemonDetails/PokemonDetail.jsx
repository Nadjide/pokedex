import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LanguageContext } from '../../Langue/LanguageContext';
import typesData from '../../Page_1/PokemonList/types.json';
import pokemonsData from '../../Page_1/PokemonList/pokemons.json';
import './PokemonDetail.css';

export default function PokemonDetail() {
    const { language } = useContext(LanguageContext);
    const { id } = useParams();
    const [pokemon, setPokemon] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    useEffect(() => {
      const pokemonData = pokemonsData.find(pokemon => pokemon.id === Number(id));
      setPokemon(pokemonData);
    }, [id]);
  
    if (!pokemon) {
      return <div>Loading...</div>;
    }
  
    return (
      <div className="pokemon-detail">
        <img src={pokemon.image} alt={pokemon.names[language]} />
        <h2>{pokemon.names[language]}</h2>
        <p>Height: {pokemon.height}</p>
        <p>Weight: {pokemon.weight}</p>
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
        <button className='btn' onClick={() => setIsModalOpen(true)}>Moves</button>
        {isModalOpen && (
          <MovesModal moves={pokemon.moves} onClose={() => setIsModalOpen(false)} />
        )}
      </div>
    );
  }
  
  function MovesModal({ moves, onClose }) {
    return (
      <div className="modal" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <h2>Moves</h2>
          {moves.map((move, index) => (
            <p key={index}>{move}</p>
          ))}
          <button className="close-button" onClick={onClose}>Fermer</button>
        </div>
      </div>
    );
  }