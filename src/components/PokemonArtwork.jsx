import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { getArtworkUrl, getSpriteUrl } from '../utils/pokemon.js';

// Le chargement différé natif précharge très large (≈ 50 illustrations HD, soit
// plusieurs Mo, dès l'arrivée sur la liste). Un observateur partagé ne déclenche
// le téléchargement qu'à l'approche de l'écran.
const canObserve = typeof IntersectionObserver !== 'undefined';
const pendingCallbacks = new WeakMap();
let sharedObserver = null;

const observeNearViewport = (element, onNear) => {
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          pendingCallbacks.get(entry.target)?.();
          pendingCallbacks.delete(entry.target);
          sharedObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '500px 200px' }
    );
  }
  pendingCallbacks.set(element, onNear);
  sharedObserver.observe(element);

  return () => {
    pendingCallbacks.delete(element);
    sharedObserver.unobserve(element);
  };
};

// Illustration officielle HD avec repli sur le sprite d'origine si elle est
// indisponible, et apparition en fondu une fois chargée.
export default function PokemonArtwork({ pokemon, alt = '', shiny = false, loading = 'lazy', className, sx }) {
  const variantKey = `${pokemon.id}${shiny ? '-shiny' : ''}`;
  const [failedKey, setFailedKey] = useState(null);
  const [loadedSrc, setLoadedSrc] = useState(null);
  const [nearViewport, setNearViewport] = useState(loading === 'eager' || !canObserve);
  const imgRef = useRef(null);

  const failed = failedKey === variantKey;
  const src = failed ? pokemon.image || getSpriteUrl(pokemon.id) : getArtworkUrl(pokemon.id, { shiny });

  useEffect(() => {
    if (nearViewport || !imgRef.current) return undefined;
    return observeNearViewport(imgRef.current, () => setNearViewport(true));
  }, [nearViewport]);

  // Image déjà en cache : l'événement `load` a pu partir avant l'écoute.
  useEffect(() => {
    const img = imgRef.current;
    if (nearViewport && img && img.complete && img.naturalWidth > 0) setLoadedSrc(src);
  }, [src, nearViewport]);

  return (
    <Box
      component="img"
      ref={imgRef}
      src={nearViewport ? src : undefined}
      alt={alt}
      decoding="async"
      draggable={false}
      className={className}
      onLoad={() => setLoadedSrc(src)}
      onError={() => {
        if (!failed) setFailedKey(variantKey);
      }}
      sx={{
        display: 'block',
        aspectRatio: '1 / 1',
        objectFit: 'contain',
        opacity: loadedSrc === src ? 1 : 0,
        transition: 'opacity 0.35s ease, transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)',
        imageRendering: failed ? 'pixelated' : 'auto',
        userSelect: 'none',
        ...sx,
      }}
    />
  );
}
