import { authConfigured } from '@/lib/auth';
import { dbReady, getDb } from '@/lib/db';
import { boardFilters, json } from '@/lib/leaderboard/http';
import { leaderboard } from '@/lib/leaderboard/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The public board: ?period=daily|weekly|monthly|lifetime &top=10|50 &length=SECONDS &mode=TEXT_TYPE.
 * Open to everyone, no login. Each person once, with their best counted score in the window.
 * Only usernames, speeds and labels go out; the Google name only for active accounts.
 */
export async function GET(request: Request) {
  if (!authConfigured()) return json({ error: 'accounts_unavailable' }, 503);
  await dbReady();
  const f = boardFilters(new URL(request.url));
  try {
    const entries = await leaderboard(getDb(), f);
    // A short cache: the same board is asked for by many people, and 30 seconds of delay does not matter.
    return json({ period: f.period, top: f.top, length: f.length, mode: f.mode, entries, generatedAt: new Date().toISOString() }, 200, 'public, max-age=15, s-maxage=30, stale-while-revalidate=60');
  } catch {
    return json({ error: 'server_error' }, 500);
  }
}
