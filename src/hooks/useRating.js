import { useCallback, useSyncExternalStore } from 'react';

// Notes personnelles (0–5) stockées dans localStorage sous `rating-<id>`.
// Un petit store partagé garde la carte et la fiche détail synchronisées.
const listeners = new Set();
const cache = new Map();

const storageKey = (id) => `rating-${id}`;

const readRating = (id) => {
  if (!cache.has(id)) {
    let value = 0;
    try {
      value = Number(localStorage.getItem(storageKey(id))) || 0;
    } catch (e) {
      // localStorage indisponible
    }
    cache.set(id, value);
  }
  return cache.get(id);
};

const writeRating = (id, value) => {
  const next = Number(value) || 0;
  cache.set(id, next);
  try {
    if (next > 0) localStorage.setItem(storageKey(id), String(next));
    else localStorage.removeItem(storageKey(id));
  } catch (e) {
    // ignore
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useRating(id) {
  const rating = useSyncExternalStore(
    subscribe,
    () => readRating(id),
    () => 0
  );
  const setRating = useCallback((value) => writeRating(id, value), [id]);
  return [rating, setRating];
}
