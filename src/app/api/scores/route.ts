import { getDb } from '@/lib/db';
import { json, ownOrigin, sessionUser, smallJson } from '@/lib/leaderboard/http';
import { submitScore } from '@/lib/leaderboard/store';

// Needs Node (database driver); answers per request for one signed-in person, never cached.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * A finished speed test, sent by the browser right after the run when a person is logged in.
 * Only numbers and labels: speed, accuracy, length, text type and level. Never typed text.
 * Impossible scores are refused and submissions are rate limited (see src/lib/leaderboard/rules.ts).
 */
export async function POST(request: Request) {
  const who = await sessionUser(request);
  if (who instanceof Response) return who;
  if (!ownOrigin(request)) return json({ error: 'bad_origin' }, 403);
  const body = await smallJson(request);
  if (body instanceof Response) return body;
  try {
    const result = await submitScore(getDb(), who, body);
    // A refused score is the browser's problem to ignore: it is told why in one short word, nothing more.
    return json(result, result.status === 'rejected' ? 422 : 200);
  } catch {
    return json({ error: 'server_error' }, 500);
  }
}
