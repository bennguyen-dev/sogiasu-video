// Recharts animates on its own clock unless the browser asks for reduced motion; a frame must
// show the chart for exactly the data it was given, so the render always asks.
if (typeof window !== "undefined" && window.matchMedia && !(window as { __reducedMotion?: boolean }).__reducedMotion) {
  (window as { __reducedMotion?: boolean }).__reducedMotion = true;
  const real = window.matchMedia.bind(window);
  window.matchMedia = (query: string) => {
    if (!query.includes("prefers-reduced-motion: reduce")) return real(query);
    // a plain stand-in: MediaQueryList's matches is a read-only getter
    return {
      matches: true,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    } as MediaQueryList;
  };
}
