import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './Page_1/header/Header.jsx';
import PokemonList from './Page_1/PokemonList/Pokemonlist.jsx';
import PokemonDetail from './Page_2/PokemonDetails/PokemonDetail.jsx';
import { LanguageContext } from './Langue/LanguageContext.jsx';
import { FavoritesContext } from './FavoritesContext';

function App() {
  const [language, setLanguage] = useState('en');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <FavoritesContext.Provider value={{ favorites, setFavorites }}>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<PokemonList />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />
          </Routes>
        </div>
      </Router>
      </FavoritesContext.Provider>
    </LanguageContext.Provider>
  );
}

export default App;