import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, Typography, Chip } from '@mui/material';
import typesData from '../PokemonList/types.json';
import { LanguageContext } from '../../Langue/LanguageContext';

export default function PokemonCard({ pokemon }) {
  const { language } = useContext(LanguageContext);

  const LinkBehavior = React.forwardRef((props, ref) => (
    <RouterLink ref={ref} to={`/pokemon/${pokemon.id}`} {...props} />
  ));

  return (
    <Card sx={{
      border: '1px solid #000000',
      borderRadius: '2px',
      padding: '20px',
      margin: '20px',
      backgroundColor: '#f9f9f9',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
      width: '200px',
      height: '200px',
      '&:hover': {
        textDecoration: 'none',
      },
    }}>
      <CardContent component={LinkBehavior} style={{ textDecoration: 'none', color: '#000000' }}>
        <img src={pokemon.image} alt={pokemon.names[language]} />
        <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold' }}>{pokemon.names[language]}</Typography>
        <div sx={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          marginBottom: '10px',
          flexWrap: 'wrap',
        }}>
          {pokemon.types.map((type, index) => (
            <Chip
              key={index}
              label={typesData[type].translations[language]}
              sx={{
                padding: '5px',
                borderRadius: '5px',
                textTransform: 'capitalize',
                textAlign: 'center',
                textShadow: '0 0 5px rgba(0, 0, 0, 0.2)',
                backgroundColor: typesData[type].backgroundColor,
                color: '#ffffff',
                fontWeight: 'bold',
                margin: '5px',
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
