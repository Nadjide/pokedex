import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import App from './App';

const mockPokemons = [
  {
    id: 1,
    height: 7,
    weight: 69,
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    types: ['poison', 'grass'],
    moves: ['tackle', 'vine-whip'],
    names: {
      en: 'Bulbasaur',
      fr: 'Bulbizarre',
    },
  },
  {
    id: 4,
    height: 6,
    weight: 85,
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
    types: ['fire'],
    moves: ['scratch', 'ember'],
    names: {
      en: 'Charmander',
      fr: 'Salamèche',
    },
  },
];

const mockTypes = {
  grass: {
    backgroundColor: '#7AC74C',
    translations: { fr: 'Plante', en: 'Grass' },
  },
  poison: {
    backgroundColor: '#A33EA1',
    translations: { fr: 'Poison', en: 'Poison' },
  },
  fire: {
    backgroundColor: '#EE8130',
    translations: { fr: 'Feu', en: 'Fire' },
  },
};

beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url.includes('pokemons.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPokemons),
      });
    }
    if (url.includes('types.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTypes),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ stats: [] }),
    });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('renders Pokedex application header and logo', async () => {
  render(<App />);
  const logoElements = screen.getAllByAltText(/pokédex/i);
  expect(logoElements.length).toBeGreaterThan(0);
});

test('renders pokemon cards after data fetch', async () => {
  render(<App />);

  await waitFor(() => {
    expect(screen.getByText(/Bulbizarre/i)).toBeInTheDocument();
  });
  expect(screen.getByText(/Salamèche/i)).toBeInTheDocument();
});

test('renders search input field', async () => {
  render(<App />);
  const searchInput = screen.getByPlaceholderText(/Rechercher par nom/i);
  expect(searchInput).toBeInTheDocument();
});
