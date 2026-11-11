import {
  MAX_TEAM_SIZE,
  addTeamMember,
  analyzeTeamDefense,
  buildTeamPath,
  buildTeamUrl,
  isSameTeam,
  parseTeamParam,
  removeTeamMember,
  sanitizeTeamIds,
  serializeTeamParam,
  summarizeTeamStats,
} from './team.js';
import { ALL_TYPES } from '../data/typeChart.js';
import { translations } from '../i18n/translations.js';

const CHARIZARD = { id: 6, types: ['fire', 'flying'] };
const BLASTOISE = { id: 9, types: ['water'] };
const VENUSAUR = { id: 3, types: ['grass', 'poison'] };

const idsOf = (entries) => entries.map((entry) => entry.id);
const typesOf = (rows) => rows.map((row) => row.type);

describe('team ids', () => {
  test('keeps unique positive integers in order', () => {
    expect(sanitizeTeamIds([4, '7', 4, 1])).toEqual([4, 7, 1]);
    expect(sanitizeTeamIds(['abc', -3, 0, 2.5, '1e3', null, undefined, '', ' 25 '])).toEqual([25]);
    expect(sanitizeTeamIds('1,4,7')).toEqual([]);
    expect(sanitizeTeamIds(undefined)).toEqual([]);
  });

  test('never keeps more than six members', () => {
    expect(MAX_TEAM_SIZE).toBe(6);
    expect(sanitizeTeamIds([1, 2, 3, 4, 5, 6, 7, 8])).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('adds at the end, ignoring duplicates and a full team', () => {
    expect(addTeamMember([1, 4], 7)).toEqual([1, 4, 7]);
    expect(addTeamMember([1, 4], '7')).toEqual([1, 4, 7]);

    const team = [1, 4];
    expect(addTeamMember(team, 4)).toBe(team);
    expect(addTeamMember(team, 'x')).toBe(team);

    const full = [1, 2, 3, 4, 5, 6];
    expect(addTeamMember(full, 7)).toBe(full);
  });

  test('removes a member without touching the others', () => {
    expect(removeTeamMember([1, 4, 7], 4)).toEqual([1, 7]);
    const team = [1, 4, 7];
    expect(removeTeamMember(team, 25)).toBe(team);
  });

  test('compares teams member by member, in order', () => {
    expect(isSameTeam([1, 4, 7], [1, 4, 7])).toBe(true);
    expect(isSameTeam([1, 4, 7], [7, 4, 1])).toBe(false);
    expect(isSameTeam([1, 4], [1, 4, 7])).toBe(false);
    expect(isSameTeam([], [])).toBe(true);
  });
});

describe('shareable team link', () => {
  test('encodes the team in the URL', () => {
    expect(serializeTeamParam([1, 4, 7])).toBe('1,4,7');
    expect(buildTeamPath([1, 4, 7])).toBe('/team?p=1,4,7');
    expect(buildTeamPath([])).toBe('/team');
    expect(buildTeamUrl([1, 4, 7], 'https://pokedex.example')).toBe('https://pokedex.example/team?p=1,4,7');
    expect(buildTeamUrl([6], 'https://pokedex.example/')).toBe('https://pokedex.example/team?p=6');
  });

  test('reads the team back from the URL parameter', () => {
    expect(parseTeamParam('1,4,7')).toEqual([1, 4, 7]);
    expect(parseTeamParam(new URLSearchParams('?p=6,9,3').get('p'))).toEqual([6, 9, 3]);
    // Virgules encodées par certains outils de partage
    expect(parseTeamParam(new URLSearchParams('?p=6%2C9%2C3').get('p'))).toEqual([6, 9, 3]);
  });

  test('ignores a missing or malformed parameter instead of failing', () => {
    expect(parseTeamParam(null)).toEqual([]);
    expect(parseTeamParam('')).toEqual([]);
    expect(parseTeamParam('1,,x,4;7, 4 ,-2')).toEqual([1, 4]);
    expect(parseTeamParam('1,2,3,4,5,6,7,8,9')).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('a link survives a round trip', () => {
    const team = [150, 6, 25, 143];
    const url = new URL(buildTeamUrl(team, 'https://pokedex.example'));
    expect(parseTeamParam(url.searchParams.get('p'))).toEqual(team);
  });
});

describe('analyzeTeamDefense', () => {
  // Équipe de référence : Dracaufeu (Feu/Vol), Tortank (Eau), Florizarre (Plante/Poison).
  const analysis = analyzeTeamDefense([CHARIZARD, BLASTOISE, VENUSAUR]);
  const row = (type) => analysis.rows.find((entry) => entry.type === type);
  const counts = (type) => [row(type).weak.length, row(type).resist.length, row(type).immune.length];

  test('covers the 18 attack types, in chart order', () => {
    expect(typesOf(analysis.rows)).toEqual(ALL_TYPES);
    expect(analysis.rows).toHaveLength(18);
    expect(analysis.size).toBe(3);
  });

  test('counts weak, resistant and immune members for every attack type', () => {
    // [faibles, résistants, immunisés], établi à la main depuis la table officielle
    const expected = {
      normal: [0, 0, 0],
      fire: [1, 2, 0],
      water: [1, 2, 0],
      electric: [2, 1, 0],
      grass: [1, 2, 0],
      ice: [1, 1, 0],
      fighting: [0, 2, 0],
      poison: [0, 0, 0],
      ground: [0, 0, 1],
      flying: [1, 0, 0],
      psychic: [1, 0, 0],
      bug: [0, 1, 0],
      rock: [1, 0, 0],
      ghost: [0, 0, 0],
      dragon: [0, 0, 0],
      dark: [0, 0, 0],
      steel: [0, 2, 0],
      fairy: [0, 2, 0],
    };

    expect(Object.fromEntries(ALL_TYPES.map((type) => [type, counts(type)]))).toEqual(expected);
  });

  test('says which member is affected and by how much', () => {
    expect(idsOf(row('electric').weak)).toEqual([6, 9]);
    expect(idsOf(row('electric').resist)).toEqual([3]);
    expect(row('rock').weak).toEqual([{ id: 6, multiplier: 4 }]);
    expect(row('ground').immune).toEqual([{ id: 6, multiplier: 0 }]);
    expect(row('grass').resist).toEqual([
      { id: 6, multiplier: 0.25 },
      { id: 3, multiplier: 0.25 },
    ]);
    // Feu ×½ et Vol ×2 se compensent : Dracaufeu est neutre face à Glace
    expect(idsOf(row('ice').neutral)).toEqual([6]);
  });

  test('every member is counted exactly once per attack type', () => {
    analysis.rows.forEach((entry) => {
      const total = entry.weak.length + entry.resist.length + entry.immune.length + entry.neutral.length;
      expect(total).toBe(3);
    });
  });

  test('no weakness is shared by three members in the reference team', () => {
    expect(analysis.sharedWeaknesses).toEqual([]);
  });

  test('lists the attack types nobody resists, immunities counting as cover', () => {
    expect(typesOf(analysis.unresisted)).toEqual([
      'normal', 'poison', 'flying', 'psychic', 'rock', 'ghost', 'dragon', 'dark',
    ]);
    // Sol : personne ne résiste, mais Dracaufeu est immunisé
    expect(typesOf(analysis.unresisted)).not.toContain('ground');
  });

  test('flags weaknesses shared by three members or more, most shared first', () => {
    // Dracaufeu, Papilusion (Insecte/Vol), Roucarnage (Normal/Vol), Dracolosse (Dragon/Vol)
    const flyers = analyzeTeamDefense([
      CHARIZARD,
      { id: 12, types: ['bug', 'flying'] },
      { id: 18, types: ['normal', 'flying'] },
      { id: 149, types: ['dragon', 'flying'] },
    ]);

    expect(flyers.sharedWeaknesses.map((entry) => [entry.type, entry.weak.length])).toEqual([
      ['rock', 4],
      ['electric', 3],
      ['ice', 3],
    ]);
    expect(idsOf(flyers.rows.find((entry) => entry.type === 'ground').immune)).toEqual([6, 12, 18, 149]);
  });

  test('two members sharing a weakness are not enough to flag it', () => {
    const pair = analyzeTeamDefense([CHARIZARD, BLASTOISE]);
    expect(pair.rows.find((entry) => entry.type === 'electric').weak).toHaveLength(2);
    expect(pair.sharedWeaknesses).toEqual([]);
  });

  test('an empty team has nothing to report', () => {
    const empty = analyzeTeamDefense([]);
    expect(empty.size).toBe(0);
    expect(empty.rows).toHaveLength(18);
    expect(empty.sharedWeaknesses).toEqual([]);
    expect(empty.unresisted).toEqual([]);
  });

  test('a member without known types is treated as neutral to everything', () => {
    const unknown = analyzeTeamDefense([{ id: 1 }]);
    unknown.rows.forEach((entry) => expect(idsOf(entry.neutral)).toEqual([1]));
  });
});

describe('summarizeTeamStats', () => {
  const stats = (hp, attack, defense, spAtk, spDef, speed) => ({
    stats: { hp, attack, defense, 'special-attack': spAtk, 'special-defense': spDef, speed },
    total: hp + attack + defense + spAtk + spDef + speed,
  });
  // Statistiques de base officielles
  const charizard = stats(78, 84, 78, 109, 85, 100); // 534
  const blastoise = stats(79, 83, 100, 85, 105, 78); // 530
  const venusaur = stats(80, 82, 83, 100, 100, 80); // 525

  test('adds up and averages the base stats of the team', () => {
    const summary = summarizeTeamStats([charizard, blastoise, venusaur]);

    expect(summary.total).toBe(1589);
    expect(summary.average).toBeCloseTo(529.67, 2);
    expect(summary.perStat.hp).toEqual({ total: 237, average: 79 });
    expect(summary.perStat['special-attack']).toEqual({ total: 294, average: 98 });
    expect(summary.perStat.speed).toEqual({ total: 258, average: 86 });
    expect(summary).toMatchObject({ members: 3, counted: 3, complete: true });
  });

  test('only counts members whose stats are known, and says so', () => {
    const summary = summarizeTeamStats([charizard, null, { stats: null, total: null }]);

    expect(summary).toMatchObject({ members: 3, counted: 1, complete: false, total: 534, average: 534 });
  });

  test('reports nothing rather than zeros when no stats are available', () => {
    expect(summarizeTeamStats([null, { stats: null }])).toEqual({
      members: 2,
      counted: 0,
      complete: false,
      total: null,
      average: null,
      perStat: null,
    });
    expect(summarizeTeamStats([])).toMatchObject({ members: 0, counted: 0, complete: false, total: null });
  });

  test('ignores incomplete stat blocks', () => {
    const summary = summarizeTeamStats([charizard, { stats: { hp: 50 }, total: 50 }]);
    expect(summary).toMatchObject({ counted: 1, complete: false, total: 534 });
  });
});

describe('translations', () => {
  const flatten = (dictionary, prefix = '') =>
    Object.entries(dictionary).flatMap(([key, value]) =>
      value && typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [`${prefix}${key}`]
    );

  test('every key exists in both French and English', () => {
    expect(flatten(translations.en).sort()).toEqual(flatten(translations.fr).sort());
  });

  test('the team builder is translated in both languages', () => {
    const teamKeys = flatten(translations.fr).filter((key) => key.startsWith('team.'));
    expect(teamKeys.length).toBeGreaterThan(10);
    teamKeys.forEach((key) => {
      const [, name] = key.split('.');
      expect(translations.en.team[name]).toEqual(expect.any(String));
      expect(translations.fr.team[name]).toEqual(expect.any(String));
    });
  });
});
