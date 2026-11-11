import React from 'react';
import { act, render, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { TeamProvider, useTeam } from './TeamContext.jsx';

const pokemon = (id, fr, types) => ({
  id,
  height: 10,
  weight: 100,
  image: `https://example.test/${id}.png`,
  // Le jeu de données réel liste les types en ordre inverse
  types: [...types].reverse(),
  moves: [],
  names: { fr, en: fr },
});

const mockPokemons = [
  pokemon(3, 'Florizarre', ['grass', 'poison']),
  pokemon(6, 'Dracaufeu', ['fire', 'flying']),
  pokemon(9, 'Tortank', ['water']),
  pokemon(12, 'Papilusion', ['bug', 'flying']),
  pokemon(18, 'Roucarnage', ['normal', 'flying']),
  pokemon(25, 'Pikachu', ['electric']),
  pokemon(149, 'Dracolosse', ['dragon', 'flying']),
];

const BASE_STATS = {
  3: [80, 82, 83, 100, 100, 80],
  6: [78, 84, 78, 109, 85, 100],
  9: [79, 83, 100, 85, 105, 78],
};
const STAT_NAMES = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

beforeEach(() => {
  localStorage.clear();
  window.history.pushState({}, '', '/');

  global.fetch = vi.fn((url) => {
    const json = (data) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
    if (url.includes('pokemons.json')) return json(mockPokemons);
    if (url.includes('types.json')) return json({});

    const match = url.match(/\/pokemon\/(\d+)$/);
    const values = match && BASE_STATS[match[1]];
    if (values) {
      return json({ stats: values.map((base_stat, index) => ({ base_stat, stat: { name: STAT_NAMES[index] } })) });
    }
    return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const openTeam = (search = '') => {
  window.history.pushState({}, '', `/team${search}`);
  return render(<App />);
};
const findSlots = async () => within(await screen.findByRole('list', { name: 'Membres de l’équipe' }));
const memberNames = (slots) => slots.queryAllByRole('heading', { level: 3 }).map((node) => node.textContent);

describe('TeamContext', () => {
  const wrapper = ({ children }) => <TeamProvider>{children}</TeamProvider>;

  test('adds, removes and never goes past six members', () => {
    const { result } = renderHook(() => useTeam(), { wrapper });

    act(() => [1, 4, 7, 25, 6, 9].forEach((id) => result.current.addToTeam(id)));
    expect(result.current.team).toEqual([1, 4, 7, 25, 6, 9]);
    expect(result.current.isFull).toBe(true);

    act(() => result.current.toggleTeamMember(150));
    expect(result.current.team).toHaveLength(6);
    expect(result.current.isInTeam(150)).toBe(false);

    act(() => result.current.toggleTeamMember(4));
    expect(result.current.team).toEqual([1, 7, 25, 6, 9]);
    expect(result.current.isFull).toBe(false);
  });

  test('persists the team and restores it on the next visit', () => {
    const first = renderHook(() => useTeam(), { wrapper });
    act(() => first.result.current.setTeam([6, 9, 3]));
    expect(JSON.parse(localStorage.getItem('team'))).toEqual([6, 9, 3]);
    first.unmount();

    const second = renderHook(() => useTeam(), { wrapper });
    expect(second.result.current.team).toEqual([6, 9, 3]);
  });

  test('ignores corrupted storage', () => {
    localStorage.setItem('team', '{not json');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useTeam(), { wrapper });
    expect(result.current.team).toEqual([]);
  });
});

describe('team builder', () => {
  test('adds Pokémon from the cards, counts them in the header and shows them on the team page', async () => {
    const user = userEvent.setup();
    render(<App />);
    const cards = await screen.findAllByRole('article');

    await user.click(within(cards[1]).getByRole('button', { name: 'Ajouter à l’équipe' }));
    await user.click(within(cards[2]).getByRole('button', { name: 'Ajouter à l’équipe' }));
    expect(within(cards[1]).getByRole('button', { name: 'Retirer de l’équipe' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('link', { name: 'Mon équipe (2/6)' }));

    const slots = await findSlots();
    expect(memberNames(slots)).toEqual(['Dracaufeu', 'Tortank']);
    expect(slots.getAllByRole('listitem')).toHaveLength(6);
    expect(slots.getAllByRole('link', { name: /Emplacement \d libre/ })).toHaveLength(4);
  });

  test('blocks a seventh member with a clear “team full” state', async () => {
    localStorage.setItem('team', JSON.stringify([3, 6, 9, 12, 18, 25]));
    const user = userEvent.setup();
    render(<App />);
    const cards = await screen.findAllByRole('article');

    const blocked = within(cards[6]).getByRole('button', { name: /Équipe complète \(6\/6\)/ });
    expect(blocked).toHaveAttribute('aria-disabled', 'true');
    await user.click(blocked);

    expect(JSON.parse(localStorage.getItem('team'))).toEqual([3, 6, 9, 12, 18, 25]);
    expect(screen.getByRole('link', { name: 'Mon équipe (6/6)' })).toBeInTheDocument();
  });

  test('analyses the reference team: Dracaufeu, Tortank, Florizarre', async () => {
    localStorage.setItem('team', JSON.stringify([6, 9, 3]));
    openTeam();
    await findSlots();

    const table = within(screen.getByRole('table'));
    const cells = (type) =>
      within(table.getByRole('rowheader', { name: type }).closest('tr'))
        .getAllByRole('cell')
        .map((cell) => parseInt(cell.textContent, 10));

    expect(table.getAllByRole('rowheader')).toHaveLength(18);
    expect(cells('Électrik')).toEqual([2, 1, 0]);
    expect(cells('Sol')).toEqual([0, 0, 1]);
    expect(cells('Roche')).toEqual([1, 0, 0]);
    expect(table.getByText(/Dracaufeu ×4/)).toBeInTheDocument();

    expect(screen.getByText('Aucune faiblesse n’est partagée par 3 membres ou plus.')).toBeInTheDocument();
    const unresisted = screen.getByRole('heading', { name: /Aucune résistance/ }).parentElement;
    expect(within(unresisted).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Normal', 'Poison', 'Vol', 'Psy', 'Roche', 'Spectre', 'Dragon', 'Ténèbres',
    ]);

    // 534 + 530 + 525
    expect(await screen.findByText('1589')).toBeInTheDocument();
    // Moyenne : 529,67 arrondi
    expect(screen.getByText('Moyenne par Pokémon').nextElementSibling).toHaveTextContent('530');
    expect(screen.getByText('Total de l’équipe').nextElementSibling).toHaveTextContent('1589');
  });

  test('highlights weaknesses shared by three members or more', async () => {
    localStorage.setItem('team', JSON.stringify([6, 12, 18, 149]));
    openTeam();
    await findSlots();

    const shared = screen.getByRole('heading', { name: /Faiblesses partagées/ }).parentElement;
    expect(within(shared).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'Roche4 membres',
      'Électrik3 membres',
      'Glace3 membres',
    ]);
  });

  test('does not invent stats when PokéAPI has none for a member', async () => {
    localStorage.setItem('team', JSON.stringify([6, 25]));
    openTeam();
    await findSlots();

    expect(await screen.findByText(/Statistiques indisponibles pour 1 membre/)).toBeInTheDocument();
    expect(screen.getAllByText('534').length).toBeGreaterThan(0);
  });

  test('removes a member, can undo it, and keeps the team after a reload', async () => {
    localStorage.setItem('team', JSON.stringify([6, 9, 3]));
    const user = userEvent.setup();
    const view = openTeam();
    let slots = await findSlots();

    await user.click(slots.getByRole('button', { name: 'Retirer Tortank de l’équipe' }));
    expect(memberNames(slots)).toEqual(['Dracaufeu', 'Florizarre']);
    // Le focus passe à l'emplacement qui a pris la place
    expect(slots.getByRole('button', { name: 'Retirer Florizarre de l’équipe' })).toHaveFocus();
    expect(screen.getByText('Tortank a quitté l’équipe.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(memberNames(slots)).toEqual(['Dracaufeu', 'Tortank', 'Florizarre']);

    await user.click(slots.getByRole('button', { name: 'Retirer Dracaufeu de l’équipe' }));
    view.unmount();

    openTeam();
    slots = await findSlots();
    expect(memberNames(slots)).toEqual(['Tortank', 'Florizarre']);
  });

  test('copies a shareable link that encodes the team', async () => {
    localStorage.setItem('team', JSON.stringify([6, 9, 3]));
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    openTeam();
    await findSlots();

    await user.click(screen.getByRole('button', { name: 'Copier le lien' }));

    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/team?p=6,9,3`);
    expect(await screen.findByRole('button', { name: 'Lien copié' })).toBeInTheDocument();
  });

  test('shows the link for manual copy when the clipboard is refused', async () => {
    localStorage.setItem('team', JSON.stringify([6, 9]));
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));
    openTeam();
    await findSlots();

    await user.click(screen.getByRole('button', { name: 'Copier le lien' }));

    expect(await screen.findByRole('textbox', { name: 'Lien de partage de l’équipe' })).toHaveValue(
      `${window.location.origin}/team?p=6,9`
    );
  });

  test('loads a shared link into an empty team and saves it', async () => {
    openTeam('?p=6,9,3');
    const slots = await findSlots();

    await waitFor(() => expect(memberNames(slots)).toEqual(['Dracaufeu', 'Tortank', 'Florizarre']));
    await waitFor(() => expect(JSON.parse(localStorage.getItem('team'))).toEqual([6, 9, 3]));
    expect(window.location.search).toBe('');
  });

  test('previews a shared link without overwriting an existing team', async () => {
    localStorage.setItem('team', JSON.stringify([25]));
    const user = userEvent.setup();
    openTeam('?p=6,9,999');
    const slots = await findSlots();

    // 999 est inconnu du Pokédex : ignoré
    expect(memberNames(slots)).toEqual(['Dracaufeu', 'Tortank']);
    expect(screen.getByRole('heading', { level: 1, name: 'Équipe partagée' })).toBeInTheDocument();
    expect(slots.queryByRole('button', { name: /Retirer/ })).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('team'))).toEqual([25]);

    await user.click(screen.getByRole('button', { name: 'Remplacer mon équipe' }));

    await waitFor(() => expect(JSON.parse(localStorage.getItem('team'))).toEqual([6, 9]));
    expect(screen.getByRole('heading', { level: 1, name: 'Mon équipe' })).toBeInTheDocument();
    expect(window.location.search).toBe('');
  });

  test('keeps the current team when the shared link is declined or invalid', async () => {
    localStorage.setItem('team', JSON.stringify([25]));
    const user = userEvent.setup();
    const view = openTeam('?p=6,9');
    await findSlots();

    await user.click(screen.getByRole('button', { name: 'Garder mon équipe' }));
    expect(memberNames(await findSlots())).toEqual(['Pikachu']);
    view.unmount();

    openTeam('?p=abc,999');
    expect(await screen.findByText('Ce lien d’équipe ne contient aucun Pokémon reconnu.')).toBeInTheDocument();
    expect(memberNames(await findSlots())).toEqual(['Pikachu']);
  });

  test('offers the team builder in English too', async () => {
    localStorage.setItem('pokedex-language', 'en');
    openTeam();

    expect(await screen.findByRole('heading', { level: 1, name: 'My team' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Your team is empty' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Slot \d is empty/ })).toHaveLength(6);
  });
});
