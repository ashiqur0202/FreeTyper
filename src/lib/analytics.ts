/**
 * Small wrapper around Google Analytics 4 custom events.
 *
 * Privacy rules for every event sent from here:
 * - never send what the user typed, only numbers (WPM, accuracy, duration, score)
 *   and short labels from a fixed list (text mode, category, game name);
 * - no ids, no free text.
 *
 * gtag is loaded in app/layout.tsx. If it is missing (blocked, offline, tests),
 * trackEvent silently does nothing.
 */

type EventParams = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;
  try {
    window.gtag?.('event', name, params);
  } catch {
    /* analytics must never break the app */
  }
}
