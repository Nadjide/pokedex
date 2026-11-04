import React, { createContext, useState, useEffect, useContext } from 'react';

export const FavoritesContext = createContext({
  favorites: [],
  setFavorites: () => {},
  toggleFavorite: () => {},
  isFavorite: () => false,
});

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('favorites');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to parse favorites from localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage:', e);
    }
  }, [favorites]);

  const toggleFavorite = (pokemonId) => {
    setFavorites((prev) =>
      prev.includes(pokemonId) ? prev.filter((id) => id !== pokemonId) : [...prev, pokemonId]
    );
  };

  const isFavorite = (pokemonId) => favorites.includes(pokemonId);

  return (
    <FavoritesContext.Provider value={{ favorites, setFavorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
