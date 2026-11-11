// Accès à PokéAPI (REST) pour les données de la fiche, absentes de la liste :
// statistiques de base, talents, capacités, description, chaîne d'évolution.
import { getConditionRefs, summarizeEvolutionDetails } from '../utils/evolution.js';

const API_BASE = 'https://pokeapi.co/api/v2';

export const STAT_KEYS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

// Cache mémoire des promesses : une même URL n'est demandée qu'une fois par
// session, y compris quand deux composants la réclament en parallèle.
const requestCache = new Map();

function fetchJson(url) {
  if (requestCache.has(url)) return requestCache.get(url);

  const request = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`PokéAPI ${res.status}`);
      return res.json();
    })
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

// Capacités apprises par un Pokémon (identifiants anglais, triés). Même ressource
// que getPokemonCore : avec le cache des requêtes, aucun appel réseau en plus.
export async function getPokemonMoves(id) {
  const data = await fetchJson(`${API_BASE}/pokemon/${id}`);
  const slugs = (data.moves || []).map((entry) => entry.move?.name).filter(Boolean);
  return [...new Set(slugs)].sort();
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

const mapEvolutionNode = (node, parentSlug = null) => {
  const slug = node.species?.name;
  return {
    id: idFromUrl(node.species?.url),
    slug,
    condition: summarizeEvolutionDetails(node.evolution_details, { slug, parentSlug }),
    children: (node.evolves_to || []).map((child) => mapEvolutionNode(child, slug)),
  };
};

// Noms traduits des objets, capacités et lieux cités par les conditions. Un
// échec laisse la référence sans nom : l'interface affiche alors l'identifiant.
async function resolveConditionNames(tree) {
  const refs = [];
  const walk = (node) => {
    refs.push(...getConditionRefs(node.condition));
    node.children.forEach(walk);
  };
  walk(tree);

  await Promise.all(
    refs
      .filter((ref) => ref.url)
      .map((ref) =>
        fetchJson(ref.url)
          .then((data) => {
            ref.names = pickByLanguage(data.names, 'name');
          })
          .catch(() => {})
      )
  );
}

// Arbre d'évolution : { id, slug, condition, children: [...] }
// (forme de `condition` : voir summarizeEvolutionDetails).
export async function getEvolutionTree(url) {
  const data = await fetchJson(url);
  if (!data.chain) return null;
  const tree = mapEvolutionNode(data.chain);
  await resolveConditionNames(tree);
  return tree;
}

// Aplatit l'arbre en étapes successives. Renvoie par exemple
// [[Évoli], [Aquali, Voltali, Pyroli…]]. `isKnown` écarte les Pokémon absents
// de la liste chargée (mode dégradé limité à Kanto).
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
