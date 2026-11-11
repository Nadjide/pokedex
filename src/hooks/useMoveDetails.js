import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMove, peekMove } from '../api/pokeapi.js';

// Détails PokéAPI des capacités `wanted` (identifiants), chargés à la demande.
// Renvoie `lookup(slug)` : undefined (en attente ou non demandée), null (échec)
// ou les détails. Les capacités déjà vues pendant la session sont immédiates.
export function useMoveDetails(wanted) {
  const [results, setResults] = useState({});
  const [attempt, setAttempt] = useState(0);
  const resultsRef = useRef(results);
  resultsRef.current = results;

  const wantedKey = wanted.join('|');

  useEffect(() => {
    const pending = wantedKey
      ? wantedKey.split('|').filter((slug) => resultsRef.current[slug] === undefined && peekMove(slug) === undefined)
      : [];
    if (pending.length === 0) return undefined;

    const controller = new AbortController();
    pending.forEach((slug) => {
      getMove(slug, { signal: controller.signal }).then(
        (move) => setResults((prev) => ({ ...prev, [slug]: move })),
        () => {
          // Requête retirée de la file (liste changée, page quittée) : pas un échec.
          if (!controller.signal.aborted) setResults((prev) => ({ ...prev, [slug]: null }));
        }
      );
    });

    return () => controller.abort();
  }, [wantedKey, attempt]);

  const lookup = useCallback((slug) => (results[slug] !== undefined ? results[slug] : peekMove(slug)), [results]);

  // Oublie les échecs pour les redemander.
  const retry = useCallback(() => {
    setResults((prev) => Object.fromEntries(Object.entries(prev).filter(([, move]) => move !== null)));
    setAttempt((n) => n + 1);
  }, []);

  return useMemo(() => ({ lookup, retry }), [lookup, retry]);
}
