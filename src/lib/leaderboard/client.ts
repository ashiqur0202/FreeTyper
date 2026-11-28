import { getAccountSnapshot, parseAccount } from '@/lib/sync/account-state';
import { BOARD_MIN_SECONDS, MIN_ACCURACY } from './rules';
import type { CardRanks } from './store';

/**
 * Sends a finished speed test to the leaderboard when someone is logged in, then asks where it ranks.
 * Never throws and never blocks the test: a guest, a server that is down or a refused score only changes
 * what the result popup shows. Only numbers and labels leave the browser, never the typed text.
 */
export interface FinishedRun {
  runId: string;
  wpm: number;
  accuracy: number;
  seconds: number;
  textMode: string;
  textLevel: number;
}

/** What the result popup shows about the leaderboard for one run. */
export type RunRank =
  | { kind: 'none' } // not a leaderboard test at all (the number row test)
  | { kind: 'guest' }
  | { kind: 'short' }
  | { kind: 'acc' }
  | { kind: 'loading' }
  | { kind: 'unavailable' }
  | { kind: 'ranked'; scoreId: string | null; ranks: CardRanks; username: string };

export const isLoggedIn = () => !!parseAccount(getAccountSnapshot());

/** What can be said about a run before anything is sent: a guest, too short, or too many mistakes (or null: send it). */
export function rankVerdict(run: FinishedRun, loggedIn: boolean): RunRank | null {
  if (!loggedIn) return { kind: 'guest' };
  if (run.seconds < BOARD_MIN_SECONDS) return { kind: 'short' };
  if (run.accuracy < MIN_ACCURACY) return { kind: 'acc' };
  return null;
}

const post = (url: string, body: unknown) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin',
    cache: 'no-store',
    keepalive: true,
  });

/** Sends the run, then loads the rank block. Resolves to what the popup should show. */
export async function submitRun(run: FinishedRun): Promise<RunRank> {
  const early = rankVerdict(run, isLoggedIn());
  if (early) return early;
  try {
    const res = await post('/api/scores', run);
    const sent = (await res.json().catch(() => null)) as { status?: string; scoreId?: string } | null;
    if (!res.ok || !sent || (sent.status !== 'counted' && sent.status !== 'duplicate')) return { kind: 'unavailable' };
    const cardRes = await fetch('/api/leaderboard/card', { credentials: 'same-origin', cache: 'no-store' });
    if (!cardRes.ok) return { kind: 'unavailable' };
    const ranks = (await cardRes.json()) as CardRanks;
    const me = (ranks.today ?? ranks.week ?? ranks.all)?.rows.find((r) => r.me);
    if (!me) return { kind: 'unavailable' };
    return { kind: 'ranked', scoreId: sent.scoreId ?? null, ranks, username: me.username };
  } catch {
    return { kind: 'unavailable' };
  }
}
