import { useContext } from 'react';
import { LanguageContext } from '../Langue/LanguageContext.jsx';

export const translations = {
  fr: {
    appTitle: 'Pokédex',
    searchPlaceholder: 'Rechercher par nom ou numéro (ex: 25, Pikachu)...',
    sortBy: 'Trier par',
    generation: 'Génération',
    filterByTypes: 'Filtrer par type(s) :',
    reset: 'Réinitialiser',
    resetAll: 'Réinitialiser les filtres',
    clearAllFilters: 'Effacer tous les filtres',
    foundSingular: 'Pokémon trouvé',
    foundPlural: 'Pokémons trouvés',
    noPokemonFound: 'Aucun Pokémon ne correspond à votre recherche',
    noPokemonFoundDesc: 'Essayez de modifier vos filtres ou termes de recherche.',
    retry: 'Réessayer',
    loadError: 'Impossible de charger les données du Pokédex.',
    loadingStats: 'Chargement des statistiques...',
    loadingChart: 'Chargement du graphique...',
    compare: 'Comparer',
    selected: 'Sélectionné',
    comparatorTitle: 'Comparateur de Pokémon',
    clear: 'Vider',
    selectSecondPokemon: 'Sélectionnez un 2ᵉ Pokémon pour comparer',
    addFavorite: 'Ajouter aux favoris',
    removeFavorite: 'Retirer des favoris',
    height: 'Taille',
    weight: 'Poids',
    moves: 'Capacités',
    viewMoves: 'Voir les capacités',
    similarPokemon: 'Pokémons similaires',
    back: 'Retour',
    backToPokedex: 'Retour au Pokédex',
    pokemonNotFound: 'Pokémon introuvable',
    pokemonNotFoundDesc: "Aucun Pokémon ne correspond à l'identifiant",
    sortOptions: {
      idAsc: 'Numéro croissant (#1 → #151)',
      idDesc: 'Numéro décroissant (#151 → #1)',
      nameAsc: 'Nom (A → Z)',
      nameDesc: 'Nom (Z → A)',
      favorites: "Favoris d'abord ⭐",
      weightDesc: 'Poids (Plus lourds)',
      heightDesc: 'Taille (Plus grands)',
    },
  },
  en: {
    appTitle: 'Pokédex',
    searchPlaceholder: 'Search by name or number (e.g. 25, Pikachu)...',
    sortBy: 'Sort by',
    generation: 'Generation',
    filterByTypes: 'Filter by type(s):',
    reset: 'Reset',
    resetAll: 'Reset filters',
    clearAllFilters: 'Clear all filters',
    foundSingular: 'Pokémon found',
    foundPlural: 'Pokémon found',
    noPokemonFound: 'No Pokémon matches your search',
    noPokemonFoundDesc: 'Try adjusting your filters or search terms.',
    retry: 'Retry',
    loadError: 'Failed to load Pokédex data.',
    loadingStats: 'Loading statistics...',
    loadingChart: 'Loading chart...',
    compare: 'Compare',
    selected: 'Selected',
    comparatorTitle: 'Pokémon Comparator',
    clear: 'Clear',
    selectSecondPokemon: 'Select a 2nd Pokémon to compare',
    addFavorite: 'Add to favorites',
    removeFavorite: 'Remove from favorites',
    height: 'Height',
    weight: 'Weight',
    moves: 'Moves',
    viewMoves: 'View moves',
    similarPokemon: 'Similar Pokémon',
    back: 'Back',
    backToPokedex: 'Back to Pokédex',
    pokemonNotFound: 'Pokémon not found',
    pokemonNotFoundDesc: 'No Pokémon matches identifier',
    sortOptions: {
      idAsc: 'Number ascending (#1 → #151)',
      idDesc: 'Number descending (#151 → #1)',
      nameAsc: 'Name (A → Z)',
      nameDesc: 'Name (Z → A)',
      favorites: 'Favorites first ⭐',
      weightDesc: 'Weight (Heaviest)',
      heightDesc: 'Height (Tallest)',
    },
  },
};

export const useTranslation = () => {
  const { language } = useContext(LanguageContext);
  const lang = translations[language] ? language : 'fr';
  return {
    t: (key) => {
      const keys = key.split('.');
      let current = translations[lang];
      for (const k of keys) {
        if (current && current[k] !== undefined) {
          current = current[k];
        } else {
          return key;
        }
      }
      return current;
    },
    language: lang,
  };
};
