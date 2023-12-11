import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './Page_1/header/Header.jsx';
import PokemonList from './Page_1/PokemonList/Pokemonlist.jsx';
import PokemonDetail from './Page_2/PokemonDetails/PokemonDetail.jsx';
import { LanguageContext } from './Langue/LanguageContext.jsx';

function App() {
  const [language, setLanguage] = useState('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<PokemonList />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />
          </Routes>
        </div>
      </Router>
    </LanguageContext.Provider>
  );
}

export default App;