import React from 'react';
import './App.css';
import Header from './Page_1/header/Header.jsx';
import Pokemonlist from './Page_1/PokemonList/Pokemonlist.jsx';

function App() {
  return (
    <div>
      <Header />
      <Pokemonlist />
    </div>
  );
}

export default App;