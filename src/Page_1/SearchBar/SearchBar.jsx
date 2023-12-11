import React from 'react';
import './SearchBar.css';

export default function SearchBar({ setSearchTerm }) {
  return (
    <input
      className="search-bar"
      type="text"
      placeholder="Rechercher un Pokémon..."
      onChange={(event) => setSearchTerm(event.target.value)}
    />
  );
}