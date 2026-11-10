import { normalizeText } from './pokemon.js';

export const SORT_ORDERS = [
  'id-asc',
  'id-desc',
  'name-asc',
  'name-desc',
  'favorites',
  'weight-desc',
  'height-desc',
];

const matchesSearch = (pokemon, term) => {
  if (!term) return true;

  const numeric = term.replace(/^#/, '');
  if (/^\d+$/.test(numeric)) {
    return pokemon.id === Number(numeric);
  }

  // On cherche dans toutes les langues disponibles : « bulbasaur » fonctionne
  // même quand l'interface est en français.
  return Object.values(pokemon.names || {}).some((name) => normalizeText(name).includes(term));
};

const compareBy = (sortOrder, { language, favorites }) => {
  const nameOf = (p) => p.names?.[language] || p.names?.en || '';

  switch (sortOrder) {
    case 'id-desc':
      return (a, b) => b.id - a.id;
    case 'name-asc':
      return (a, b) => nameOf(a).localeCompare(nameOf(b), language);
    case 'name-desc':
      return (a, b) => nameOf(b).localeCompare(nameOf(a), language);
    case 'favorites':
      return (a, b) => {
        const diff = Number(favorites.includes(b.id)) - Number(favorites.includes(a.id));
        return diff || a.id - b.id;
      };
    case 'weight-desc':
      return (a, b) => (b.weight || 0) - (a.weight || 0) || a.id - b.id;
    case 'height-desc':
      return (a, b) => (b.height || 0) - (a.height || 0) || a.id - b.id;
    case 'id-asc':
    default:
      return (a, b) => a.id - b.id;
  }
};

export function filterAndSortPokemons(
  pokemons,
  {
    searchTerm = '',
    activeTypeFilters = [],
    favoritesOnly = false,
    sortOrder = 'id-asc',
    favorites = [],
    language = 'fr',
  } = {}
) {
  const term = normalizeText(searchTerm);

  return pokemons
    .filter((pokemon) => {
      if (!matchesSearch(pokemon, term)) return false;
      if (favoritesOnly && !favorites.includes(pokemon.id)) return false;
      // Types cumulés (ET logique) : le Pokémon doit posséder tous les types choisis.
      return activeTypeFilters.every((type) => pokemon.types?.includes(type));
    })
    .sort(compareBy(sortOrder, { language, favorites }));
}
