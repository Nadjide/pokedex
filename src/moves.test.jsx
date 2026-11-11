import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mapMove } from './api/pokeapi.js';
import { createLimiter } from './utils/limiter.js';
import { countMoveTypes, filterAndSortMoves, getLoadProgress, getMoveDescription, getMoveName } from './utils/moves.js';
import { translations } from './i18n/translations.js';
import { LanguageProvider } from './Langue/LanguageContext.jsx';
import MovesCard from './Page_2/PokemonDetails/MovesCard.jsx';

const lang = (name) => ({ name });

const apiMove = ({ slug, fr, en, type, category, power = null, accuracy = null, pp = 10 }) => ({
  name: slug,
  type: { name: type },
  damage_class: { name: category },
  power,
  accuracy,
  pp,
  names: [
    ...(fr ? [{ name: fr, language: lang('fr') }] : []),
    { name: en, language: lang('en') },
    { name: 'かみなりパンチ', language: lang('ja') },
  ],
  flavor_text_entries: [
    { flavor_text: 'Old\ntext.', language: lang('en') },
    { flavor_text: `Description de\n${en}.`, language: lang('fr') },
    { flavor_text: `Description of\n${en}.`, language: lang('en') },
  ],
});

const THUNDER_PUNCH = { slug: 'thunder-punch', fr: 'Poing Éclair', en: 'Thunder Punch', type: 'electric', category: 'physical', power: 75, accuracy: 100, pp: 15 };

describe('mapMove', () => {
  test('keeps the displayed fields, with the latest text per language', () => {
    expect(mapMove(apiMove(THUNDER_PUNCH), 'thunder-punch')).toEqual({
      slug: 'thunder-punch',
      names: { fr: 'Poing Éclair', en: 'Thunder Punch' },
      type: 'electric',
      category: 'physical',
      power: 75,
      accuracy: 100,
      pp: 15,
      description: { fr: 'Description de Thunder Punch.', en: 'Description of Thunder Punch.' },
    });
  });

  test('leaves missing power and accuracy empty instead of guessing', () => {
    const move = mapMove(apiMove({ slug: 'growl', en: 'Growl', type: 'normal', category: 'status' }));
    expect(move.power).toBeNull();
    expect(move.accuracy).toBeNull();
    expect(move.names).toEqual({ en: 'Growl' });
  });

  test('rejects a payload that is not a move', () => {
    expect(() => mapMove({ stats: [] }, 'tackle')).toThrow();
  });
});

describe('move helpers', () => {
  const entry = (slug, move) => ({ slug, move: move === undefined ? undefined : move && { slug, ...move } });
  const entries = [
    entry('mega-punch', { names: { fr: 'Ultimapoing', en: 'Mega Punch' }, type: 'normal', category: 'physical', power: 80 }),
    entry('thunder-wave', { names: { fr: 'Cage Éclair', en: 'Thunder Wave' }, type: 'electric', category: 'status', power: null }),
    entry('thunderbolt', { names: { fr: 'Tonnerre', en: 'Thunderbolt' }, type: 'electric', category: 'special', power: 90 }),
    entry('thunder-shock', { names: { fr: 'Éclair', en: 'Thunder Shock' }, type: 'electric', category: 'special', power: 40 }),
    entry('surf', null),
  ];
  const slugs = (options) => filterAndSortMoves(entries, options).map((e) => e.slug);

  test('names fall back to English, then to the formatted identifier', () => {
    expect(getMoveName(entries[0], 'fr')).toBe('Ultimapoing');
    expect(getMoveName(entry('new-move', { names: { en: 'New Move' } }), 'fr')).toBe('New Move');
    expect(getMoveName(entry('surf', null), 'fr')).toBe('Surf');
    expect(getMoveDescription({ description: { en: 'Only English.' } }, 'fr')).toBe('Only English.');
    expect(getMoveDescription(null, 'fr')).toBe('');
  });

  test('keeps the dataset order by default without mutating the source', () => {
    const copy = [...entries];
    expect(slugs()).toEqual(['mega-punch', 'thunder-wave', 'thunderbolt', 'thunder-shock', 'surf']);
    filterAndSortMoves(entries, { sort: 'power-desc' });
    expect(entries).toEqual(copy);
  });

  test('searches localized names without accents, in either language', () => {
    expect(slugs({ searchTerm: 'eclair' })).toEqual(['thunder-wave', 'thunder-shock']);
    expect(slugs({ searchTerm: 'THUNDERB', language: 'fr' })).toEqual(['thunderbolt']);
    expect(slugs({ searchTerm: 'sur' })).toEqual(['surf']);
  });

  test('type and category filters drop moves whose details are unknown', () => {
    expect(slugs({ type: 'electric' })).toEqual(['thunder-wave', 'thunderbolt', 'thunder-shock']);
    expect(slugs({ type: 'electric', category: 'special' })).toEqual(['thunderbolt', 'thunder-shock']);
    expect(slugs({ category: 'status' })).toEqual(['thunder-wave']);
  });

  test('sorts by power with powerless moves last, and by localized name', () => {
    expect(slugs({ sort: 'power-desc' })).toEqual(['thunderbolt', 'mega-punch', 'thunder-shock', 'thunder-wave', 'surf']);
    expect(slugs({ sort: 'power-asc' })).toEqual(['thunder-shock', 'mega-punch', 'thunderbolt', 'thunder-wave', 'surf']);
    expect(slugs({ sort: 'name', language: 'fr' })).toEqual(['thunder-wave', 'thunder-shock', 'surf', 'thunderbolt', 'mega-punch']);
  });

  test('counts types in the usual order and reports load progress', () => {
    expect(countMoveTypes(entries)).toEqual([
      { type: 'normal', count: 1 },
      { type: 'electric', count: 3 },
    ]);
    expect(getLoadProgress([...entries, entry('dig', undefined)])).toEqual({ total: 6, settled: 5, failed: 1, done: false });
    expect(getLoadProgress(entries).done).toBe(true);
  });
});

describe('createLimiter', () => {
  const deferred = () => {
    let resolve;
    const promise = new Promise((r) => {
      resolve = r;
    });
    return { promise, resolve };
  };
  const tick = () => new Promise((r) => setTimeout(r, 0));

  test('never runs more than the allowed number of tasks, in arrival order', async () => {
    const limit = createLimiter(2);
    const gates = Array.from({ length: 5 }, deferred);
    const started = [];
    const results = gates.map((gate, index) =>
      limit(() => {
        started.push(index);
        return gate.promise;
      })
    );

    expect(started).toEqual([0, 1]);
    gates[0].resolve('a');
    await tick();
    expect(started).toEqual([0, 1, 2]);
    gates.forEach((gate, index) => gate.resolve(index));
    await Promise.all(results);
    expect(started).toEqual([0, 1, 2, 3, 4]);
  });

  test('a failing task frees its slot and rejects only its own promise', async () => {
    const limit = createLimiter(1);
    const failing = limit(() => {
      throw new Error('boom');
    });
    const following = limit(() => 'ok');

    await expect(failing).rejects.toThrow('boom');
    await expect(following).resolves.toBe('ok');
  });

  test('skips tasks aborted while still queued', async () => {
    const limit = createLimiter(1);
    const gate = deferred();
    const controller = new AbortController();
    const skipped = vi.fn();

    const first = limit(() => gate.promise);
    const queued = limit(skipped, { signal: controller.signal });
    const last = limit(() => 'last');

    controller.abort();
    gate.resolve();
    await first;
    await expect(queued).rejects.toBeDefined();
    await expect(last).resolves.toBe('last');
    expect(skipped).not.toHaveBeenCalled();
  });
});

describe('translations', () => {
  const keysOf = (node, prefix = '') =>
    Object.entries(node).flatMap(([key, value]) =>
      value && typeof value === 'object' ? keysOf(value, `${prefix}${key}.`) : [`${prefix}${key}`]
    );

  test('every key exists in both French and English', () => {
    expect(keysOf(translations.en).sort()).toEqual(keysOf(translations.fr).sort());
  });
});

describe('MovesCard', () => {
  const moveUrls = () => global.fetch.mock.calls.map(([url]) => url).filter((url) => url.includes('/move/'));

  // Les capacités du Pokémon viennent de /pokemon/{id}, leurs détails de /move/{slug}.
  const mockMoves = (catalog, pokemonMoves = []) => {
    global.fetch = vi.fn((url) => {
      if (/\/pokemon\/\d+$/.test(url)) {
        const moves = pokemonMoves.map((name) => ({ move: { name } }));
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ moves }) });
      }
      const slug = url.split('/move/')[1];
      const move = catalog[slug];
      return Promise.resolve(move ? { ok: true, json: () => Promise.resolve(apiMove(move)) } : { ok: false, status: 404 });
    });
  };

  // Un identifiant par test : la liste d'un Pokémon est mise en cache pour la session.
  const renderCard = (pokemonId) =>
    render(
      <LanguageProvider>
        <MovesCard pokemonId={pokemonId} />
      </LanguageProvider>
    );

  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  test('shows localized names with their values, and the English identifier when a move fails', async () => {
    mockMoves({ 'thunder-punch': THUNDER_PUNCH }, ['thunder-punch', 'missing-move']);
    renderCard(9001);

    const row = (await screen.findByText('Poing Éclair')).closest('li');
    expect(row).toHaveTextContent('Électrik');
    expect(row).toHaveTextContent('75');
    expect(row).toHaveTextContent('100 %');

    expect((await screen.findByText('Missing Move')).closest('li')).toHaveTextContent('Indisponible');
    expect(screen.getByText('1 capacité n’a pas pu être chargée.')).toBeInTheDocument();
  });

  test('requests only the visible moves, then the rest when a filter needs them', async () => {
    const user = userEvent.setup();
    const catalog = {};
    const moves = Array.from({ length: 30 }, (_, index) => {
      // Zéro de tête : la liste de l'API est triée par identifiant, l'ordre reste celui des numéros.
      const slug = `test-move-${String(index).padStart(2, '0')}`;
      catalog[slug] = {
        slug,
        fr: `Capacité ${index}`,
        en: `Move ${index}`,
        type: index % 2 ? 'fire' : 'water',
        category: index % 3 ? 'physical' : 'status',
        power: index % 3 ? index : null,
      };
      return slug;
    });
    mockMoves(catalog, moves);
    renderCard(9002);

    await screen.findByText('Capacité 23');
    expect(moveUrls()).toHaveLength(24);
    expect(screen.queryByText('Capacité 24')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Statut' }));
    await screen.findByText('10 capacités sur 30');
    expect(moveUrls()).toHaveLength(30);
    expect(screen.getByText('Capacité 27')).toBeInTheDocument();
    expect(screen.queryByText('Capacité 1')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Statut' }));
    await user.click(screen.getByRole('button', { name: /Trier par/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Puissance décroissante' }));
    await waitFor(() => expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Capacité 29'));
  });
});
