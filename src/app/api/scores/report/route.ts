import { getDb } from '@/lib/db';
import { json, ownOrigin, sessionUser, smallJson } from '@/lib/leaderboard/http';
import { reportScore } from '@/lib/leaderboard/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** "Report this entry": a logged-in person says why a score looks wrong. Ten a day at most; looked at by hand. */
export async function POST(request: Request) {
  const who = await sessionUser(request);
  if (who instanceof Response) return who;
  if (!ownOrigin(request)) return json({ error: 'bad_origin' }, 403);
  const body = await smallJson(request);
  if (body instanceof Response) return body;
  const b = (typeof body === 'object' && body !== null ? body : {}) as { scoreId?: unknown; reason?: unknown };
  try {
    const result = await reportScore(getDb(), who, b.scoreId, b.reason);
    return result.ok ? json({ ok: true }) : json({ error: result.reason }, result.reason === 'rate_limited' ? 429 : result.reason === 'not_found' ? 404 : 400);
  } catch {
    return json({ error: 'server_error' }, 500);
  }
}
