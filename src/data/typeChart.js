// Table des types (génération VI et suivantes).
// CHART[attaquant][défenseur] = multiplicateur ; absent = ×1.
export const ALL_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

const CHART = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: {
    fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5,
    bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5,
  },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: {
    normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5,
    rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5,
  },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2,
    ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5,
  },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

export const getEffectiveness = (attackType, defenseType) =>
  CHART[attackType]?.[defenseType] ?? 1;

// Multiplicateur subi par un Pokémon (1 ou 2 types) pour chaque type d'attaque.
export const getDefenseMultipliers = (defenderTypes = []) =>
  Object.fromEntries(
    ALL_TYPES.map((attackType) => [
      attackType,
      defenderTypes.reduce((acc, defType) => acc * getEffectiveness(attackType, defType), 1),
    ])
  );

// Regroupe les types d'attaque par famille d'efficacité (hors ×1).
export const getDefenseProfile = (defenderTypes = []) => {
  const multipliers = getDefenseMultipliers(defenderTypes);
  const byMultiplier = (predicate) =>
    ALL_TYPES.filter((type) => predicate(multipliers[type]))
      .map((type) => ({ type, multiplier: multipliers[type] }))
      .sort((a, b) => b.multiplier - a.multiplier);

  return {
    weaknesses: byMultiplier((m) => m > 1),
    resistances: byMultiplier((m) => m < 1 && m > 0),
    immunities: byMultiplier((m) => m === 0),
  };
};

export const formatMultiplier = (multiplier) => {
  if (multiplier === 0.5) return '×½';
  if (multiplier === 0.25) return '×¼';
  return `×${multiplier}`;
};
