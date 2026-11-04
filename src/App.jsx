import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';
import Header from './Page_1/header/Header.jsx';
import { LanguageContext } from './Langue/LanguageContext.jsx';
import { FavoritesProvider } from './FavoritesContext.jsx';
import { TypesProvider } from './Page_1/TypesContext/TypesContext.jsx';
import { FilterProvider } from './components/FilterShield/FilterContext.jsx';
import { ComparisonProvider } from './Comparison/ComparisonContext.jsx';
import ComparisonDock from './components/ComparisonDock/ComparisonDock.jsx';
import AnimatedRoutes from './AnimatedRoutes.jsx';

function App() {
  const [language, setLanguage] = useState('fr');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <FavoritesProvider>
        <TypesProvider>
          <FilterProvider>
            <ComparisonProvider>
              <Router>
                <div className="App">
                  <Header />
                  <AnimatedRoutes />
                  <ComparisonDock />
                </div>
              </Router>
            </ComparisonProvider>
          </FilterProvider>
        </TypesProvider>
      </FavoritesProvider>
    </LanguageContext.Provider>
  );
}

export default App;
