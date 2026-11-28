import { getDb } from '@/lib/db';
import { boardFilters, json, sessionUser } from '@/lib/leaderboard/http';
import { myPosition } from '@/lib/leaderboard/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Where the logged-in person stands on a board (same query as the public board), or null when they have no counted score there. */
export async function GET(request: Request) {
  const who = await sessionUser(request);
  if (who instanceof Response) return who;
  try {
    return json({ position: await myPosition(getDb(), who.id, boardFilters(new URL(request.url))) });
  } catch {
    return json({ error: 'server_error' }, 500);
  }
}
