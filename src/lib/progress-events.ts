/**
 * Tells other parts of the page (the sidebar practice card) that saved progress
 * changed. Storage events only fire in other tabs, so the tab that saved needs
 * its own signal. It is sent on the next tick so it never triggers a state
 * update while React is still rendering another component.
 */
export const PROGRESS_UPDATED_EVENT = 'freetyper-progress-updated';

export function notifyProgressUpdated() {
  if (typeof window === 'undefined') return;
  setTimeout(() => window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT)), 0);
}
