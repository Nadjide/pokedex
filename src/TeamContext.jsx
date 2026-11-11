import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePokemon } from './context/PokemonContext.jsx';
import { MAX_TEAM_SIZE, addTeamMember, removeTeamMember, sanitizeTeamIds } from './utils/team.js';

const STORAGE_KEY = 'team';

export const TeamContext = createContext({
  team: [],
  setTeam: () => {},
  addToTeam: () => {},
  removeFromTeam: () => {},
  toggleTeamMember: () => {},
  clearTeam: () => {},
  isInTeam: () => false,
  isFull: false,
  maxSize: MAX_TEAM_SIZE,
});

export const useTeam = () => useContext(TeamContext);

const readStoredTeam = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? sanitizeTeamIds(JSON.parse(stored)) : [];
  } catch (e) {
    console.warn('Failed to parse team from localStorage:', e);
    return [];
  }
};

// Équipe de 6 Pokémon maximum, mémorisée sous forme d'identifiants.
export const TeamProvider = ({ children }) => {
  const { pokemons, loading, error } = usePokemon();
  const [team, setTeamState] = useState(readStoredTeam);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
    } catch (e) {
      console.warn('Failed to save team to localStorage:', e);
    }
  }, [team]);

  // Une fois le Pokédex chargé, on écarte les identifiants qu'il ne connaît pas
  // (lien partagé erroné, données modifiées) : ils occuperaient un emplacement
  // sans pouvoir être affichés.
  useEffect(() => {
    if (loading || error || pokemons.length === 0) return;
    const known = new Set(pokemons.map((pokemon) => pokemon.id));
    setTeamState((prev) => (prev.every((id) => known.has(id)) ? prev : prev.filter((id) => known.has(id))));
  }, [pokemons, loading, error]);

  const setTeam = useCallback((ids) => setTeamState(sanitizeTeamIds(ids)), []);
  const addToTeam = useCallback((id) => setTeamState((prev) => addTeamMember(prev, id)), []);
  const removeFromTeam = useCallback((id) => setTeamState((prev) => removeTeamMember(prev, id)), []);
  const toggleTeamMember = useCallback(
    (id) => setTeamState((prev) => (prev.includes(Number(id)) ? removeTeamMember(prev, id) : addTeamMember(prev, id))),
    []
  );
  const clearTeam = useCallback(() => setTeamState([]), []);

  const value = useMemo(
    () => ({
      team,
      setTeam,
      addToTeam,
      removeFromTeam,
      toggleTeamMember,
      clearTeam,
      isInTeam: (id) => team.includes(Number(id)),
      isFull: team.length >= MAX_TEAM_SIZE,
      maxSize: MAX_TEAM_SIZE,
    }),
    [team, setTeam, addToTeam, removeFromTeam, toggleTeamMember, clearTeam]
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};
