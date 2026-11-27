import { notifyProgressUpdated, PROGRESS_UPDATED_EVENT } from '@/lib/progress-events';
import { readLocal, writeLocal } from './local';
import { hasProgress, parseSyncData, summarize, type Summary } from './merge';

/**
 * Keeps a signed-in browser and the account in step. Local first: the site always
 * works from this browser's own data, a sync only adds what the account holds
 * and sends what is new. With no login, no server or no network it does nothing
 * and the site carries on as a guest.
 */

export type SyncResult = 'synced' | 'signed-out' | 'unavailable' | 'offline' | 'error';

let inFlight: Promise<SyncResult> | null = null;

async function run(): Promise<SyncResult> {
  try {
    const res = await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: readLocal() }),
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (res.status === 401) return 'signed-out';
    if (res.status === 503) return 'unavailable';
    if (!res.ok) return 'error';
    // A garbled answer is the server's fault, not the network's.
    const body = (await res.json().catch(() => null)) as { data?: unknown } | null;
    const merged = parseSyncData(body?.data);
    if (!merged) return 'error';
    if (writeLocal(merged)) notifyProgressUpdated();
    return 'synced';
  } catch {
    return 'offline'; // the request itself failed: no network, or the server is down
  }
}

/** One sync at a time: a second call while one is running shares its answer. */
export function syncNow(): Promise<SyncResult> {
  if (!inFlight) inFlight = run().finally(() => { inFlight = null; });
  return inFlight;
}

export interface MergeChoice {
  needed: boolean;
  /** What this browser holds, and what the account holds, as the few numbers the question shows. */
  local: Summary;
  server: Summary;
}

/**
 * Before the first sync of a browser with an account: does the person have to be
 * asked? Only when both sides already hold progress. When one side is empty the
 * other simply fills it, and nothing is ever lost either way.
 */
export async function checkMergeChoice(): Promise<MergeChoice | 'signed-out' | 'unavailable' | 'error'> {
  try {
    const res = await fetch('/api/progress', { credentials: 'same-origin', cache: 'no-store' });
    if (res.status === 401) return 'signed-out';
    if (res.status === 503) return 'unavailable';
    if (!res.ok) return 'error';
    const body = (await res.json().catch(() => null)) as { data?: unknown } | null;
    const server = parseSyncData(body?.data);
    if (!server) return 'error';
    const local = readLocal();
    return { needed: hasProgress(local) && hasProgress(server), local: summarize(local), server: summarize(server) };
  } catch {
    return 'error';
  }
}

const QUIET_MS = 4000; // wait for typing to settle before sending
const RETRY_MS = 60_000; // after a failure, try again in a minute

/**
 * Starts syncing: once now, after progress changes, and when the tab comes back.
 * Returns a function that stops it. Stops for good when the person is signed out.
 */
export function startAutoSync(onResult?: (r: SyncResult) => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;

  const schedule = (ms: number) => {
    if (stopped) return;
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const r = await syncNow();
      if (stopped) return;
      onResult?.(r);
      if (r === 'signed-out' || r === 'unavailable') return; // nothing to retry until the page is opened again
      if (r !== 'synced') schedule(RETRY_MS);
    }, ms);
  };

  const onChange = () => schedule(QUIET_MS);
  const onVisible = () => {
    if (document.visibilityState === 'visible') schedule(500);
  };
  const onOnline = () => schedule(500);

  window.addEventListener(PROGRESS_UPDATED_EVENT, onChange);
  window.addEventListener('online', onOnline);
  document.addEventListener('visibilitychange', onVisible);
  schedule(300);

  return () => {
    stopped = true;
    clearTimeout(timer);
    window.removeEventListener(PROGRESS_UPDATED_EVENT, onChange);
    window.removeEventListener('online', onOnline);
    document.removeEventListener('visibilitychange', onVisible);
  };
}
