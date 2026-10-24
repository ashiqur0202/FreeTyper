'use client';

import { useEffect } from 'react';

/**
 * Makes the browser-tab icon blink like the logo's cursor and follow the accent from Settings.
 * It swaps the tab icon between two inline SVGs (stem on / stem off) every 500 ms.
 * Only this visitor's tab changes: the static /favicon.svg, /favicon.ico and the home-screen icons
 * stay gold and still, which is what search engines and bookmarks see.
 * Skipped for visitors who ask for reduced motion.
 */
function iconSvg(accent: string, stem: boolean) {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    `<rect x="3.5" y="3.5" width="57" height="57" rx="14" fill="#1a1812" stroke="${accent}" stroke-width="3"/>` +
    `<path d="M10 16H54V25H19V30H30V37H19V48H10Z" fill="${accent}"/>` +
    (stem ? '<rect x="38.5" y="25" width="9" height="23" rx="1" fill="#f7f1d6"/>' : '') +
    '</svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export default function FaviconBlink() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let stem = true;
    const tick = () => {
      const accent =
        getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#e2b714';
      // One icon link only, so the browser cannot pick the static .ico over the blinking one.
      const links = document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]');
      let link = Array.from(links).find((l) => l.type === 'image/svg+xml') ?? links[0];
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      links.forEach((l) => {
        if (l !== link) l.remove();
      });
      link.type = 'image/svg+xml';
      link.setAttribute('sizes', 'any');
      link.href = iconSvg(accent, stem);
      stem = !stem;
    };

    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, []);

  return null;
}
