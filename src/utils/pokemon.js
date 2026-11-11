const SPRITES_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

// Illustration officielle haute définition (475×475), dérivée de l'identifiant.
export const getArtworkUrl = (id, { shiny = false } = {}) =>
  `${SPRITES_BASE}/other/official-artwork/${shiny ? 'shiny/' : ''}${id}.png`;

export const getSpriteUrl = (id) => `${SPRITES_BASE}/${id}.png`;

// Quatre chiffres : le Pokédex national dépasse 1 000 entrées.
export const formatId = (id) => `#${String(id).padStart(4, '0')}`;

// « 1 025 » en français, « 1,025 » en anglais.
export const formatCount = (value, language = 'fr') =>
  Number(value).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US');

export const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
export const toRoman = (generation) => ROMAN_NUMERALS[generation - 1] || String(generation);

export const getPokemonName = (pokemon, language = 'fr') =>
  pokemon?.names?.[language] || pokemon?.names?.fr || pokemon?.names?.en || formatId(pokemon?.id ?? 0);

const formatDecimal = (value, language) =>
  value.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

// L'API exprime la taille en décimètres et le poids en hectogrammes.
export const formatHeight = (decimetres, language) => `${formatDecimal((decimetres || 0) / 10, language)} m`;
export const formatWeight = (hectograms, language) => `${formatDecimal((hectograms || 0) / 10, language)} kg`;

// « thunder-punch » → « Thunder Punch »
export const formatSlug = (slug = '') =>
  slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

// Minuscules + suppression des accents, pour une recherche tolérante
// (« salameche » trouve « Salamèche »).
export const normalizeText = (text = '') =>
  String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
