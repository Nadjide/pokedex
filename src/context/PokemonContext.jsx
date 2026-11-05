import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

      setPokemons(pokemonsJson || []);
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

  const getPokemonById = useCallback(
    (id) => {
      const numId = Number(id);
      return pokemons.find((p) => p.id === numId) || null;
    },
    [pokemons]
  );

  const getSimilarPokemons = useCallback(
    (targetPokemon, limit = 12) => {
      if (!targetPokemon || !targetPokemon.types) return [];
      return pokemons
        .filter(
          (p) =>
            p.id !== targetPokemon.id &&
            p.types.some((t) => targetPokemon.types.includes(t))
        )
        .slice(0, limit);
    },
    [pokemons]
  );

  return (
    <PokemonContext.Provider
      value={{
        pokemons,
        typesData,
        loading,
        error,
        refetch: fetchData,
        getPokemonById,
        getSimilarPokemons,
      }}
    >
      {children}
    </PokemonContext.Provider>
  );
};
