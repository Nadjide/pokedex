import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import App from './App';

const mockPokemons = [
  {
    id: 1,
    height: 7,
    weight: 69,
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    // Le jeu de données réel liste les types en ordre inverse (secondaire d'abord)
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
  localStorage.clear();
  window.history.pushState({}, '', '/');

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

// Les cartes de la grille sont des <article> ; le « Pokémon du jour » n'en est pas un.
const findCards = () => screen.findAllByRole('article');

test('renders the header with a link back to the Pokédex home', async () => {
  render(<App />);
  expect(screen.getByRole('link', { name: /pokédex/i })).toHaveAttribute('href', '/');
  await findCards();
});

test('renders pokemon cards after data fetch', async () => {
  render(<App />);

  const cards = await findCards();
  expect(cards).toHaveLength(2);
  expect(within(cards[0]).getByRole('link', { name: 'Bulbizarre' })).toHaveAttribute('href', '/pokemon/1');
  expect(within(cards[1]).getByRole('link', { name: 'Salamèche' })).toHaveAttribute('href', '/pokemon/4');
});

test('shows the main type first even though the dataset lists it last', async () => {
  render(<App />);

  const [bulbasaur] = await findCards();
  const badges = within(bulbasaur).getAllByText(/Plante|Poison/);
  expect(badges.map((badge) => badge.textContent)).toEqual(['Plante', 'Poison']);
});

test('renders search input field', async () => {
  render(<App />);
  const searchInput = screen.getByPlaceholderText(/Rechercher par nom/i);
  expect(searchInput).toBeInTheDocument();
  await findCards();
});

test('filters the grid from the search field, ignoring accents', async () => {
  const user = userEvent.setup();
  render(<App />);
  await findCards();

  await user.type(screen.getByPlaceholderText(/Rechercher par nom/i), 'salameche');

  await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1));
  expect(within(screen.getByRole('article')).getByRole('link', { name: 'Salamèche' })).toBeInTheDocument();
});

test('shows only favorites when the favorites filter is on', async () => {
  const user = userEvent.setup();
  render(<App />);
  const cards = await findCards();

  await user.click(within(cards[1]).getByRole('button', { name: 'Ajouter aux favoris' }));
  await user.click(screen.getByRole('button', { name: 'Favoris uniquement' }));

  await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1));
  expect(within(screen.getByRole('article')).getByRole('link', { name: 'Salamèche' })).toBeInTheDocument();
});

test('switches the interface language', async () => {
  const user = userEvent.setup();
  render(<App />);
  await findCards();

  await user.click(screen.getByRole('button', { name: 'English' }));

  expect(screen.getByPlaceholderText(/Search by name/i)).toBeInTheDocument();
  expect(within(screen.getAllByRole('article')[0]).getByRole('link', { name: 'Bulbasaur' })).toBeInTheDocument();
});
