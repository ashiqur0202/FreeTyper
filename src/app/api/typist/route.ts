import { getDb } from '@/lib/db';
import { json, ownOrigin, sessionUser, smallJson } from '@/lib/leaderboard/http';
import { ensureTypist, setUsername } from '@/lib/leaderboard/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** The logged-in person's public identity on the leaderboard: just the username (made from their name the first time). */
export async function GET(request: Request) {
  const who = await sessionUser(request);
  if (who instanceof Response) return who;
  try {
    const me = await ensureTypist(getDb(), who);
    return json({ username: me.username, name: who.name });
  } catch {
    return json({ error: 'server_error' }, 500);
  }
}

/** Change the username: 3 to 20 letters, digits, dot, dash or underscore; unique whatever the capital letters. */
export async function PUT(request: Request) {
  const who = await sessionUser(request);
  if (who instanceof Response) return who;
  if (!ownOrigin(request)) return json({ error: 'bad_origin' }, 403);
  const body = await smallJson(request, 500);
  if (body instanceof Response) return body;
  try {
    const result = await setUsername(getDb(), who, (body as { username?: unknown } | null)?.username);
    return result.ok ? json({ username: result.typist.username }) : json({ error: result.reason }, result.reason === 'taken' ? 409 : 400);
  } catch {
    return json({ error: 'server_error' }, 500);
  }
}
