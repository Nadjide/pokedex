// Accès à PokéAPI pour les données absentes du jeu de données principal :
// statistiques de base, talents, description du Pokédex, chaîne d'évolution.
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
