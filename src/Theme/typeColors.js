// src/Theme/typeColors.js
export const typeColors = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

const FALLBACK_COLOR = '#A8A77A';

// Libellés des 18 types (`typesData`, s'il est fourni, reste prioritaire).
export const typeLabels = {
  normal: { fr: 'Normal', en: 'Normal' },
  fire: { fr: 'Feu', en: 'Fire' },
  water: { fr: 'Eau', en: 'Water' },
  electric: { fr: 'Électrik', en: 'Electric' },
  grass: { fr: 'Plante', en: 'Grass' },
  ice: { fr: 'Glace', en: 'Ice' },
  fighting: { fr: 'Combat', en: 'Fighting' },
  poison: { fr: 'Poison', en: 'Poison' },
  ground: { fr: 'Sol', en: 'Ground' },
  flying: { fr: 'Vol', en: 'Flying' },
  psychic: { fr: 'Psy', en: 'Psychic' },
  bug: { fr: 'Insecte', en: 'Bug' },
  rock: { fr: 'Roche', en: 'Rock' },
  ghost: { fr: 'Spectre', en: 'Ghost' },
  dragon: { fr: 'Dragon', en: 'Dragon' },
  dark: { fr: 'Ténèbres', en: 'Dark' },
  steel: { fr: 'Acier', en: 'Steel' },
  fairy: { fr: 'Fée', en: 'Fairy' },
};

export const getTypeColor = (type) => typeColors[type] || FALLBACK_COLOR;

export const getTypeLabel = (type, language, typesData) =>
  typesData?.[type]?.translations?.[language] || typeLabels[type]?.[language] || type;

const hexToRgb = (hex) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
});

// Couleur de texte lisible (sombre ou claire) sur un aplat de couleur donné.
export const getReadableTextColor = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  // Seuil choisi pour garder un contraste ≥ 4.5:1 sur toutes les couleurs de type.
  return luminance > 0.2 ? '#15171f' : '#ffffff';
};
