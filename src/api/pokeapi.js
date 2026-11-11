// Accès à PokéAPI pour les données absentes du jeu de données principal :
// statistiques de base, talents, description du Pokédex, chaîne d'évolution,
// détails des capacités.
import { createLimiter } from '../utils/limiter.js';
import { MOVE_CATEGORIES } from '../utils/moves.js';

const API_BASE = 'https://pokeapi.co/api/v2';

export const STAT_KEYS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

// Cache mémoire des promesses : une même URL n'est demandée qu'une fois par
// session, y compris quand deux composants la réclament en parallèle.
const requestCache = new Map();

// `select` réduit la réponse avant sa mise en cache, pour ne pas garder en
// mémoire des charges utiles volumineuses dont on n'utilise que quelques champs.
function fetchJson(url, select) {
  if (requestCache.has(url)) return requestCache.get(url);

  const request = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`PokéAPI ${res.status}`);
      return res.json();
    })
    .then((data) => (select ? select(data) : data))
    .catch((err) => {
      // On n'enferme pas un échec dans le cache : un nouvel essai reste possible.
      requestCache.delete(url);
      throw err;
    });

  requestCache.set(url, request);
  return request;
}

const idFromUrl = (url = '') => {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
};

const cleanText = (text = '') => text.replace(/[\n\f\r­]+/g, ' ').replace(/\s+/g, ' ').trim();

// Dernière entrée disponible par langue (les plus récentes sont en fin de liste).
const pickByLanguage = (entries = [], field) => {
  const result = {};
  entries.forEach((entry) => {
    const lang = entry.language?.name;
    if ((lang === 'fr' || lang === 'en') && entry[field]) {
      result[lang] = cleanText(entry[field]);
    }
  });
  return result;
};

export async function getPokemonCore(id) {
  const data = await fetchJson(`${API_BASE}/pokemon/${id}`);

  const stats = {};
  (data.stats || []).forEach((entry) => {
    if (entry.stat?.name) stats[entry.stat.name] = entry.base_stat;
  });
  if (!STAT_KEYS.every((key) => typeof stats[key] === 'number')) {
    throw new Error('PokéAPI: statistiques incomplètes');
  }

  return {
    stats,
    total: STAT_KEYS.reduce((sum, key) => sum + stats[key], 0),
    abilities: (data.abilities || []).map((entry) => ({
      slug: entry.ability?.name,
      url: entry.ability?.url,
      hidden: Boolean(entry.is_hidden),
    })),
    cry: data.cries?.latest || data.cries?.legacy || null,
  };
}

export async function getSpecies(id) {
  const data = await fetchJson(`${API_BASE}/pokemon-species/${id}`);

  return {
    flavor: pickByLanguage(data.flavor_text_entries, 'flavor_text'),
    genus: pickByLanguage(data.genera, 'genus'),
    isLegendary: Boolean(data.is_legendary),
    isMythical: Boolean(data.is_mythical),
    evolutionChainUrl: data.evolution_chain?.url || null,
  };
}

export async function getAbility(url) {
  const data = await fetchJson(url);
  return {
    names: pickByLanguage(data.names, 'name'),
    description: pickByLanguage(data.flavor_text_entries, 'flavor_text'),
  };
}

const numberOrNull = (value) => (typeof value === 'number' ? value : null);

// Réponse de /move/{slug} réduite aux champs affichés. `power` et `accuracy`
// valent null quand la capacité n'en a pas (statut, puissance variable,
// capacité qui ne peut pas échouer).
export function mapMove(data, slug) {
  if (!data?.type?.name) throw new Error('PokéAPI: capacité incomplète');

  const category = data.damage_class?.name;

  return {
    slug: slug || data.name,
    names: pickByLanguage(data.names, 'name'),
    type: data.type.name,
    category: MOVE_CATEGORIES.includes(category) ? category : null,
    power: numberOrNull(data.power),
    accuracy: numberOrNull(data.accuracy),
    pp: numberOrNull(data.pp),
    description: pickByLanguage(data.flavor_text_entries, 'flavor_text'),
  };
}

// Un Pokémon connaît des dizaines de capacités : leurs fiches passent par une
// file d'attente pour ne jamais lancer plus de quelques requêtes à la fois.
const MOVE_CONCURRENCY = 6;
const limitMoveRequests = createLimiter(MOVE_CONCURRENCY);
const loadedMoves = new Map();

// Détails déjà chargés pendant la session (undefined sinon), sans requête.
export const peekMove = (slug) => loadedMoves.get(slug);

// `signal` annulé : la requête est retirée de la file si elle n'a pas démarré.
export function getMove(slug, { signal } = {}) {
  const url = `${API_BASE}/move/${slug}`;
  const load = () => fetchJson(url, (data) => mapMove(data, slug));

  // Déjà demandée : on partage la réponse (ou la requête en cours) sans
  // reprendre de place dans la file.
  const request = requestCache.has(url) ? load() : limitMoveRequests(load, { signal });

  return request.then((move) => {
    loadedMoves.set(slug, move);
    return move;
  });
}

const mapEvolutionNode = (node) => {
  const detail = node.evolution_details?.[0];
  return {
    id: idFromUrl(node.species?.url),
    slug: node.species?.name,
    condition: detail
      ? {
          trigger: detail.trigger?.name || null,
          minLevel: detail.min_level || null,
          item: detail.item?.name || null,
          minHappiness: detail.min_happiness || null,
        }
      : null,
    children: (node.evolves_to || []).map(mapEvolutionNode),
  };
};

// Arbre d'évolution : { id, slug, condition, children: [...] }
export async function getEvolutionTree(url) {
  const data = await fetchJson(url);
  return data.chain ? mapEvolutionNode(data.chain) : null;
}

// Aplatit l'arbre en étapes successives en ne gardant que les Pokémon connus
// (`isKnown`). Renvoie par exemple [[Évoli], [Aquali, Voltali, Pyroli]].
export function flattenEvolutionStages(tree, isKnown = () => true) {
  const stages = [];
  const walk = (node, depth) => {
    if (!node) return;
    if (node.id && isKnown(node.id)) {
      if (!stages[depth]) stages[depth] = [];
      stages[depth].push({ id: node.id, slug: node.slug, condition: node.condition });
    }
    node.children.forEach((child) => walk(child, depth + 1));
  };
  walk(tree, 0);

  const compact = stages.filter((stage) => stage && stage.length > 0);
  // La première étape affichée n'a pas de condition : rien ne la précède à l'écran.
  if (compact[0]) compact[0] = compact[0].map((entry) => ({ ...entry, condition: null }));
  return compact;
}
