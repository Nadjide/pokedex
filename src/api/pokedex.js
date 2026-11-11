// Liste complète du Pokédex national (générations I à IX).
//
// 1. Source principale : l'API GraphQL de PokéAPI, une seule requête pour les
//    1 025 espèces (≈ 330 Ko, ≈ 40 Ko compressés). Essais des 10 et 11/11/2026 :
//    - https://graphql.pokeapi.co/v1beta2 fonctionne, mais par intermittence :
//      réponse en moins d'une seconde, puis plus aucune réponse pendant de
//      longues minutes (bêta, limitée en débit) ;
//    - l'ancienne adresse https://beta.pokeapi.co/graphql/v1beta répond 401.
// 2. Repli : les fichiers CSV du dépôt PokeAPI/pokeapi sur GitHub, qui alimentent
//    cette même base. Quatre fichiers statiques (≈ 185 Ko compressés) donnent
//    exactement les mêmes champs. Il est lancé si GraphQL échoue ou tarde.
//    L'API REST, elle, n'expose noms traduits, taille et poids que ressource par
//    ressource (≈ 2 050 requêtes, plus de 20 Mo) : écartée pour la liste.
// 3. Dernier recours : l'ancien jeu de données, limité à Kanto.
// Le résultat des sources complètes est gardé dans un cache local versionné.
import { formatSlug } from '../utils/pokemon.js';

export const POKEDEX_GRAPHQL_URL = 'https://graphql.pokeapi.co/v1beta2';
export const POKEDEX_CSV_BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv';
export const KANTO_FALLBACK_URL = 'https://pokedex-jgabriele.vercel.app/pokemons.json';

const LANGUAGES = ['fr', 'en', 'ja'];
const REQUEST_TIMEOUT_MS = 15000;
// Délai au-delà duquel le repli CSV part en parallèle de GraphQL.
const HEDGE_DELAY_MS = 2500;

const POKEDEX_QUERY = `
  query PokedexList {
    pokemonspecies(order_by: { id: asc }) {
      id
      name
      generation_id
      pokemonspeciesnames(where: { language: { name: { _in: ["fr", "en", "ja"] } } }) {
        name
        language { name }
      }
      pokemons(where: { is_default: { _eq: true } }, limit: 1) {
        height
        weight
        pokemontypes(order_by: { slot: asc }) {
          type { name }
        }
      }
    }
  }
`;

// Forme commune à toutes les sources :
// { id, slug, names: { fr, en, ja }, types: [principal, secondaire], height, weight, generation }
export function normalizeSpecies(species) {
  const form = species?.pokemons?.[0];
  const types = (form?.pokemontypes || []).map((entry) => entry.type?.name).filter(Boolean);
  if (!Number.isInteger(species?.id) || !form || types.length === 0) return null;

  const names = {};
  (species.pokemonspeciesnames || []).forEach((entry) => {
    const lang = entry.language?.name;
    if (LANGUAGES.includes(lang) && entry.name) names[lang] = entry.name;
  });
  // L'identifiant PokéAPI est le nom anglais : repli fidèle si la traduction manque.
  if (!names.en && species.name) names.en = formatSlug(species.name);

  return {
    id: species.id,
    slug: species.name || null,
    names,
    types,
    height: form.height ?? null,
    weight: form.weight ?? null,
    generation: species.generation_id ?? null,
  };
}

// L'ancien jeu de données liste les types en ordre inverse de l'ordre officiel
// (Dracaufeu : « flying, fire ») : on rétablit type principal puis secondaire.
export function normalizeKantoEntry(pokemon) {
  if (!Number.isInteger(pokemon?.id)) return null;
  const names = {};
  LANGUAGES.forEach((lang) => {
    if (pokemon.names?.[lang]) names[lang] = pokemon.names[lang];
  });

  return {
    id: pokemon.id,
    slug: null,
    names,
    types: Array.isArray(pokemon.types) ? [...pokemon.types].reverse() : [],
    height: pokemon.height ?? null,
    weight: pokemon.weight ?? null,
    generation: 1,
  };
}

async function fetchWithTimeout(url, options = {}, read = 'json') {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;
  try {
    const res = await fetch(url, { ...options, signal: controller?.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res[read]();
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function fetchPokedexGraphQL() {
  const body = await fetchWithTimeout(POKEDEX_GRAPHQL_URL, {
    method: 'POST',
    // Pas d'en-tête Content-Type : le corps part en text/plain, ce qui évite la
    // pré-requête CORS (OPTIONS). Celle-ci restait sans réponse lors des essais
    // du 11/11/2026, alors que le serveur accepte très bien ce format.
    body: JSON.stringify({ query: POKEDEX_QUERY }),
  });
  if (body?.errors?.length) throw new Error(`PokéAPI GraphQL : ${body.errors[0].message}`);

  const pokemons = (body?.data?.pokemonspecies || []).map(normalizeSpecies).filter(Boolean);
  if (pokemons.length === 0) throw new Error('PokéAPI GraphQL : réponse vide');
  return pokemons;
}

/* ------------------------------------------------------------------ */
/* Repli : fichiers CSV de PokéAPI                                     */
/* ------------------------------------------------------------------ */
// Identifiants stables de la base PokéAPI.
const CSV_TYPES = [
  null, 'normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 'steel',
  'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy',
];
const CSV_LANGUAGES = { 5: 'fr', 9: 'en', 11: 'ja' };

// Ces fichiers ne contiennent ni guillemets ni virgules dans les colonnes lues.
const csvRows = (text) =>
  String(text)
    .split(/\r?\n/)
    .slice(1)
    .filter(Boolean)
    .map((line) => line.split(','));

// Assemble les quatre fichiers en espèces de même forme que la réponse GraphQL,
// pour passer par la même normalisation.
export function buildPokedexFromCsv({ species, pokemon, types, names }) {
  const forms = new Map();
  csvRows(pokemon).forEach(([id, , speciesId, height, weight, , , isDefault]) => {
    if (isDefault === '1') forms.set(Number(speciesId), { id: Number(id), height: Number(height), weight: Number(weight) });
  });

  const typesByPokemon = new Map();
  csvRows(types).forEach(([pokemonId, typeId, slot]) => {
    const list = typesByPokemon.get(Number(pokemonId)) || [];
    list.push({ slot: Number(slot), name: CSV_TYPES[Number(typeId)] });
    typesByPokemon.set(Number(pokemonId), list);
  });

  const namesBySpecies = new Map();
  csvRows(names).forEach(([speciesId, languageId, name]) => {
    const lang = CSV_LANGUAGES[languageId];
    if (!lang) return;
    const list = namesBySpecies.get(Number(speciesId)) || [];
    list.push({ name, language: { name: lang } });
    namesBySpecies.set(Number(speciesId), list);
  });

  return csvRows(species)
    .map(([id, identifier, generationId]) => {
      const form = forms.get(Number(id));
      return normalizeSpecies({
        id: Number(id),
        name: identifier,
        generation_id: Number(generationId) || null,
        pokemonspeciesnames: namesBySpecies.get(Number(id)) || [],
        pokemons: form
          ? [
              {
                height: form.height,
                weight: form.weight,
                pokemontypes: (typesByPokemon.get(form.id) || [])
                  .sort((a, b) => a.slot - b.slot)
                  .map((entry) => ({ type: { name: entry.name } })),
              },
            ]
          : [],
      });
    })
    .filter(Boolean)
    .sort((a, b) => a.id - b.id);
}

export async function fetchPokedexCsv() {
  const file = (name) => fetchWithTimeout(`${POKEDEX_CSV_BASE_URL}/${name}.csv`, {}, 'text');
  const [species, pokemon, types, names] = await Promise.all([
    file('pokemon_species'),
    file('pokemon'),
    file('pokemon_types'),
    file('pokemon_species_names'),
  ]);

  const pokemons = buildPokedexFromCsv({ species, pokemon, types, names });
  if (pokemons.length === 0) throw new Error('CSV PokéAPI : réponse vide');
  return pokemons;
}

// Liste complète : GraphQL d'abord ; le repli CSV part dès que GraphQL échoue,
// ou en parallèle s'il tarde. La première source qui aboutit l'emporte.
export function fetchPokedex() {
  const graphql = fetchPokedexGraphQL();

  const csv = new Promise((resolve, reject) => {
    const start = () => fetchPokedexCsv().then(resolve, reject);
    const timer = setTimeout(start, HEDGE_DELAY_MS);
    graphql.then(
      () => {
        clearTimeout(timer);
        reject(new Error('repli CSV inutile'));
      },
      () => {
        clearTimeout(timer);
        start();
      }
    );
  });
  // Le rejet « inutile » ne doit pas remonter comme promesse non gérée.
  csv.catch(() => {});

  return Promise.any([graphql, csv]);
}

export async function fetchKantoFallback() {
  const json = await fetchWithTimeout(KANTO_FALLBACK_URL);
  const pokemons = (Array.isArray(json) ? json : []).map(normalizeKantoEntry).filter(Boolean);
  if (pokemons.length === 0) throw new Error('Jeu de données Kanto : réponse vide');
  return pokemons;
}

/* ------------------------------------------------------------------ */
/* Cache local versionné                                               */
/* ------------------------------------------------------------------ */
// Changer la version quand la forme des données change : l'ancien cache est
// alors ignoré puis supprimé.
const CACHE_PREFIX = 'pokedex-list-v';
const CACHE_VERSION = 1;
export const POKEDEX_CACHE_KEY = `${CACHE_PREFIX}${CACHE_VERSION}`;
// Au-delà, la liste en cache reste affichée mais est rafraîchie en arrière-plan.
export const POKEDEX_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function readPokedexCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(POKEDEX_CACHE_KEY));
    if (!Array.isArray(parsed?.pokemons) || parsed.pokemons.length === 0) return null;
    return { pokemons: parsed.pokemons, savedAt: Number(parsed.savedAt) || 0 };
  } catch (e) {
    return null;
  }
}

export function writePokedexCache(pokemons) {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(CACHE_PREFIX) && key !== POKEDEX_CACHE_KEY)
      .forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(POKEDEX_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), pokemons }));
  } catch (e) {
    // Stockage plein ou indisponible : la liste sera simplement redemandée.
  }
}
