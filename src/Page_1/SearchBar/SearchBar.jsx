import React from 'react';
import { TextField } from '@mui/material';

export default function SearchBar({ setSearchTerm }) {
  return (
    <TextField
      variant="outlined"
      fullWidth
      sx={{
         margin: '20px 0', 
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: '#ffffff',
          },
          '&:hover fieldset': {
            borderColor: 'lightgray',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'white', 
          },
          '& input': {
            color: 'white', 
            padding: '10px', 
          },
        },
        backgroundColor: '#282c34', 
        borderRadius: '4px', 
        fontSize: '16px', 
      }}
      placeholder="Rechercher un Pokémon..."
      InputLabelProps={{
        style: { color: 'white' },
      }}
      onChange={(event) => setSearchTerm(event.target.value)}
    />
  );
}
