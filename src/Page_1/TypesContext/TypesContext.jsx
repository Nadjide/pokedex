import React, { createContext, useState, useEffect } from 'react';

export const TypesContext = createContext();

export const TypesProvider = ({ children }) => {
  const [typesData, setTypesData] = useState({});

  useEffect(() => {
    fetch('https://pokedex-jgabriele.vercel.app/types.json')
      .then((response) => response.json())
      .then((data) => {
        setTypesData(data);
      });
  }, []);

  return (
    <TypesContext.Provider value={typesData}>
      {children}
    </TypesContext.Provider>
  );
};