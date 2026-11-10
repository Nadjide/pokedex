import '@testing-library/jest-dom';

// Polyfills for jsdom environment
if (typeof window !== 'undefined') {
  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      };
    };

  // ResizeObserver mock
  window.ResizeObserver =
    window.ResizeObserver ||
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

  // jsdom n'implémente pas le défilement de la fenêtre
  window.scrollTo = () => {};
}
