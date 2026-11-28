import { getAccountSnapshot, parseAccount } from '@/lib/sync/account-state';

/**
 * Sends a finished speed test to the leaderboard when someone is logged in. Fire and forget:
 * a guest, a server that is down or a refused score never shows anything to the typist and
 * never stops the test from finishing. Only numbers and labels leave the browser, never text.
 */
export interface FinishedRun {
  runId: string;
  wpm: number;
  accuracy: number;
  seconds: number;
  textMode: string;
  textLevel: number;
}

export function submitScoreIfLoggedIn(run: FinishedRun): void {
  try {
    if (!parseAccount(getAccountSnapshot())) return; // a guest: nothing to send, no request made
    void fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(run),
      credentials: 'same-origin',
      cache: 'no-store',
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* never in the way of the test */
  }
}
