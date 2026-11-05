import React, { useContext } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PokemonCard from '../PokemonCard/PokemonCard';
import PokemonCardSkeleton from '../PokemonCard/PokemonCardSkeleton';
import { LanguageContext } from '../../Langue/LanguageContext';
import { useFavorites } from '../../FavoritesContext';
import { usePokemon } from '../../context/PokemonContext.jsx';
import { useFilter } from '../../components/FilterShield/FilterContext.jsx';
import AdvancedSearch from '../../components/AdvancedSearch/AdvancedSearch.jsx';

export default function PokemonList() {
  const { language } = useContext(LanguageContext);
  const { favorites } = useFavorites();
  const { pokemons, loading, error, refetch } = usePokemon();
  const {
    searchTerm,
    activeTypeFilters,
    activeGenFilter,
    sortOrder,
    clearFilters,
  } = useFilter();

  if (loading) {
    return (
      <Box sx={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        <AdvancedSearch />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mt: 3 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <PokemonCardSkeleton key={i} />
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: '600px', margin: '80px auto', padding: '24px', textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={refetch}
          startIcon={<RefreshIcon />}
          sx={{
            background: '#e63946',
            color: '#fff',
            borderRadius: '50px',
            fontFamily: 'Poppins, sans-serif',
            textTransform: 'none',
            '&:hover': { background: '#d62828' },
          }}
        >
          {language === 'fr' ? 'Réessayer' : 'Retry'}
        </Button>
      </Box>
    );
  }

  const filteredPokemons = pokemons
    .filter((pokemon) => {
      // 1. Filtrage par Nom / ID
      if (searchTerm) {
        const lowerTerm = searchTerm.trim().toLowerCase();
        const localizedName = pokemon.names?.[language]?.toLowerCase() || '';
        const defaultName = (pokemon.names?.en || pokemon.names?.fr || '').toLowerCase();
        const matchesName = localizedName.includes(lowerTerm) || defaultName.includes(lowerTerm);
        const matchesId = pokemon.id.toString() === lowerTerm || `#${pokemon.id}` === lowerTerm;
        if (!matchesName && !matchesId) return false;
      }

      // 2. Filtrage par Types (ET logique)
      if (activeTypeFilters && activeTypeFilters.length > 0) {
        const hasAllTypes = activeTypeFilters.every((t) => pokemon.types?.includes(t));
        if (!hasAllTypes) return false;
      }

      // 3. Filtrage par Génération (Gen 1 = 1 to 151)
      if (activeGenFilter) {
        const genId = Number(activeGenFilter);
        if (genId === 1) {
          if (pokemon.id > 151) return false;
        } else {
          // Dataset currently only covers Gen 1 (1-151)
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const nameA = a.names?.[language] || a.names?.en || '';
      const nameB = b.names?.[language] || b.names?.en || '';

      switch (sortOrder) {
        case 'id-desc':
          return b.id - a.id;
        case 'name-asc':
          return nameA.localeCompare(nameB);
        case 'name-desc':
          return nameB.localeCompare(nameA);
        case 'favorites': {
          const aFav = favorites.includes(a.id);
          const bFav = favorites.includes(b.id);
          if (aFav && !bFav) return -1;
          if (!aFav && bFav) return 1;
          return a.id - b.id;
        }
        case 'weight-desc':
          return (b.weight || 0) - (a.weight || 0);
        case 'height-desc':
          return (b.height || 0) - (a.height || 0);
        case 'id-asc':
        default:
          return a.id - b.id;
      }
    });

  return (
    <Box sx={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      {/* Advanced Search & Filters */}
      <AdvancedSearch />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          mt: 2,
          px: 1,
        }}
      >
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.85rem',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
          }}
        >
          {filteredPokemons.length} Pokémon{filteredPokemons.length > 1 ? 's' : ''}{' '}
          {language === 'fr' ? 'trouvé' : 'found'}{filteredPokemons.length > 1 && language === 'fr' ? 's' : ''}
        </Typography>

        {(activeTypeFilters.length > 0 || searchTerm || activeGenFilter) && (
          <Button
            size="small"
            onClick={clearFilters}
            sx={{
              color: '#e63946',
              textTransform: 'none',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.8rem',
            }}
          >
            {language === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
          </Button>
        )}
      </Box>

      {filteredPokemons.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            border: '1px dashed rgba(255,255,255,0.1)',
          }}
        >
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '1.1rem',
              fontWeight: 600,
              fontFamily: 'Poppins, sans-serif',
              mb: 1,
            }}
          >
            {language === 'fr' ? 'Aucun Pokémon ne correspond à votre recherche' : 'No Pokémon matches your search'}
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.85rem',
              fontFamily: 'Poppins, sans-serif',
              mb: 2,
            }}
          >
            {language === 'fr'
              ? 'Essayez de modifier vos filtres ou termes de recherche.'
              : 'Try adjusting your filters or search terms.'}
          </Typography>
          <Button
            variant="outlined"
            onClick={clearFilters}
            sx={{
              borderColor: '#e63946',
              color: '#e63946',
              borderRadius: '50px',
              textTransform: 'none',
              fontFamily: 'Poppins, sans-serif',
              '&:hover': { borderColor: '#d62828', background: 'rgba(230,57,70,0.1)' },
            }}
          >
            {language === 'fr' ? 'Effacer tous les filtres' : 'Clear all filters'}
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
          {filteredPokemons.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </Box>
      )}
    </Box>
  );
}
