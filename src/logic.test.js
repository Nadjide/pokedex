import { getDefenseMultipliers, getDefenseProfile, formatMultiplier } from './data/typeChart.js';
import { filterAndSortPokemons } from './utils/filterPokemons.js';
import { flattenEvolutionStages } from './api/pokeapi.js';
import { formatCount, formatHeight, formatId, formatSlug, normalizeText, toRoman } from './utils/pokemon.js';
import { translate, translations } from './i18n/translations.js';
import { buildPokedexFromCsv, normalizeKantoEntry, normalizeSpecies } from './api/pokedex.js';
import { describeEvolutionCondition, summarizeEvolutionDetails } from './utils/evolution.js';
import { computeVirtualRows, parseColumnCount } from './utils/virtualRows.js';

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
    { id: 1, generation: 1, weight: 69, height: 7, types: ['grass', 'poison'], names: { fr: 'Bulbizarre', en: 'Bulbasaur' } },
    { id: 4, generation: 1, weight: 85, height: 6, types: ['fire'], names: { fr: 'Salamèche', en: 'Charmander' } },
    { id: 6, generation: 1, weight: 905, height: 17, types: ['fire', 'flying'], names: { fr: 'Dracaufeu', en: 'Charizard' } },
    { id: 25, generation: 1, weight: 60, height: 4, types: ['electric'], names: { fr: 'Pikachu', en: 'Pikachu' } },
    { id: 700, generation: 6, weight: 235, height: 10, types: ['fairy'], names: { fr: 'Nymphali', en: 'Sylveon' } },
    { id: 1000, generation: 9, weight: 300, height: 12, types: ['steel', 'ghost'], names: { fr: 'Gromago', en: 'Gholdengo' } },
  ];
  const ids = (options) => filterAndSortPokemons(pokemons, options).map((p) => p.id);

  test('returns everything in Pokédex order by default', () => {
    expect(ids()).toEqual([1, 4, 6, 25, 700, 1000]);
  });

  test('searches names without accents or case, in any language', () => {
    expect(ids({ searchTerm: 'SALAMECHE' })).toEqual([4]);
    expect(ids({ searchTerm: 'chariz', language: 'fr' })).toEqual([6]);
  });

  test('a numeric search matches the exact number, with or without #', () => {
    expect(ids({ searchTerm: '4' })).toEqual([4]);
    expect(ids({ searchTerm: '#25' })).toEqual([25]);
    expect(ids({ searchTerm: '2' })).toEqual([]);
    expect(ids({ searchTerm: '1000' })).toEqual([1000]);
  });

  test('type filters are cumulative', () => {
    expect(ids({ activeTypeFilters: ['fire'] })).toEqual([4, 6]);
    expect(ids({ activeTypeFilters: ['fire', 'flying'] })).toEqual([6]);
  });

  test('generation filters widen the selection and combine with types', () => {
    expect(ids({ activeGenerationFilters: [6] })).toEqual([700]);
    expect(ids({ activeGenerationFilters: [6, 9] })).toEqual([700, 1000]);
    expect(ids({ activeGenerationFilters: [1, 9], activeTypeFilters: ['fire'] })).toEqual([4, 6]);
    expect(ids({ activeGenerationFilters: [2] })).toEqual([]);
  });

  test('favorites can filter or lead the list', () => {
    expect(ids({ favoritesOnly: true, favorites: [25, 4] })).toEqual([4, 25]);
    expect(ids({ sortOrder: 'favorites', favorites: [25] })).toEqual([25, 1, 4, 6, 700, 1000]);
  });

  test('sorts by name in the active language and by weight', () => {
    expect(ids({ sortOrder: 'name-asc', language: 'en' })).toEqual([1, 6, 4, 1000, 25, 700]);
    expect(ids({ sortOrder: 'name-desc', language: 'fr' })).toEqual([4, 25, 700, 1000, 6, 1]);
    expect(ids({ sortOrder: 'weight-desc' })).toEqual([6, 1000, 700, 4, 1, 25]);
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

  test('keeps the whole chain by default, across generations', () => {
    const pichu = node(172, null, [node(25, { minHappiness: 220 }, [node(26, { items: [] })])]);
    expect(flattenEvolutionStages(pichu).map((stage) => stage.map((entry) => entry.id))).toEqual([[172], [25], [26]]);
  });

  test('can drop Pokémon outside a reduced dataset and clears the condition of the first shown stage', () => {
    // Mode dégradé limité à Kanto : Pichu (172) → Pikachu → Raichu
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
    expect(formatId(7)).toBe('#0007');
    expect(formatId(151)).toBe('#0151');
    expect(formatId(1025)).toBe('#1025');
    expect(formatCount(1025, 'en')).toBe('1,025');
    expect(formatCount(1025, 'fr').replace(/\s/g, ' ')).toBe('1 025');
    expect(toRoman(9)).toBe('IX');
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

describe('translations', () => {
  const keysOf = (node, prefix = '') =>
    Object.entries(node).flatMap(([key, value]) =>
      typeof value === 'object' ? keysOf(value, `${prefix}${key}.`) : [`${prefix}${key}`]
    );

  test('every key exists in both French and English', () => {
    expect(keysOf(translations.en).sort()).toEqual(keysOf(translations.fr).sort());
  });
});

describe('Pokédex list normalization', () => {
  test('maps a PokéAPI GraphQL species to the app shape, types in slot order', () => {
    const species = {
      id: 6,
      name: 'charizard',
      generation_id: 1,
      pokemonspeciesnames: [
        { name: 'Dracaufeu', language: { name: 'fr' } },
        { name: 'Charizard', language: { name: 'en' } },
        { name: 'リザードン', language: { name: 'ja' } },
      ],
      pokemons: [{ height: 17, weight: 905, pokemontypes: [{ type: { name: 'fire' } }, { type: { name: 'flying' } }] }],
    };

    expect(normalizeSpecies(species)).toEqual({
      id: 6,
      slug: 'charizard',
      names: { fr: 'Dracaufeu', en: 'Charizard', ja: 'リザードン' },
      types: ['fire', 'flying'],
      height: 17,
      weight: 905,
      generation: 1,
    });
  });

  test('rejects incomplete species and falls back to the identifier for a missing English name', () => {
    expect(normalizeSpecies({ id: 1, name: 'x', pokemons: [] })).toBeNull();
    const bare = normalizeSpecies({
      id: 122,
      name: 'mr-mime',
      generation_id: 1,
      pokemonspeciesnames: [],
      pokemons: [{ height: 13, weight: 545, pokemontypes: [{ type: { name: 'psychic' } }] }],
    });
    expect(bare.names).toEqual({ en: 'Mr Mime' });
  });

  test('rebuilds the same shape from the PokéAPI CSV files', () => {
    const list = buildPokedexFromCsv({
      species: 'id,identifier,generation_id,evolves_from_species_id\n6,charizard,1,5\n700,sylveon,6,133\n',
      // 10034 : méga-évolution, forme non par défaut à ignorer
      pokemon:
        'id,identifier,species_id,height,weight,base_experience,order,is_default\n6,charizard,6,17,905,267,7,1\n10034,charizard-mega-x,6,17,1105,285,8,0\n700,sylveon,700,10,235,184,800,1\n',
      types: 'pokemon_id,type_id,slot\n6,3,2\n6,10,1\n10034,16,2\n700,18,1\n',
      names:
        'pokemon_species_id,local_language_id,name,genus\n6,5,Dracaufeu,Pokémon Flamme\n6,9,Charizard,Flame Pokémon\n6,6,Glurak,Flammen-Pokémon\n700,5,Nymphali,\n700,9,Sylveon,\n700,11,ニンフィア,\n',
    });

    expect(list).toEqual([
      {
        id: 6,
        slug: 'charizard',
        names: { fr: 'Dracaufeu', en: 'Charizard' },
        types: ['fire', 'flying'],
        height: 17,
        weight: 905,
        generation: 1,
      },
      {
        id: 700,
        slug: 'sylveon',
        names: { fr: 'Nymphali', en: 'Sylveon', ja: 'ニンフィア' },
        types: ['fairy'],
        height: 10,
        weight: 235,
        generation: 6,
      },
    ]);
  });

  test('restores the official type order of the Kanto fallback and drops its moves', () => {
    const entry = normalizeKantoEntry({
      id: 1,
      height: 7,
      weight: 69,
      types: ['poison', 'grass'],
      moves: ['tackle'],
      names: { fr: 'Bulbizarre', en: 'Bulbasaur', de: 'Bisasam' },
    });
    expect(entry).toEqual({
      id: 1,
      slug: null,
      names: { fr: 'Bulbizarre', en: 'Bulbasaur' },
      types: ['grass', 'poison'],
      height: 7,
      weight: 69,
      generation: 1,
    });
  });
});

describe('evolution conditions', () => {
  const ref = (name, id = 1) => ({ name, url: `https://pokeapi.co/api/v2/x/${id}/` });
  const t = (key, vars) => translate('fr', key, vars);
  const describeFr = (details, context, extra = {}) =>
    describeEvolutionCondition(summarizeEvolutionDetails(details, context), { t, language: 'fr', ...extra });

  test('describes happiness with a time of day', () => {
    const details = [{ is_default: true, trigger: ref('level-up'), min_happiness: 160, time_of_day: 'night' }];
    expect(describeFr(details)).toEqual(['Bonheur', 'Nuit']);
  });

  test('describes a held item during a trade, using the translated name when known', () => {
    const condition = summarizeEvolutionDetails([
      { is_default: true, trigger: ref('trade'), held_item: ref('metal-coat', 210) },
    ]);
    expect(describeEvolutionCondition(condition, { t, language: 'fr' })).toEqual(['Échange', 'Tenir Metal Coat']);

    condition.heldItem.names = { fr: 'Peau Métal', en: 'Metal Coat' };
    expect(describeEvolutionCondition(condition, { t, language: 'fr' })).toEqual(['Échange', 'Tenir Peau Métal']);
  });

  test('describes a location, a party member and relative stats', () => {
    expect(describeFr([{ trigger: ref('take-damage'), min_damage_taken: 49, location: ref('dusty-bowl') }])).toEqual([
      'Après des dégâts',
      '49 dégâts subis',
      'Dusty Bowl',
    ]);
    expect(
      describeFr([{ trigger: ref('level-up'), party_species: ref('remoraid', 223) }], undefined, {
        getSpeciesName: (id) => (id === 223 ? 'Rémoraid' : null),
      })
    ).toEqual(['Avec Rémoraid']);
    expect(describeFr([{ trigger: ref('level-up'), min_level: 20, relative_physical_stats: 0 }])).toEqual([
      'Niv. 20',
      'Attaque = Défense',
    ]);
  });

  test('prefers the standard evolution over regional forms and old versions', () => {
    // Sablaireau : niveau 22, ou Pierre Glace pour la forme d'Alola
    const sandslash = [
      { is_default: true, trigger: ref('level-up'), min_level: 22, required_pokemon_form: ref('sandshrew') },
      {
        is_default: true,
        trigger: ref('use-item'),
        item: ref('ice-stone'),
        required_pokemon_form: ref('sandshrew-alola'),
        evolved_pokemon_form: ref('sandslash-alola'),
      },
    ];
    expect(describeFr(sandslash, { slug: 'sandslash', parentSlug: 'sandshrew' })).toEqual(['Niv. 22']);

    // Phyllali : lieu précis dans les anciennes versions, Pierre Plante depuis
    const leafeon = [
      { is_default: false, trigger: ref('level-up'), location: ref('eterna-forest') },
      { is_default: true, trigger: ref('use-item'), item: ref('leaf-stone') },
    ];
    expect(describeFr(leafeon, { slug: 'leafeon', parentSlug: 'eevee' })).toEqual(['Leaf Stone']);
  });

  test('keeps only what form variants have in common, listing alternative items', () => {
    const lycanroc = ['day', 'night', 'dusk'].map((time) => ({
      is_default: true,
      trigger: ref('level-up'),
      min_level: 25,
      time_of_day: time,
      evolved_pokemon_form: ref(`lycanroc-${time}`),
    }));
    expect(describeFr(lycanroc, { slug: 'lycanroc', parentSlug: 'rockruff' })).toEqual(['Niv. 25']);

    const urshifu = ['scroll-of-darkness', 'scroll-of-waters'].map((item) => ({
      is_default: true,
      trigger: ref('use-item'),
      item: ref(item),
    }));
    expect(describeFr(urshifu)).toEqual(['Scroll Of Darkness / Scroll Of Waters']);
  });

  test('falls back to generic labels', () => {
    expect(describeFr([{ trigger: ref('level-up') }])).toEqual(['Montée de niveau']);
    expect(describeFr([{ trigger: ref('unknown-trigger') }])).toEqual(['Condition spéciale']);
    expect(summarizeEvolutionDetails([])).toBeNull();
    expect(describeEvolutionCondition(null, { t, language: 'fr' })).toEqual([]);
  });
});

describe('virtual grid rows', () => {
  const base = { rowCount: 205, heights: new Map(), estimate: 280, gap: 20, overscan: 0 };

  test('reads the column count from resolved grid tracks only', () => {
    expect(parseColumnCount('201.5px 201.5px 201.5px')).toBe(3);
    expect(parseColumnCount('repeat(2, minmax(0, 1fr))')).toBeNull();
    expect(parseColumnCount('')).toBeNull();
  });

  test('mounts only the rows near the viewport and pads the rest', () => {
    const range = computeVirtualRows({ ...base, viewTop: 3000, viewBottom: 3900 });
    // Rangées de 300 px (280 + 20 d'écart) : la 10 commence à 3000, la 13 à 3900.
    expect(range).toMatchObject({ start: 10, end: 13, paddingTop: 3000 });
    // Hauteur totale conservée : 205 × 300 − 20.
    const rendered = 3 * 280 + 2 * 20;
    expect(range.paddingTop + rendered + range.paddingBottom).toBe(205 * 300 - 20);
  });

  test('overscan widens the window, clamped to the list', () => {
    expect(computeVirtualRows({ ...base, viewTop: 0, viewBottom: 900, overscan: 600 })).toMatchObject({
      start: 0,
      end: 5,
      paddingTop: 0,
    });
    const end = computeVirtualRows({ ...base, viewTop: 61000, viewBottom: 61480, overscan: 600 });
    expect(end.end).toBe(205);
    expect(end.paddingBottom).toBe(0);
  });

  test('uses measured heights where known', () => {
    const heights = new Map([[0, 400]]);
    const range = computeVirtualRows({ ...base, heights, viewTop: 420, viewBottom: 1000 });
    expect(range.start).toBe(1);
    expect(range.paddingTop).toBe(420);
  });

  test('keeps a row mounted when the viewport is past a shortened list', () => {
    expect(computeVirtualRows({ ...base, rowCount: 2, viewTop: 9000, viewBottom: 9900 })).toMatchObject({
      start: 1,
      end: 2,
      paddingTop: 300,
      paddingBottom: 0,
    });
    expect(computeVirtualRows({ ...base, rowCount: 0, viewTop: 0, viewBottom: 900 })).toEqual({
      start: 0,
      end: 0,
      paddingTop: 0,
      paddingBottom: 0,
    });
  });
});
