import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  POKEDEX_CACHE_MAX_AGE_MS,
  fetchKantoFallback,
  fetchPokedex,
  readPokedexCache,
  writePokedexCache,
} from '../api/pokedex.js';

export const PokemonContext = createContext({
  pokemons: [],
  typesData: {},
  loading: true,
  error: null,
  isFallback: false,
  refetch: () => {},
  getPokemonById: () => null,
  getSimilarPokemons: () => [],
});

export const usePokemon = () => useContext(PokemonContext);

// Libellés et couleurs des types viennent de Theme/typeColors.js : types.json
// n'est plus chargé. La clé reste exposée pour TypesContext.
const EMPTY_TYPES_DATA = {};

const initialState = () => {
  const cached = readPokedexCache();
  return cached
    ? { pokemons: cached.pokemons, loading: false, error: null, isFallback: false, savedAt: cached.savedAt }
    : { pokemons: [], loading: true, error: null, isFallback: false, savedAt: 0 };
};

export const PokemonProvider = ({ children }) => {
  // Visites suivantes : la liste sort du cache local, sans écran de chargement.
  const [state, setState] = useState(initialState);
  const { pokemons, loading, error, isFallback } = state;

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const list = await fetchPokedex();
      writePokedexCache(list);
      setState({ pokemons: list, loading: false, error: null, isFallback: false, savedAt: Date.now() });
    } catch (apiError) {
      console.error('PokéAPI indisponible, repli sur le jeu de données Kanto :', apiError);
      try {
        // Repli non mis en cache : la liste complète sera retentée à la prochaine visite.
        const list = await fetchKantoFallback();
        setState({ pokemons: list, loading: false, error: null, isFallback: true, savedAt: 0 });
      } catch (fallbackError) {
        console.error('Erreur lors du chargement des données Pokédex :', fallbackError);
        setState({
          pokemons: [],
          loading: false,
          error: fallbackError.message || 'Impossible de charger les données du Pokédex.',
          isFallback: false,
          savedAt: 0,
        });
      }
    }
  }, []);

  useEffect(() => {
    if (state.savedAt === 0) {
      fetchData();
      return;
    }
    if (Date.now() - state.savedAt < POKEDEX_CACHE_MAX_AGE_MS) return;

    // Cache ancien : on le garde à l'écran et on le rafraîchit sans bruit.
    fetchPokedex()
      .then((list) => {
        writePokedexCache(list);
        setState((prev) =>
          JSON.stringify(prev.pokemons) === JSON.stringify(list)
            ? { ...prev, savedAt: Date.now() }
            : { ...prev, pokemons: list, savedAt: Date.now() }
        );
      })
      .catch(() => {});
    // Uniquement au montage : `savedAt` décrit l'état initial du cache.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pokemonsById = useMemo(() => new Map(pokemons.map((p) => [p.id, p])), [pokemons]);

  const getPokemonById = useCallback(
    (id) => pokemonsById.get(Number(id)) || null,
    [pokemonsById]
  );

  // Les Pokémon partageant les deux types passent avant ceux qui n'en
  // partagent qu'un ; à égalité, les plus proches dans le Pokédex d'abord.
  const getSimilarPokemons = useCallback(
    (targetPokemon, limit = 12) => {
      if (!targetPokemon || !targetPokemon.types) return [];
      const sharedCount = (p) => p.types.filter((t) => targetPokemon.types.includes(t)).length;

      return pokemons
        .filter((p) => p.id !== targetPokemon.id && sharedCount(p) > 0)
        .sort(
          (a, b) =>
            sharedCount(b) - sharedCount(a) ||
            Math.abs(a.id - targetPokemon.id) - Math.abs(b.id - targetPokemon.id)
        )
        .slice(0, limit);
    },
    [pokemons]
  );

  const value = useMemo(
    () => ({
      pokemons,
      typesData: EMPTY_TYPES_DATA,
      loading,
      error,
      // true : PokéAPI a échoué, seule la liste de Kanto est affichée.
      isFallback,
      refetch: fetchData,
      getPokemonById,
      getSimilarPokemons,
    }),
    [pokemons, loading, error, isFallback, fetchData, getPokemonById, getSimilarPokemons]
  );

  return <PokemonContext.Provider value={value}>{children}</PokemonContext.Provider>;
};
