import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import App from './App';
import { POKEDEX_CACHE_KEY, POKEDEX_GRAPHQL_URL } from './api/pokedex.js';

// Réponse de l'API GraphQL de PokéAPI (types dans l'ordre des emplacements).
const species = (id, slug, generation, names, types, height, weight) => ({
  id,
  name: slug,
  generation_id: generation,
  pokemonspeciesnames: Object.entries(names).map(([lang, name]) => ({ name, language: { name: lang } })),
  pokemons: [{ height, weight, pokemontypes: types.map((type) => ({ type: { name: type } })) }],
});

const mockSpecies = [
  species(1, 'bulbasaur', 1, { fr: 'Bulbizarre', en: 'Bulbasaur' }, ['grass', 'poison'], 7, 69),
  species(4, 'charmander', 1, { fr: 'Salamèche', en: 'Charmander' }, ['fire'], 6, 85),
  species(700, 'sylveon', 6, { fr: 'Nymphali', en: 'Sylveon' }, ['fairy'], 10, 235),
];

// Ancien jeu de données Kanto : types en ordre inverse (secondaire d'abord).
const mockKanto = [
  { id: 1, height: 7, weight: 69, types: ['poison', 'grass'], moves: ['tackle'], names: { en: 'Bulbasaur', fr: 'Bulbizarre' } },
  { id: 4, height: 6, weight: 85, types: ['fire'], moves: ['scratch'], names: { en: 'Charmander', fr: 'Salamèche' } },
];

const json = (body) => Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
const text = (body) => Promise.resolve({ ok: true, text: () => Promise.resolve(body) });
const unavailable = () => Promise.resolve({ ok: false, status: 503 });

// Fichiers CSV de PokéAPI (repli quand GraphQL ne répond pas).
const mockCsv = {
  pokemon_species: 'id,identifier,generation_id\n1,bulbasaur,1\n906,sprigatito,9\n',
  pokemon: 'id,identifier,species_id,height,weight,base_experience,order,is_default\n1,bulbasaur,1,7,69,64,1,1\n906,sprigatito,906,4,41,62,1,1\n',
  pokemon_types: 'pokemon_id,type_id,slot\n1,4,2\n1,12,1\n906,12,1\n',
  pokemon_species_names: 'pokemon_species_id,local_language_id,name,genus\n1,5,Bulbizarre,\n1,9,Bulbasaur,\n906,5,Poussacha,\n906,9,Sprigatito,\n',
};

const mockFetch = ({ graphql = true, csv = false } = {}) => {
  global.fetch = vi.fn((url) => {
    if (url === POKEDEX_GRAPHQL_URL) {
      return graphql ? json({ data: { pokemonspecies: mockSpecies } }) : unavailable();
    }
    const csvFile = url.match(/\/csv\/(\w+)\.csv$/)?.[1];
    if (csvFile) return csv && mockCsv[csvFile] ? text(mockCsv[csvFile]) : unavailable();
    if (url.includes('pokemons.json')) return json(mockKanto);
    if (/\/pokemon\/\d+$/.test(url)) {
      return json({ stats: [], abilities: [], moves: [{ move: { name: 'vine-whip' } }, { move: { name: 'tackle' } }] });
    }
    return json({});
  });
};

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, '', '/');
  mockFetch();
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

test('renders pokemon cards from PokéAPI, across generations', async () => {
  render(<App />);

  const cards = await findCards();
  expect(cards).toHaveLength(3);
  expect(within(cards[0]).getByRole('link', { name: 'Bulbizarre' })).toHaveAttribute('href', '/pokemon/1');
  expect(within(cards[1]).getByRole('link', { name: 'Salamèche' })).toHaveAttribute('href', '/pokemon/4');
  expect(within(cards[2]).getByRole('link', { name: 'Nymphali' })).toHaveAttribute('href', '/pokemon/700');
  expect(within(cards[2]).getByText('#0700')).toBeInTheDocument();
});

test('shows the main type first', async () => {
  render(<App />);

  const [bulbasaur] = await findCards();
  const badges = within(bulbasaur).getAllByText(/Plante|Poison/);
  expect(badges.map((badge) => badge.textContent)).toEqual(['Plante', 'Poison']);
});

test('stores the list locally and reuses it without a network request', async () => {
  const first = render(<App />);
  await findCards();
  expect(JSON.parse(localStorage.getItem(POKEDEX_CACHE_KEY)).pokemons).toHaveLength(3);
  first.unmount();

  global.fetch.mockClear();
  render(<App />);
  // Aucun écran de chargement : les cartes sont là dès le premier rendu.
  expect(screen.getAllByRole('article')).toHaveLength(3);
  expect(global.fetch).not.toHaveBeenCalledWith(POKEDEX_GRAPHQL_URL, expect.anything());
});

test('falls back to the PokéAPI CSV files when GraphQL fails, keeping every generation', async () => {
  mockFetch({ graphql: false, csv: true });
  render(<App />);

  const cards = await findCards();
  expect(cards).toHaveLength(2);
  expect(within(cards[0]).getAllByText(/Plante|Poison/).map((badge) => badge.textContent)).toEqual(['Plante', 'Poison']);
  expect(within(cards[1]).getByRole('link', { name: 'Poussacha' })).toHaveAttribute('href', '/pokemon/906');
  // Source complète : pas de bandeau de mode dégradé, et la liste est mise en cache.
  expect(screen.queryByText(/seuls les Pokémon de Kanto/)).not.toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(POKEDEX_CACHE_KEY)).pokemons).toHaveLength(2);
});

test('falls back to the Kanto dataset when PokéAPI fails, and says so', async () => {
  mockFetch({ graphql: false });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  render(<App />);

  const cards = await findCards();
  expect(cards).toHaveLength(2);
  // Les types du repli sont remis dans l'ordre officiel.
  const badges = within(cards[0]).getAllByText(/Plante|Poison/);
  expect(badges.map((badge) => badge.textContent)).toEqual(['Plante', 'Poison']);
  expect(screen.getByText(/seuls les Pokémon de Kanto sont affichés/)).toBeInTheDocument();
  // Une seule génération : pas de filtre par génération, et rien n'est mis en cache.
  expect(screen.queryByRole('group', { name: 'Filtrer par génération' })).not.toBeInTheDocument();
  expect(localStorage.getItem(POKEDEX_CACHE_KEY)).toBeNull();
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

test('filters the grid by generation', async () => {
  const user = userEvent.setup();
  render(<App />);
  await findCards();

  const group = screen.getByRole('group', { name: 'Filtrer par génération' });
  // Seules les générations présentes dans les données sont proposées.
  expect(within(group).getAllByRole('button')).toHaveLength(2);

  await user.click(within(group).getByRole('button', { name: 'Génération VI · Kalos' }));
  await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(1));
  expect(within(screen.getByRole('article')).getByRole('link', { name: 'Nymphali' })).toBeInTheDocument();

  await user.click(within(group).getByRole('button', { name: 'Génération I · Kanto' }));
  await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(3));
});

test('offers the Dark type among the type filters', async () => {
  render(<App />);
  await findCards();
  const group = screen.getByRole('group', { name: /Filtrer par type/ });
  expect(within(group).getByRole('button', { name: 'Ténèbres' })).toBeInTheDocument();
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

test('mounts only a window of cards for a long list', async () => {
  const many = Array.from({ length: 60 }, (_, i) =>
    species(i + 1, `p${i + 1}`, 1, { fr: `Pokémon ${i + 1}`, en: `Pokémon ${i + 1}` }, ['normal'], 5, 50)
  );
  global.fetch = vi.fn((url) => (url === POKEDEX_GRAPHQL_URL ? json({ data: { pokemonspecies: many } }) : json({})));
  render(<App />);

  const cards = await findCards();
  expect(cards.length).toBeGreaterThan(0);
  expect(cards.length).toBeLessThan(60);
  // Le compteur annonce bien la liste entière.
  expect(screen.getByRole('strong')).toHaveTextContent('60 Pokémon');
});

test('loads the moves on demand on a detail page', async () => {
  window.history.pushState({}, '', '/pokemon/700');
  render(<App />);

  expect(await screen.findByRole('heading', { name: 'Nymphali', level: 1 })).toBeInTheDocument();
  expect(await screen.findByText('Vine Whip')).toBeInTheDocument();
  expect(screen.getByText('Tackle')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Capacités (2)' })).toBeInTheDocument();
});
