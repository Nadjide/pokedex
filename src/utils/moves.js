import { ALL_TYPES } from '../data/typeChart.js';
import { formatSlug, normalizeText } from './pokemon.js';

export const MOVE_CATEGORIES = ['physical', 'special', 'status'];

// « default » conserve l'ordre du jeu de données (numéro de capacité).
export const MOVE_SORTS = ['default', 'name', 'power-desc', 'power-asc'];

// Une « entrée » associe l'identifiant du jeu de données à ses détails PokéAPI :
// { slug, move }, où `move` vaut undefined (en attente), null (échec) ou les détails.

// Nom affiché : langue active, sinon nom anglais officiel, sinon identifiant mis en forme.
export const getMoveName = ({ slug, move }, language = 'fr') =>
  move?.names?.[language] || move?.names?.en || formatSlug(slug);

export const getMoveDescription = (move, language = 'fr') =>
  move?.description?.[language] || move?.description?.en || '';

// La recherche porte sur le nom dans les deux langues, sans accents ni casse.
const matchesSearch = (entry, term) =>
  [entry.move?.names?.fr, entry.move?.names?.en, formatSlug(entry.slug)].some(
    (name) => name && normalizeText(name).includes(term)
  );

// Les capacités sans puissance (statut, puissance variable) passent en dernier.
const comparePower = (direction) => (a, b) => {
  const powerA = a.move?.power ?? null;
  const powerB = b.move?.power ?? null;
  if (powerA === null || powerB === null) return (powerA === null) - (powerB === null);
  return direction * (powerA - powerB);
};

// Les filtres par type et par catégorie écartent les capacités dont les détails
// sont inconnus : on ne devine ni leur type ni leur catégorie.
export function filterAndSortMoves(
  entries,
  { searchTerm = '', type = null, category = null, sort = 'default', language = 'fr' } = {}
) {
  const term = normalizeText(searchTerm);

  const result = entries.filter((entry) => {
    if (term && !matchesSearch(entry, term)) return false;
    if (type && entry.move?.type !== type) return false;
    if (category && entry.move?.category !== category) return false;
    return true;
  });

  // Tri stable : à égalité, l'ordre du jeu de données est conservé.
  if (sort === 'name') {
    result.sort((a, b) => getMoveName(a, language).localeCompare(getMoveName(b, language), language));
  } else if (sort === 'power-desc') {
    result.sort(comparePower(-1));
  } else if (sort === 'power-asc') {
    result.sort(comparePower(1));
  }

  return result;
}

const typeRank = (type) => {
  const index = ALL_TYPES.indexOf(type);
  return index === -1 ? ALL_TYPES.length : index;
};

// Types présents parmi les capacités chargées, dans l'ordre habituel des types.
export function countMoveTypes(entries) {
  const counts = new Map();
  entries.forEach(({ move }) => {
    if (move?.type) counts.set(move.type, (counts.get(move.type) || 0) + 1);
  });
  return [...counts]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => typeRank(a.type) - typeRank(b.type));
}

// Avancement du chargement : `settled` compte les réussites et les échecs.
export function getLoadProgress(entries) {
  let settled = 0;
  let failed = 0;
  entries.forEach(({ move }) => {
    if (move !== undefined) settled += 1;
    if (move === null) failed += 1;
  });
  return { total: entries.length, settled, failed, done: settled === entries.length };
}
