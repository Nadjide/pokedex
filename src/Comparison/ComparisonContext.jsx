// src/Comparison/ComparisonContext.jsx
import React, { createContext, useState, useContext } from 'react';

export const ComparisonContext = createContext();

export const useComparison = () => useContext(ComparisonContext);

export const ComparisonProvider = ({ children }) => {
  const [selectedPokemons, setSelectedPokemons] = useState([]);
  const MAX_COMPARE = 2; // Limite de 2 Pokémons pour le comparateur

  const toggleComparison = (pokemon) => {
    if (!pokemon) return;
    setSelectedPokemons((prev) => {
      // Si déjà sélectionné par id, on enlève
      if (prev.some((p) => p.id === pokemon.id)) {
        return prev.filter((p) => p.id !== pokemon.id);
      }

      // Si déjà MAX_COMPARE sélectionnés, on enlève le premier et ajoute le nouveau
      if (prev.length >= MAX_COMPARE) {
        return [...prev.slice(1), pokemon];
      }

      return [...prev, pokemon];
    });
  };

  const clearComparison = () => setSelectedPokemons([]);

  return (
    <ComparisonContext.Provider value={{ selectedPokemons, toggleComparison, clearComparison, MAX_COMPARE }}>
      {children}
    </ComparisonContext.Provider>
  );
};
