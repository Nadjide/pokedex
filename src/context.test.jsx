import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { FavoritesProvider, useFavorites } from './FavoritesContext.jsx';
import { ComparisonProvider, useComparison } from './Comparison/ComparisonContext.jsx';
import { FilterProvider, useFilter } from './components/FilterShield/FilterContext.jsx';

describe('FavoritesContext', () => {
  test('toggles pokemon favorites correctly', () => {
    const wrapper = ({ children }) => <FavoritesProvider>{children}</FavoritesProvider>;
    const { result } = renderHook(() => useFavorites(), { wrapper });

    expect(result.current.isFavorite(1)).toBe(false);

    act(() => {
      result.current.toggleFavorite(1);
    });
    expect(result.current.isFavorite(1)).toBe(true);

    act(() => {
      result.current.toggleFavorite(1);
    });
    expect(result.current.isFavorite(1)).toBe(false);
  });
});

describe('ComparisonContext', () => {
  test('adds and limits comparison to MAX_COMPARE (2)', () => {
    const wrapper = ({ children }) => <ComparisonProvider>{children}</ComparisonProvider>;
    const { result } = renderHook(() => useComparison(), { wrapper });

    const p1 = { id: 1, name: 'Bulbasaur' };
    const p2 = { id: 4, name: 'Charmander' };
    const p3 = { id: 7, name: 'Squirtle' };

    act(() => {
      result.current.toggleComparison(p1);
    });
    expect(result.current.selectedPokemons).toHaveLength(1);

    act(() => {
      result.current.toggleComparison(p2);
    });
    expect(result.current.selectedPokemons).toHaveLength(2);

    // Adding 3rd shifts out the 1st
    act(() => {
      result.current.toggleComparison(p3);
    });
    expect(result.current.selectedPokemons).toHaveLength(2);
    expect(result.current.selectedPokemons[0].id).toBe(4);
    expect(result.current.selectedPokemons[1].id).toBe(7);

    act(() => {
      result.current.clearComparison();
    });
    expect(result.current.selectedPokemons).toHaveLength(0);
  });
});

describe('FilterContext', () => {
  test('toggles type filter and resets properly', () => {
    const wrapper = ({ children }) => <FilterProvider>{children}</FilterProvider>;
    const { result } = renderHook(() => useFilter(), { wrapper });

    act(() => {
      result.current.toggleTypeFilter('grass');
    });
    expect(result.current.activeTypeFilters).toContain('grass');

    act(() => {
      result.current.setSearchTerm('Pikachu');
      result.current.setSortOrder('name-asc');
    });
    expect(result.current.searchTerm).toBe('Pikachu');
    expect(result.current.sortOrder).toBe('name-asc');

    act(() => {
      result.current.clearFilters();
    });
    expect(result.current.activeTypeFilters).toHaveLength(0);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.sortOrder).toBe('id-asc');
  });
});
