import React, { createContext } from 'react';
import { usePokemon } from '../../context/PokemonContext.jsx';

export const TypesContext = createContext({});

export const TypesProvider = ({ children }) => {
  const { typesData } = usePokemon();

  return (
    <TypesContext.Provider value={typesData}>
      {children}
    </TypesContext.Provider>
  );
};
