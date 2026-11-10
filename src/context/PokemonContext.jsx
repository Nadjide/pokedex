import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export const PokemonContext = createContext({
  pokemons: [],
  typesData: {},
  loading: true,
  error: null,
  refetch: () => {},
  getPokemonById: () => null,
  getSimilarPokemons: () => [],
});

export const usePokemon = () => useContext(PokemonContext);

const POKEMONS_URL = 'https://pokedex-jgabriele.vercel.app/pokemons.json';
const TYPES_URL = 'https://pokedex-jgabriele.vercel.app/types.json';

// Le jeu de données liste les types en ordre inverse de l'ordre officiel
// (Dracaufeu : « flying, fire »). On rétablit type principal puis secondaire,
// pour que la couleur dominante d'une fiche soit celle du type principal.
const normalizePokemon = (pokemon) => ({
  ...pokemon,
  types: Array.isArray(pokemon.types) ? [...pokemon.types].reverse() : [],
});

export const PokemonProvider = ({ children }) => {
  const [pokemons, setPokemons] = useState([]);
  const [typesData, setTypesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pokemonsRes, typesRes] = await Promise.all([
        fetch(POKEMONS_URL),
        fetch(TYPES_URL),
      ]);

      if (!pokemonsRes.ok) throw new Error(`Erreur Pokémon: ${pokemonsRes.status}`);
      if (!typesRes.ok) throw new Error(`Erreur Types: ${typesRes.status}`);

      const [pokemonsJson, typesJson] = await Promise.all([
        pokemonsRes.json(),
        typesRes.json(),
      ]);

      setPokemons((pokemonsJson || []).map(normalizePokemon));
      setTypesData(typesJson || {});
    } catch (err) {
      console.error('Erreur lors du chargement des données Pokédex:', err);
      setError(err.message || 'Impossible de charger les données du Pokédex.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      typesData,
      loading,
      error,
      refetch: fetchData,
      getPokemonById,
      getSimilarPokemons,
    }),
    [pokemons, typesData, loading, error, fetchData, getPokemonById, getSimilarPokemons]
  );

  return <PokemonContext.Provider value={value}>{children}</PokemonContext.Provider>;
};
