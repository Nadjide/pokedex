import { useEffect, useState } from 'react';
import { getPokemonMoves } from '../api/pokeapi.js';

// Capacités d'un Pokémon, chargées à la demande sur la fiche.
// `moves` : undefined = chargement, null = indisponible, sinon la liste.
export function usePokemonMoves(id) {
  const [state, setState] = useState({ id, moves: undefined });

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;

    getPokemonMoves(id)
      .then((moves) => {
        if (!cancelled) setState({ id, moves });
      })
      .catch(() => {
        if (!cancelled) setState({ id, moves: null });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Changement de fiche : l'ancienne liste ne doit pas rester affichée.
  return state.id === id ? state.moves : undefined;
}
