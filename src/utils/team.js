import { ALL_TYPES, getDefenseMultipliers } from '../data/typeChart.js';
import { STAT_KEYS } from '../api/pokeapi.js';

export const MAX_TEAM_SIZE = 6;

// Une faiblesse est « partagée » quand au moins ce nombre de membres la subit.
export const SHARED_WEAKNESS_THRESHOLD = 3;

// Paramètre d'URL du lien partageable : /team?p=1,4,7
export const TEAM_PARAM = 'p';

const toId = (value) => {
  const text = String(value ?? '').trim();
  return /^\d+$/.test(text) ? Number(text) : NaN;
};

// Identifiants entiers positifs, sans doublon, dans l'ordre d'arrivée, limités
// à la taille maximale d'une équipe. Tout le reste est ignoré.
export const sanitizeTeamIds = (input) => {
  const ids = [];
  (Array.isArray(input) ? input : []).forEach((value) => {
    const id = toId(value);
    if (Number.isSafeInteger(id) && id > 0 && !ids.includes(id) && ids.length < MAX_TEAM_SIZE) {
      ids.push(id);
    }
  });
  return ids;
};

// « 1,4,7 » → [1, 4, 7]
export const parseTeamParam = (param) =>
  typeof param === 'string' && param.trim() !== '' ? sanitizeTeamIds(param.split(',')) : [];

export const serializeTeamParam = (ids) => sanitizeTeamIds(ids).join(',');

export const buildTeamPath = (ids) => {
  const serialized = serializeTeamParam(ids);
  return serialized ? `/team?${TEAM_PARAM}=${serialized}` : '/team';
};

export const buildTeamUrl = (ids, origin = '') => `${String(origin).replace(/\/+$/, '')}${buildTeamPath(ids)}`;

export const isSameTeam = (a = [], b = []) => a.length === b.length && a.every((id, index) => id === b[index]);

// Ajout en fin d'équipe ; sans effet si le Pokémon y est déjà ou si elle est complète.
export const addTeamMember = (ids, id) => {
  const numericId = toId(id);
  if (!Number.isSafeInteger(numericId) || numericId <= 0) return ids;
  if (ids.includes(numericId) || ids.length >= MAX_TEAM_SIZE) return ids;
  return [...ids, numericId];
};

export const removeTeamMember = (ids, id) => {
  const numericId = toId(id);
  return ids.includes(numericId) ? ids.filter((entry) => entry !== numericId) : ids;
};

// Analyse défensive d'une équipe. `members` : [{ id, types }].
// Pour chaque type d'attaque, les membres sont rangés selon le multiplicateur
// subi : faibles (> 1), résistants (entre 0 et 1), immunisés (0), neutres (1).
export const analyzeTeamDefense = (members = []) => {
  const profiles = members.map((member) => ({
    id: member.id,
    multipliers: getDefenseMultipliers(member.types || []),
  }));

  const rows = ALL_TYPES.map((type) => {
    const row = { type, weak: [], resist: [], immune: [], neutral: [] };
    profiles.forEach(({ id, multipliers }) => {
      const multiplier = multipliers[type];
      const entry = { id, multiplier };
      if (multiplier === 0) row.immune.push(entry);
      else if (multiplier > 1) row.weak.push(entry);
      else if (multiplier < 1) row.resist.push(entry);
      else row.neutral.push(entry);
    });
    return row;
  });

  const hasMembers = members.length > 0;

  return {
    size: members.length,
    rows,
    // Les plus partagées d'abord ; à égalité, l'ordre de la table des types.
    sharedWeaknesses: rows
      .filter((row) => row.weak.length >= SHARED_WEAKNESS_THRESHOLD)
      .sort((a, b) => b.weak.length - a.weak.length),
    // Aucun membre ne résiste au type ni n'y est immunisé.
    unresisted: hasMembers ? rows.filter((row) => row.resist.length === 0 && row.immune.length === 0) : [],
  };
};

// Total et moyenne des statistiques de base. `entries` : une entrée par membre,
// `{ stats, total }` ou `null` quand ses statistiques sont indisponibles. Seuls
// les membres dont les statistiques sont connues comptent : rien n'est estimé.
export const summarizeTeamStats = (entries = []) => {
  const known = entries.filter(
    (entry) => entry && entry.stats && STAT_KEYS.every((key) => typeof entry.stats[key] === 'number')
  );
  const counted = known.length;
  const base = { members: entries.length, counted, complete: entries.length > 0 && counted === entries.length };

  if (counted === 0) return { ...base, total: null, average: null, perStat: null };

  const perStat = {};
  STAT_KEYS.forEach((key) => {
    const total = known.reduce((sum, entry) => sum + entry.stats[key], 0);
    perStat[key] = { total, average: total / counted };
  });
  const total = STAT_KEYS.reduce((sum, key) => sum + perStat[key].total, 0);

  return { ...base, total, average: total / counted, perStat };
};
