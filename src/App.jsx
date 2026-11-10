import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './Page_1/header/Header.jsx';
import Footer from './components/Footer.jsx';
import { LanguageProvider } from './Langue/LanguageContext.jsx';
import { ThemeModeProvider } from './Theme/ThemeModeContext.jsx';
import { FavoritesProvider } from './FavoritesContext.jsx';
import { PokemonProvider } from './context/PokemonContext.jsx';
import { TypesProvider } from './Page_1/TypesContext/TypesContext.jsx';
import { FilterProvider } from './components/FilterShield/FilterContext.jsx';
import { ComparisonProvider } from './Comparison/ComparisonContext.jsx';
import ComparisonDock from './components/ComparisonDock/ComparisonDock.jsx';
import AnimatedRoutes from './AnimatedRoutes.jsx';
import { useTranslation } from './i18n/translations.js';

function AppShell() {
  const { t } = useTranslation();

  return (
    <div className="App">
      <a className="skip-link" href="#main-content">
        {t('skipToContent')}
      </a>
      <Header />
      <main id="main-content" style={{ flex: 1 }}>
        <AnimatedRoutes />
      </main>
      <Footer />
      <ComparisonDock />
    </div>
  );
}

function App() {
  return (
    <ThemeModeProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <PokemonProvider>
            <TypesProvider>
              <FilterProvider>
                <ComparisonProvider>
                  <Router>
                    <AppShell />
                  </Router>
                </ComparisonProvider>
              </FilterProvider>
            </TypesProvider>
          </PokemonProvider>
        </FavoritesProvider>
      </LanguageProvider>
    </ThemeModeProvider>
  );
}

export default App;
