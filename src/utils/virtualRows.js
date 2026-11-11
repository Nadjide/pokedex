// Fenêtrage d'une grille par rangées : seules les rangées proches de l'écran
// sont montées, le reste est remplacé par un espace de même hauteur.

// Nombre de colonnes à partir de la valeur calculée de `grid-template-columns`
// (« 201.5px 201.5px 201.5px »). Renvoie null si la valeur n'est pas résolue.
export function parseColumnCount(gridTemplateColumns = '') {
  const tracks = String(gridTemplateColumns).trim().split(/\s+/).filter(Boolean);
  return tracks.length > 0 && tracks.every((track) => /^[\d.]+px$/.test(track)) ? tracks.length : null;
}

// `heights` : Map rangée → hauteur mesurée ; `estimate` vaut pour les autres.
// `viewTop` / `viewBottom` : zone visible, en pixels depuis le haut de la grille.
export function computeVirtualRows({ rowCount, heights, estimate, gap = 0, viewTop, viewBottom, overscan = 0 }) {
  if (rowCount <= 0) return { start: 0, end: 0, paddingTop: 0, paddingBottom: 0 };

  const from = viewTop - overscan;
  const to = viewBottom + overscan;
  let start = -1;
  let end = rowCount;
  let paddingTop = 0;
  let endTop = 0;
  let y = 0;

  for (let row = 0; row < rowCount; row += 1) {
    const height = heights?.get(row) ?? estimate;
    if (start === -1 && y + height > from) {
      start = row;
      paddingTop = y;
    }
    if (start !== -1 && end === rowCount && y >= to) {
      end = row;
      endTop = y;
    }
    y += height + gap;
  }

  // Zone visible au-delà de la fin (liste raccourcie par un filtre) : on garde
  // la dernière rangée, le navigateur ramènera le défilement.
  if (start === -1) {
    const lastHeight = heights?.get(rowCount - 1) ?? estimate;
    return { start: rowCount - 1, end: rowCount, paddingTop: y - gap - lastHeight, paddingBottom: 0 };
  }
  // Toujours au moins une rangée montée, pour pouvoir mesurer.
  if (end <= start) {
    end = start + 1;
    endTop = paddingTop + (heights?.get(start) ?? estimate) + gap;
  }

  return { start, end, paddingTop, paddingBottom: end === rowCount ? 0 : y - endTop };
}
