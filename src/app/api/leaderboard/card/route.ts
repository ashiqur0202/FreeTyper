import { getDb } from '@/lib/db';
import { json, sessionUser } from '@/lib/leaderboard/http';
import { cardRanks } from '@/lib/leaderboard/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** The result popup's rank block: your place on the Daily, Weekly and Lifetime boards, with the typists next to you. Never cached. */
export async function GET(request: Request) {
  const who = await sessionUser(request);
  if (who instanceof Response) return who;
  try {
    return json(await cardRanks(getDb(), who.id));
  } catch {
    return json({ error: 'server_error' }, 500);
  }
}
