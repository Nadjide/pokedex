import React from 'react';
import { InputBase, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function SearchBar({ setSearchTerm }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '50px',
        padding: '4px 16px',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(230, 57, 70, 0.5)',
        },
        '&:focus-within': {
          backgroundColor: 'rgba(255,255,255,0.08)',
          border: '1px solid #e63946',
          boxShadow: '0 0 0 3px rgba(230, 57, 70, 0.15)',
        },
      }}
    >
      <SearchIcon sx={{ color: 'rgba(255,255,255,0.4)', mr: 1 }} />
      <InputBase
        fullWidth
        placeholder="Rechercher un Pokémon..."
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          color: '#fff',
          fontFamily: 'Poppins, sans-serif',
          '& input::placeholder': {
            color: 'rgba(255,255,255,0.35)',
            opacity: 1,
          },
        }}
      />
    </Box>
  );
}
