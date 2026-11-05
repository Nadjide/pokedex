// src/components/AdvancedSearch/AdvancedSearch.jsx
import React, { useContext } from 'react';
import { useFilter } from '../FilterShield/FilterContext.jsx';
import { LanguageContext } from '../../Langue/LanguageContext.jsx';
import { TypesContext } from '../../Page_1/TypesContext/TypesContext.jsx';
import { typeColors } from '../../Theme/typeColors.js';
import {
  TextField,
  Chip,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SortIcon from '@mui/icons-material/Sort';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const AdvancedSearch = () => {
  const {
    types,
    activeTypeFilters,
    toggleTypeFilter,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    activeGenFilter,
    setActiveGenFilter,
    generations,
    clearFilters,
  } = useFilter();

  const { language } = useContext(LanguageContext);
  const typesData = useContext(TypesContext) || {};

  const hasActiveFilters = activeTypeFilters.length > 0 || searchTerm !== '' || activeGenFilter !== '' || sortOrder !== 'id-asc';

  return (
    <Box
      sx={{
        margin: '16px 0 24px 0',
        padding: { xs: '18px', md: '24px' },
        background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Top row: Search input + Sort dropdown + Gen filter */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
          gap: 2,
          mb: 2.5,
          alignItems: 'center',
        }}
      >
        {/* Search bar */}
        <TextField
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={language === 'fr' ? 'Rechercher par nom ou numéro (ex: 25, Pikachu)...' : 'Search by name or number (e.g. 25, Pikachu)...'}
          variant="outlined"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255,255,255,0.5)' }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm('')}
                  aria-label="Effacer recherche"
                  sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff' } }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
            sx: {
              color: '#fff',
              fontFamily: 'Poppins, sans-serif',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '50px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.15)',
                borderRadius: '50px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(230, 57, 70, 0.6)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e63946',
                borderWidth: '2px',
              },
              '& input::placeholder': {
                color: 'rgba(255,255,255,0.4)',
                opacity: 1,
                fontSize: '0.9rem',
              },
            },
          }}
        />

        {/* Sort selector */}
        <FormControl fullWidth size="medium">
          <InputLabel
            id="sort-select-label"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              fontFamily: 'Poppins, sans-serif',
              '&.Mui-focused': { color: '#e63946' },
            }}
          >
            {language === 'fr' ? 'Trier par' : 'Sort by'}
          </InputLabel>
          <Select
            labelId="sort-select-label"
            value={sortOrder}
            label={language === 'fr' ? 'Trier par' : 'Sort by'}
            onChange={(e) => setSortOrder(e.target.value)}
            startAdornment={<SortIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1, ml: 0.5 }} />}
            sx={{
              color: '#fff',
              borderRadius: '50px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              fontFamily: 'Poppins, sans-serif',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.15)',
                borderRadius: '50px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(230, 57, 70, 0.6)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e63946',
              },
              '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.6)' },
            }}
          >
            <MenuItem value="id-asc" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {language === 'fr' ? 'Numéro croissant (#1 → #151)' : 'Number ascending (#1 → #151)'}
            </MenuItem>
            <MenuItem value="id-desc" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {language === 'fr' ? 'Numéro décroissant (#151 → #1)' : 'Number descending (#151 → #1)'}
            </MenuItem>
            <MenuItem value="name-asc" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {language === 'fr' ? 'Nom (A → Z)' : 'Name (A → Z)'}
            </MenuItem>
            <MenuItem value="name-desc" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {language === 'fr' ? 'Nom (Z → A)' : 'Name (Z → A)'}
            </MenuItem>
            <MenuItem value="favorites" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {language === 'fr' ? 'Favoris d\'abord ⭐' : 'Favorites first ⭐'}
            </MenuItem>
            <MenuItem value="weight-desc" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {language === 'fr' ? 'Poids (Plus lourds)' : 'Weight (Heaviest)'}
            </MenuItem>
            <MenuItem value="height-desc" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {language === 'fr' ? 'Taille (Plus grands)' : 'Height (Tallest)'}
            </MenuItem>
          </Select>
        </FormControl>

        {/* Generation selector */}
        <FormControl fullWidth size="medium">
          <InputLabel
            id="gen-select-label"
            sx={{
              color: 'rgba(255,255,255,0.6)',
              fontFamily: 'Poppins, sans-serif',
              '&.Mui-focused': { color: '#e63946' },
            }}
          >
            {language === 'fr' ? 'Génération' : 'Generation'}
          </InputLabel>
          <Select
            labelId="gen-select-label"
            value={activeGenFilter}
            label={language === 'fr' ? 'Génération' : 'Generation'}
            onChange={(e) => setActiveGenFilter(e.target.value)}
            startAdornment={<FilterAltIcon sx={{ color: 'rgba(255,255,255,0.5)', mr: 1, ml: 0.5 }} />}
            sx={{
              color: '#fff',
              borderRadius: '50px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              fontFamily: 'Poppins, sans-serif',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.15)',
                borderRadius: '50px',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(230, 57, 70, 0.6)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e63946',
              },
              '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.6)' },
            }}
          >
            {generations.map((gen) => (
              <MenuItem key={gen.id} value={gen.id} style={{ fontFamily: 'Poppins, sans-serif' }}>
                {language === 'fr' ? gen.name : gen.nameEn}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Type filters row */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            {language === 'fr' ? 'Filtrer par Type(s) :' : 'Filter by Type(s):'}
          </Typography>

          {hasActiveFilters && (
            <Typography
              component="button"
              onClick={clearFilters}
              sx={{
                background: 'none',
                border: 'none',
                color: '#e63946',
                cursor: 'pointer',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '0.75rem',
                fontWeight: 600,
                p: 0,
                textDecoration: 'underline',
                '&:hover': { color: '#ff4d5a' },
              }}
            >
              {language === 'fr' ? 'Réinitialiser' : 'Reset all'}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {types.map((type) => {
            const isSelected = activeTypeFilters.includes(type);
            const color = typeColors[type] || typesData[type]?.backgroundColor || '#777';
            const label = typesData[type]?.translations?.[language] || type;

            return (
              <Chip
                key={type}
                label={label}
                onClick={() => toggleTypeFilter(type)}
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'capitalize',
                  height: 28,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: isSelected ? color : 'rgba(255,255,255,0.04)',
                  color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)',
                  border: isSelected ? `1px solid ${color}` : `1px solid rgba(255,255,255,0.12)`,
                  boxShadow: isSelected ? `0 0 12px ${color}80` : 'none',
                  '&:hover': {
                    backgroundColor: isSelected ? color : `${color}30`,
                    borderColor: color,
                    color: '#fff',
                    transform: 'translateY(-2px)',
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default AdvancedSearch;
