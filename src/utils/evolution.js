import { getTypeLabel } from '../Theme/typeColors.js';
import { formatSlug } from './pokemon.js';

const idFromUrl = (url = '') => {
  const match = String(url).match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : null;
};

const named = (ref) => (ref?.name ? { slug: ref.name, url: ref.url || null } : null);

const normalizeDetail = (detail) => ({
  trigger: detail.trigger?.name || null,
  minLevel: detail.min_level || null,
  minHappiness: detail.min_happiness || null,
  minAffection: detail.min_affection || null,
  minBeauty: detail.min_beauty || null,
  timeOfDay: detail.time_of_day || null,
  // 1 = femelle, 2 = mâle
  gender: detail.gender || null,
  item: named(detail.item),
  heldItem: named(detail.held_item),
  knownMove: named(detail.known_move),
  usedMove: named(detail.used_move),
  minMoveCount: detail.min_move_count || null,
  knownMoveType: detail.known_move_type?.name || null,
  partyType: detail.party_type?.name || null,
  partySpeciesId: idFromUrl(detail.party_species?.url),
  tradeSpeciesId: idFromUrl(detail.trade_species?.url),
  location: named(detail.location),
  needsRain: Boolean(detail.needs_overworld_rain),
  turnUpsideDown: Boolean(detail.turn_upside_down),
  needsMultiplayer: Boolean(detail.needs_multiplayer),
  // 1 : Attaque > Défense, -1 : Attaque < Défense, 0 : égalité
  relativePhysicalStats:
    typeof detail.relative_physical_stats === 'number' ? detail.relative_physical_stats : null,
  minSteps: detail.min_steps || null,
  minDamageTaken: detail.min_damage_taken || null,
});

const isOtherForm = (form, speciesSlug) => Boolean(form?.name && speciesSlug && form.name !== speciesSlug);

// Plus le score est bas, plus la ligne décrit l'évolution « standard » : celle
// des jeux récents, hors formes régionales.
const scoreDetail = (detail, { slug, parentSlug }) =>
  (detail.is_default === false ? 4 : 0) +
  (detail.region ? 2 : 0) +
  (isOtherForm(detail.required_pokemon_form, parentSlug) ? 1 : 0) +
  (isOtherForm(detail.evolved_pokemon_form, slug) ? 1 : 0);

const keyOf = (value) => (value && typeof value === 'object' ? value.slug : value);

const MAX_ITEM_ALTERNATIVES = 3;

// PokéAPI décrit une même évolution par plusieurs lignes (anciennes versions,
// formes régionales, variantes de forme). On garde les lignes standard et, si
// elles sont plusieurs, uniquement les conditions qu'elles ont en commun
// (Lougaroc : niveau 25, quel que soit le moment de la journée).
export function summarizeEvolutionDetails(details, { slug, parentSlug } = {}) {
  if (!Array.isArray(details) || details.length === 0) return null;

  const scores = details.map((detail) => scoreDetail(detail, { slug, parentSlug }));
  const best = Math.min(...scores);
  const rows = details.filter((_, index) => scores[index] === best).map(normalizeDetail);

  const condition = {};
  Object.keys(rows[0]).forEach((key) => {
    const first = rows[0][key];
    condition[key] = rows.every((row) => keyOf(row[key]) === keyOf(first)) ? first : null;
  });

  // Objets à utiliser : s'ils diffèrent selon la forme, on liste les variantes.
  const items = [];
  rows.forEach((row) => {
    if (row.item && !items.some((item) => item.slug === row.item.slug)) items.push(row.item);
  });
  delete condition.item;
  condition.items = items.length <= MAX_ITEM_ALTERNATIVES ? items : [];

  return condition;
}

// Références dont le nom traduit doit être demandé à PokéAPI.
export const getConditionRefs = (condition) =>
  condition
    ? [...condition.items, condition.heldItem, condition.knownMove, condition.usedMove, condition.location].filter(
        Boolean
      )
    : [];

// Liste de libellés courts décrivant la condition, par ex. ['Bonheur', 'Jour'].
export function describeEvolutionCondition(condition, { t, language, getSpeciesName = () => null }) {
  if (!condition) return [];

  const nameOf = (ref) => ref.names?.[language] || ref.names?.en || formatSlug(ref.slug);
  // `t` renvoie la clé quand elle n'existe pas : repli sur l'identifiant lisible.
  const optional = (key, fallback) => {
    const label = t(key);
    return label === key ? fallback : label;
  };
  const speciesName = (id) => getSpeciesName(id) || `#${id}`;
  const parts = [];
  const items = condition.items || [];
  const { trigger } = condition;

  if (trigger === 'use-item') {
    parts.push(items.length > 0 ? items.map(nameOf).join(' / ') : t('evo.useItem'));
  } else if (trigger === 'trade') {
    parts.push(t('evo.trade'));
  } else if (trigger !== 'level-up' && trigger !== 'in-battle-level-up') {
    const label = trigger ? optional(`evo.triggers.${trigger}`, null) : null;
    if (label) parts.push(label);
  }

  if (condition.minLevel) parts.push(t('evo.level', { level: condition.minLevel }));
  if (trigger !== 'use-item' && items.length > 0) parts.push(items.map(nameOf).join(' / '));
  if (condition.heldItem) parts.push(t('evo.holding', { item: nameOf(condition.heldItem) }));
  if (condition.tradeSpeciesId) parts.push(t('evo.tradeFor', { name: speciesName(condition.tradeSpeciesId) }));
  if (condition.minHappiness) parts.push(t('evo.friendship'));
  if (condition.minAffection) parts.push(t('evo.affection'));
  if (condition.minBeauty) parts.push(t('evo.beauty'));
  if (condition.knownMove) parts.push(t('evo.knowMove', { move: nameOf(condition.knownMove) }));
  if (condition.knownMoveType) {
    parts.push(t('evo.knowMoveType', { type: getTypeLabel(condition.knownMoveType, language) }));
  }
  if (condition.usedMove) {
    parts.push(
      condition.minMoveCount
        ? t('evo.useMoveTimes', { move: nameOf(condition.usedMove), count: condition.minMoveCount })
        : t('evo.useMove', { move: nameOf(condition.usedMove) })
    );
  }
  if (condition.minDamageTaken) {
    parts.push(
      t(trigger === 'recoil-damage' ? 'evo.recoilDamage' : 'evo.damageTaken', { count: condition.minDamageTaken })
    );
  }
  if (condition.minSteps) parts.push(t('evo.steps', { count: condition.minSteps }));
  if (condition.partySpeciesId) parts.push(t('evo.withPokemon', { name: speciesName(condition.partySpeciesId) }));
  if (condition.partyType) parts.push(t('evo.withType', { type: getTypeLabel(condition.partyType, language) }));
  if (condition.relativePhysicalStats !== null && condition.relativePhysicalStats !== undefined) {
    const relation =
      condition.relativePhysicalStats > 0 ? 'higher' : condition.relativePhysicalStats < 0 ? 'lower' : 'equal';
    parts.push(t(`evo.physicalStats.${relation}`));
  }
  if (condition.location) parts.push(nameOf(condition.location));
  if (condition.timeOfDay) parts.push(optional(`evo.time.${condition.timeOfDay}`, formatSlug(condition.timeOfDay)));
  if (condition.gender === 1) parts.push(t('evo.female'));
  if (condition.gender === 2) parts.push(t('evo.male'));
  if (condition.needsRain) parts.push(t('evo.rain'));
  if (condition.turnUpsideDown) parts.push(t('evo.upsideDown'));
  if (condition.needsMultiplayer) parts.push(t('evo.multiplayer'));
  if (trigger === 'in-battle-level-up') parts.push(t('evo.inBattle'));

  if (parts.length === 0) parts.push(trigger === 'level-up' ? t('evo.levelUp') : t('evo.special'));
  return parts;
}
