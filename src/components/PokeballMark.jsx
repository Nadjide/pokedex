import React from 'react';

// Logo en couleur (en-tête) ou filigrane monochrome (`outline`), qui suit
// alors la couleur du texte courant.
export default function PokeballMark({ size = 32, outline = false, style, ...props }) {
  if (outline) {
    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        aria-hidden="true"
        style={style}
        {...props}
      >
        <circle cx="50" cy="50" r="44" />
        <path d="M6 50h27M67 50h27" />
        <circle cx="50" cy="50" r="15" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" style={style} {...props}>
      <circle cx="16" cy="16" r="15" fill="#ffffff" />
      <path d="M1 16A15 15 0 0 1 31 16Z" fill="#ff4b5c" />
      <rect x="1" y="14.4" width="30" height="3.2" fill="#15171f" />
      <circle cx="16" cy="16" r="15" fill="none" stroke="#15171f" strokeWidth="2" />
      <circle cx="16" cy="16" r="4.6" fill="#ffffff" stroke="#15171f" strokeWidth="2.6" />
    </svg>
  );
}
