import { useCallback, useEffect, useLayoutEffect, useReducer, useRef } from 'react';
import { computeVirtualRows, parseColumnCount } from '../utils/virtualRows.js';

const DEFAULT_ROW_HEIGHT = 300;
// Marge montée au-dessus et au-dessous de l'écran, pour ne jamais voir de vide.
const OVERSCAN_PX = 800;

// Dernière géométrie connue, gardée le temps d'une visite sur une fiche : au
// retour, la grille retrouve exactement la même hauteur, donc le même défilement.
let savedLayout = null;

const viewportHeight = () => (typeof window !== 'undefined' ? window.innerHeight : 800);

const createLayout = (resetKey, initialScrollY) => {
  const reuse = savedLayout && savedLayout.resetKey === resetKey ? savedLayout : null;
  const top = (initialScrollY || 0) - (reuse ? reuse.gridTop : 0);
  return {
    resetKey,
    columns: reuse ? reuse.columns : 1,
    gap: reuse ? reuse.gap : 0,
    estimate: reuse ? reuse.estimate : DEFAULT_ROW_HEIGHT,
    heights: reuse ? new Map(reuse.heights) : new Map(),
    gridTop: reuse ? reuse.gridTop : 0,
    viewTop: top,
    viewBottom: top + viewportHeight(),
  };
};

// Fenêtrage par rangées d'une grille CSS qui défile avec la page. La grille
// garde sa mise en page responsive : le nombre de colonnes et la hauteur des
// rangées sont lus dans le DOM, rien n'est dupliqué ici.
//
// `resetKey` identifie le contenu (filtres, tri, langue) : quand il change, les
// hauteurs mesurées sont oubliées. `initialScrollY` est le défilement que la
// page va restaurer juste après le montage.
export function useVirtualGrid({ itemCount, resetKey, initialScrollY = 0 }) {
  const gridRef = useRef(null);
  const layoutRef = useRef(null);
  if (layoutRef.current === null) layoutRef.current = createLayout(resetKey, initialScrollY);
  const layout = layoutRef.current;
  const [, rerender] = useReducer((n) => n + 1, 0);

  if (layout.resetKey !== resetKey) {
    layout.resetKey = resetKey;
    layout.heights = new Map();
  }

  const computeRange = () => {
    const rows = computeVirtualRows({
      rowCount: Math.ceil(itemCount / layout.columns),
      heights: layout.heights,
      estimate: layout.estimate,
      gap: layout.gap,
      viewTop: layout.viewTop,
      viewBottom: layout.viewBottom,
      overscan: OVERSCAN_PX,
    });
    return { ...rows, columns: layout.columns };
  };

  const range = computeRange();
  const renderedRef = useRef(range);
  renderedRef.current = range;
  const computeRangeRef = useRef(computeRange);
  computeRangeRef.current = computeRange;

  // Relit la géométrie réelle puis redemande un rendu si la fenêtre a bougé.
  const sync = useCallback(({ readScroll = true } = {}) => {
    const grid = gridRef.current;
    const state = layoutRef.current;
    if (!grid) return;

    const style = window.getComputedStyle(grid);
    const columns = parseColumnCount(style.gridTemplateColumns) || 1;
    const gap = parseFloat(style.rowGap) || 0;
    if (columns !== state.columns) {
      // La largeur des cartes change avec le nombre de colonnes, donc leur hauteur.
      state.columns = columns;
      state.heights = new Map();
    }
    state.gap = gap;

    const rendered = renderedRef.current;
    if (rendered.columns === columns) {
      // Les cartes d'une rangée sont étirées à la même hauteur : la première suffit.
      for (let i = 0; i < grid.children.length; i += columns) {
        const height = grid.children[i].offsetHeight;
        if (height > 0) state.heights.set(rendered.start + i / columns, height);
      }
      if (state.heights.size > 0) {
        let sum = 0;
        state.heights.forEach((height) => {
          sum += height;
        });
        state.estimate = sum / state.heights.size;
      }
    }

    if (readScroll) {
      const rect = grid.getBoundingClientRect();
      state.gridTop = rect.top + window.scrollY;
      state.viewTop = -rect.top;
      state.viewBottom = -rect.top + viewportHeight();
    }

    const next = computeRangeRef.current();
    if (
      next.start !== rendered.start ||
      next.end !== rendered.end ||
      next.columns !== rendered.columns ||
      Math.abs(next.paddingTop - rendered.paddingTop) > 0.5 ||
      Math.abs(next.paddingBottom - rendered.paddingBottom) > 0.5
    ) {
      rerender();
    }
  }, []);

  // Après chaque rendu, avant l'affichage : mesure des rangées montées. Au tout
  // premier passage, on ne lit pas le défilement : la page ne l'a pas encore
  // restauré (l'effet du parent s'exécute après celui-ci).
  const mountedRef = useRef(false);
  useLayoutEffect(() => {
    sync({ readScroll: mountedRef.current });
    mountedRef.current = true;
  });

  useEffect(() => {
    let frame = 0;
    let timer = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      frame = 0;
      timer = 0;
      sync();
    };
    // Une synchronisation par image au plus. La minuterie prend le relais quand
    // le navigateur suspend les images (fenêtre masquée ou recouverte).
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(run);
      timer = setTimeout(run, 150);
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    if (observer && gridRef.current) observer.observe(gridRef.current);
    // Le chargement des polices peut modifier la hauteur des cartes.
    document.fonts?.ready?.then(schedule).catch(() => {});

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer?.disconnect();
      const state = layoutRef.current;
      savedLayout = {
        resetKey: state.resetKey,
        columns: state.columns,
        gap: state.gap,
        estimate: state.estimate,
        heights: state.heights,
        gridTop: state.gridTop,
      };
    };
  }, [sync]);

  return { gridRef, ...range };
}
