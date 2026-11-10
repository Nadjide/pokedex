import { useCallback, useEffect, useState } from 'react';
import { getAbility, getEvolutionTree, getPokemonCore, getSpecies } from '../api/pokeapi.js';

const INITIAL = {
  loading: true,
  failed: false,
  core: null,
  species: null,
  // undefined = en cours de chargement, null = indisponible
  evolution: undefined,
  abilities: undefined,
};

// Données détaillées d'un Pokémon (PokéAPI). Chaque bloc échoue indépendamment :
// une description manquante n'empêche pas d'afficher les statistiques.
export function usePokemonDetails(id) {
  const [state, setState] = useState(INITIAL);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;
    setState(INITIAL);

    (async () => {
      const [coreResult, speciesResult] = await Promise.allSettled([getPokemonCore(id), getSpecies(id)]);
      if (cancelled) return;

      const core = coreResult.status === 'fulfilled' ? coreResult.value : null;
      const species = speciesResult.status === 'fulfilled' ? speciesResult.value : null;

      setState((prev) => ({
        ...prev,
        loading: false,
        failed: !core && !species,
        core,
        species,
      }));

      const [evolutionResult, abilitiesResult] = await Promise.allSettled([
        species?.evolutionChainUrl ? getEvolutionTree(species.evolutionChainUrl) : Promise.resolve(null),
        Promise.all(
          (core?.abilities || []).map((ability) =>
            getAbility(ability.url)
              .then((details) => ({ ...ability, ...details }))
              .catch(() => ({ ...ability, names: {}, description: {} }))
          )
        ),
      ]);
      if (cancelled) return;

      setState((prev) => ({
        ...prev,
        evolution: evolutionResult.status === 'fulfilled' ? evolutionResult.value : null,
        abilities: abilitiesResult.status === 'fulfilled' ? abilitiesResult.value : [],
      }));
    })();

    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, retry };
}

// Statistiques de base seules (comparateur).
export function usePokemonStats(id) {
  const [state, setState] = useState({ loading: Boolean(id), stats: null, total: null });

  useEffect(() => {
    if (!id) {
      setState({ loading: false, stats: null, total: null });
      return undefined;
    }
    let cancelled = false;
    setState({ loading: true, stats: null, total: null });

    getPokemonCore(id)
      .then((core) => {
        if (!cancelled) setState({ loading: false, stats: core.stats, total: core.total });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, stats: null, total: null });
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}
