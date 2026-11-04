import React, { createContext, useState, useContext, useEffect } from 'react';

const FilterContext = createContext();

export const useFilter = () => useContext(FilterContext);

export const FilterProvider = ({ children }) => {
  const [types, setTypes] = useState([]);
  const [generations, setGenerations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('id-asc'); // id-asc, id-desc, name-asc, name-desc, favorites, weight-desc, height-desc
  const [activeTypeFilters, setActiveTypeFilters] = useState([]);
  const [activeGenFilter, setActiveGenFilter] = useState('');

  useEffect(() => {
    const standardTypes = [
      'normal', 'fire', 'water', 'electric', 'grass', 'ice',
      'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
      'rock', 'ghost', 'dragon', 'steel', 'fairy'
    ];
    setTypes(standardTypes);

    setGenerations([
      { id: '', name: 'Toutes les générations', nameEn: 'All generations' },
      { id: '1', name: 'Gen I • Kanto (1-151)', nameEn: 'Gen I • Kanto (1-151)' },
    ]);
  }, []);

  const toggleTypeFilter = (type) => {
    setActiveTypeFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setActiveTypeFilters([]);
    setActiveGenFilter('');
    setSearchTerm('');
    setSortOrder('id-asc');
  };

  return (
    <FilterContext.Provider
      value={{
        types,
        generations,
        searchTerm,
        setSearchTerm,
        activeTypeFilters,
        toggleTypeFilter,
        activeGenFilter,
        setActiveGenFilter,
        sortOrder,
        setSortOrder,
        clearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
