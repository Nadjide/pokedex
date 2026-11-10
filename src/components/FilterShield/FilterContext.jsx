import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const FilterContext = createContext();

export const useFilter = () => useContext(FilterContext);

// Types présents dans le Pokédex de Kanto (typage moderne : Acier et Fée inclus).
const TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'steel', 'fairy',
];

// Un Pokémon a au plus deux types : au-delà, le filtre cumulatif ne renverrait rien.
const MAX_TYPE_FILTERS = 2;

export const FilterProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('id-asc');
  const [activeTypeFilters, setActiveTypeFilters] = useState([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const toggleTypeFilter = useCallback((type) => {
    setActiveTypeFilters((prev) => {
      if (prev.includes(type)) return prev.filter((t) => t !== type);
      // Au-delà de la limite, le type le plus ancien cède sa place.
      return [...prev, type].slice(-MAX_TYPE_FILTERS);
    });
  }, []);

  const clearFilters = useCallback(() => {
    setActiveTypeFilters([]);
    setSearchTerm('');
    setSortOrder('id-asc');
    setFavoritesOnly(false);
  }, []);

  const value = useMemo(
    () => ({
      types: TYPES,
      searchTerm,
      setSearchTerm,
      activeTypeFilters,
      toggleTypeFilter,
      favoritesOnly,
      setFavoritesOnly,
      sortOrder,
      setSortOrder,
      clearFilters,
    }),
    [searchTerm, activeTypeFilters, toggleTypeFilter, favoritesOnly, sortOrder, clearFilters]
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
};
