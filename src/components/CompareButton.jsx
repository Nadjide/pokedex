import React, { useContext } from 'react';
import { useComparison } from '../Comparison/ComparisonContext.jsx';
import { LanguageContext } from '../Langue/LanguageContext.jsx';
import Button from '@mui/material/Button';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const CompareButton = ({ pokemon }) => {
  const { toggleComparison, selectedPokemons } = useComparison();
  const { language } = useContext(LanguageContext);
  const isSelected = selectedPokemons.some((p) => p.id === pokemon.id);

  return (
    <Button
      variant={isSelected ? 'contained' : 'outlined'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleComparison(pokemon);
      }}
      startIcon={<CompareArrowsIcon />}
      size="small"
      sx={{
        borderRadius: '20px',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 600,
        fontSize: '0.72rem',
        textTransform: 'none',
        px: 1.5,
        py: 0.4,
        borderColor: isSelected ? '#4cc9f0' : 'rgba(255,255,255,0.2)',
        backgroundColor: isSelected ? '#4cc9f0' : 'rgba(255,255,255,0.04)',
        color: isSelected ? '#0d0d1a' : 'rgba(255,255,255,0.8)',
        '&:hover': {
          borderColor: '#4cc9f0',
          backgroundColor: isSelected ? '#3ab4db' : 'rgba(76,201,240,0.15)',
          color: isSelected ? '#0d0d1a' : '#fff',
        },
      }}
    >
      {isSelected
        ? (language === 'fr' ? 'Sélectionné' : 'Selected')
        : (language === 'fr' ? 'Comparer' : 'Compare')}
    </Button>
  );
};

export default CompareButton;
