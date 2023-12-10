import React, { useState } from 'react';
import './App.css';
import Header from './Page_1/header/Header.jsx';
import Pokemonlist from './Page_1/PokemonList/Pokemonlist.jsx';
import { LanguageContext } from './Langue/LanguageContext.jsx';

function App() {
  const [language, setLanguage] = useState('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <div className="App">
        <Header />
        <Pokemonlist />
      </div>
    </LanguageContext.Provider>
  );
}

export default App;