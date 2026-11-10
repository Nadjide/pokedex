import { getDefenseMultipliers, getDefenseProfile, formatMultiplier } from './data/typeChart.js';
import { filterAndSortPokemons } from './utils/filterPokemons.js';
import { flattenEvolutionStages } from './api/pokeapi.js';
import { formatHeight, formatId, formatSlug, normalizeText } from './utils/pokemon.js';
import { translate } from './i18n/translations.js';

const typesOf = (entries) => entries.map((entry) => entry.type).sort();

describe('type chart', () => {
  test('a Grass/Poison Pokémon has the expected weaknesses and resistances', () => {
    const profile = getDefenseProfile(['grass', 'poison']);

    expect(typesOf(profile.weaknesses)).toEqual(['fire', 'flying', 'ice', 'psychic']);
    expect(typesOf(profile.resistances)).toEqual(['electric', 'fairy', 'fighting', 'grass', 'water']);
    expect(profile.immunities).toEqual([]);
    // Double résistance : Plante résiste à Plante, Poison aussi
    expect(getDefenseMultipliers(['grass', 'poison']).grass).toBe(0.25);
  });

  test('double weaknesses and immunities stack across both types', () => {
    // Dracaufeu (Feu/Vol) : Roche ×4, Sol ×0
    const charizard = getDefenseMultipliers(['fire', 'flying']);
    expect(charizard.rock).toBe(4);
    expect(charizard.ground).toBe(0);

    // Ectoplasma (Spectre/Poison) : immunisé à Normal et Combat
    expect(typesOf(getDefenseProfile(['ghost', 'poison']).immunities)).toEqual(['fighting', 'normal']);
  });

  test('weaknesses are listed strongest first', () => {
    const { weaknesses } = getDefenseProfile(['fire', 'flying']);
    expect(weaknesses[0]).toEqual({ type: 'rock', multiplier: 4 });
  });

  test('formats multipliers for display', () => {
    expect(formatMultiplier(4)).toBe('×4');
    expect(formatMultiplier(0.5)).toBe('×½');
    expect(formatMultiplier(0.25)).toBe('×¼');
    expect(formatMultiplier(0)).toBe('×0');
  });
});

describe('filterAndSortPokemons', () => {
  const pokemons = [
    { id: 1, weight: 69, height: 7, types: ['grass', 'poison'], names: { fr: 'Bulbizarre', en: 'Bulbasaur' } },
    { id: 4, weight: 85, height: 6, types: ['fire'], names: { fr: 'Salamèche', en: 'Charmander' } },
    { id: 6, weight: 905, height: 17, types: ['fire', 'flying'], names: { fr: 'Dracaufeu', en: 'Charizard' } },
    { id: 25, weight: 60, height: 4, types: ['electric'], names: { fr: 'Pikachu', en: 'Pikachu' } },
  ];
  const ids = (options) => filterAndSortPokemons(pokemons, options).map((p) => p.id);

  test('returns everything in Pokédex order by default', () => {
    expect(ids()).toEqual([1, 4, 6, 25]);
  });

  test('searches names without accents or case, in any language', () => {
    expect(ids({ searchTerm: 'SALAMECHE' })).toEqual([4]);
    expect(ids({ searchTerm: 'chariz', language: 'fr' })).toEqual([6]);
  });

  test('a numeric search matches the exact number, with or without #', () => {
    expect(ids({ searchTerm: '4' })).toEqual([4]);
    expect(ids({ searchTerm: '#25' })).toEqual([25]);
    expect(ids({ searchTerm: '2' })).toEqual([]);
  });

  test('type filters are cumulative', () => {
    expect(ids({ activeTypeFilters: ['fire'] })).toEqual([4, 6]);
    expect(ids({ activeTypeFilters: ['fire', 'flying'] })).toEqual([6]);
  });

  test('favorites can filter or lead the list', () => {
    expect(ids({ favoritesOnly: true, favorites: [25, 4] })).toEqual([4, 25]);
    expect(ids({ sortOrder: 'favorites', favorites: [25] })).toEqual([25, 1, 4, 6]);
  });

  test('sorts by name in the active language and by weight', () => {
    expect(ids({ sortOrder: 'name-asc', language: 'en' })).toEqual([1, 6, 4, 25]);
    expect(ids({ sortOrder: 'name-desc', language: 'fr' })).toEqual([4, 25, 6, 1]);
    expect(ids({ sortOrder: 'weight-desc' })).toEqual([6, 4, 1, 25]);
  });

  test('does not mutate the source list', () => {
    const copy = [...pokemons];
    filterAndSortPokemons(pokemons, { sortOrder: 'id-desc' });
    expect(pokemons).toEqual(copy);
  });
});

describe('flattenEvolutionStages', () => {
  const node = (id, condition, children = []) => ({ id, slug: `p${id}`, condition, children });

  test('turns a linear chain into successive stages', () => {
    const tree = node(1, null, [node(2, { minLevel: 16 }, [node(3, { minLevel: 32 })])]);
    const stages = flattenEvolutionStages(tree);

    expect(stages.map((stage) => stage.map((entry) => entry.id))).toEqual([[1], [2], [3]]);
    expect(stages[1][0].condition).toEqual({ minLevel: 16 });
  });

  test('keeps branches side by side in the same stage', () => {
    const eevee = node(133, null, [
      node(134, { item: 'water-stone' }),
      node(135, { item: 'thunder-stone' }),
      node(136, { item: 'fire-stone' }),
    ]);

    expect(flattenEvolutionStages(eevee).map((stage) => stage.map((entry) => entry.id))).toEqual([
      [133],
      [134, 135, 136],
    ]);
  });

  test('drops Pokémon outside the dataset and clears the condition of the first shown stage', () => {
    // Pichu (172, hors Kanto) → Pikachu → Raichu
    const pichu = node(172, null, [node(25, { minHappiness: 220 }, [node(26, { item: 'thunder-stone' })])]);
    const stages = flattenEvolutionStages(pichu, (id) => id <= 151);

    expect(stages.map((stage) => stage.map((entry) => entry.id))).toEqual([[25], [26]]);
    expect(stages[0][0].condition).toBeNull();
    expect(stages[1][0].condition).toEqual({ item: 'thunder-stone' });
  });

  test('returns no stage for a missing tree', () => {
    expect(flattenEvolutionStages(null)).toEqual([]);
  });
});

describe('formatting helpers', () => {
  test('formats identifiers, slugs and measurements', () => {
    expect(formatId(7)).toBe('#007');
    expect(formatId(151)).toBe('#151');
    expect(formatSlug('thunder-punch')).toBe('Thunder Punch');
    expect(formatHeight(4, 'en')).toBe('0.4 m');
    expect(formatHeight(17, 'fr')).toBe('1,7 m');
  });

  test('normalizes text for searching', () => {
    expect(normalizeText('  Salamèche ')).toBe('salameche');
    expect(normalizeText('Évoli')).toBe('evoli');
  });
});

describe('translate', () => {
  test('resolves nested keys and interpolates variables', () => {
    expect(translate('fr', 'stats.special-attack')).toBe('Atq. Spé.');
    expect(translate('en', 'evo.level', { level: 16 })).toBe('Lv. 16');
    expect(translate('fr', 'showAllMoves', { count: 81 })).toBe('Tout afficher (81)');
  });

  test('falls back to French for an unknown language and to the key when missing', () => {
    expect(translate('de', 'retry')).toBe('Réessayer');
    expect(translate('fr', 'does.not.exist')).toBe('does.not.exist');
  });
});
