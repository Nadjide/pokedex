import { useEffect, useState } from 'react';

// Devient vrai (définitivement) dès que l'élément approche de la zone visible.
// Sans IntersectionObserver, on considère l'élément visible d'emblée.
export function useInView(ref, rootMargin = '200px') {
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const node = ref.current;
    if (inView || !node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setInView(true);
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, ref, rootMargin]);

  return inView;
}
