import React from 'react';
import { Box } from '@mui/material';
import PokemonCard from '../PokemonCard/PokemonCard';
import { useVirtualGrid } from '../../hooks/useVirtualGrid.js';

export const gridSx = {
  display: 'grid',
  gridTemplateColumns: {
    xs: 'repeat(2, minmax(0, 1fr))',
    sm: 'repeat(auto-fill, minmax(196px, 1fr))',
  },
  gap: { xs: 1.5, sm: 2.25 },
};

// Rangées dont les cartes gardent l'apparition en cascade de la première page.
const STAGGERED_ROWS = 3;

// Grille fenêtrée : avec 1 025 Pokémon, seules les cartes proches de l'écran
// sont montées. Composant isolé pour que le défilement ne redessine que lui.
function PokemonGrid({ pokemons, resetKey, initialScrollY }) {
  const { gridRef, start, end, columns, paddingTop, paddingBottom } = useVirtualGrid({
    itemCount: pokemons.length,
    resetKey,
    initialScrollY,
  });

  const first = start * columns;
  const visible = pokemons.slice(first, end * columns);

  return (
    <Box ref={gridRef} sx={gridSx} style={{ paddingTop, paddingBottom }}>
      {visible.map((pokemon, i) => {
        const position = first + i;
        const row = Math.floor(position / columns);
        // Valeur stable pour une carte donnée : le défilement ne la re-rend pas.
        const delayIndex = row < STAGGERED_ROWS ? position : position % columns;
        return <PokemonCard key={pokemon.id} pokemon={pokemon} index={delayIndex} />;
      })}
    </Box>
  );
}

export default React.memo(PokemonGrid);
