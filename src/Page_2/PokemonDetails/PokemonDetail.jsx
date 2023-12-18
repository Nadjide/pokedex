import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Modal } from '@mui/material';
import { LanguageContext } from '../../Langue/LanguageContext';
import SimilarPokemon from '../SimilarPokemon/SimilarPokemon';
import { TypesContext } from '../../Page_1/TypesContext/TypesContext';


export default function PokemonDetail() {
  const { language } = useContext(LanguageContext);
  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const typesData = useContext(TypesContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('https://pokedex-jgabriele.vercel.app/pokemons.json')
      .then(response => response.json())
      .then(data => {
        const pokemonData = data.find(pokemon => pokemon.id === Number(id));
        setPokemon(pokemonData);
      });
  }, [id]);

  if (!pokemon) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '20px auto',
        padding: '20px',
        border: 1,
        borderColor: '#ddd',
        borderRadius: '10px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f9f9f9',
        maxWidth: '500px',
        width: '80%',
      }}
    >
      <img src={pokemon.image} alt={pokemon.names[language]} style={{ width: 200, height: 200, borderRadius: '50%' }} />
      <Typography variant="h5" sx={{ my: 2, color: '#333', fontWeight: 'bold' }}>
        {pokemon.names[language]}
      </Typography>
      <Typography sx={{ color: '#666' }}>Height: {pokemon.height}</Typography>
      <Typography sx={{ color: '#666' }}>Weight: {pokemon.weight}</Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          mt: 2,
        }}
      >
        {pokemon.types.map((type, index) => (
          <Box
            key={index}
            sx={{
              padding: '5px 10px',
              borderRadius: '5px',
              backgroundColor: typesData[type].backgroundColor,
              color: '#fff',
              textTransform: 'uppercase',
              fontSize: '14px',
            }}
          >
            {typesData[type].translations[language]}
          </Box>
        ))}
      </Box>
      <Button
        sx={{
          padding: '10px',
          backgroundColor: '#000',
          color: '#fff',
          mt: 2,
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          },
        }}
        onClick={() => setIsModalOpen(true)}
      >
        Moves
      </Button>
      <MovesModal moves={pokemon.moves} open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <SimilarPokemon pokemon={pokemon} />
    </Box>
  );
}

function MovesModal({ moves, open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: '10px',
          width: '80%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflow: 'auto',
          fontSize: '12px',
          outline: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Moves
        </Typography>
        {moves.map((move, index) => (
          <Typography key={index} sx={{ color: '#666' }}>
            {move}
          </Typography>
        ))}
        <Button
          sx={{
            display: 'block',
            mx: 'auto',
            mt: 2,
            padding: '10px 20px',
            backgroundColor: 'rgb(64, 64, 64)',
            color: '#fff',
            '&:hover': {
              backgroundColor: 'rgba(64, 64, 64, 0.8)',
            },
          }}
          onClick={onClose}
        >
          Fermer
        </Button>
      </Box>
    </Modal>
  );
}