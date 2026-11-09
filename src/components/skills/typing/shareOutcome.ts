export type ShareOutcome = 'shared' | 'cancelled' | 'image-copied' | 'downloaded' | 'text-copied' | 'failed';

/** True when the person closed the share sheet themselves (not an error). */
export function isShareCancel(e: unknown): boolean {
  return e instanceof DOMException && e.name === 'AbortError';
}
