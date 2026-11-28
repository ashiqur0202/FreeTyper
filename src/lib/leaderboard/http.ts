import { authConfigured, getAuth } from '@/lib/auth';
import { dbReady, getDb } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { PERIODS, TEXT_MODES, TOP_SIZES, type Period } from './rules';
import type { BoardFilters } from './store';

/** Small helpers shared by the leaderboard routes. Nothing here logs a request, a name or a score. */

export const json = (body: unknown, status = 200, cache = 'no-store') =>
  Response.json(body, { status, headers: { 'Cache-Control': cache } });

export interface SessionUser { id: string; name: string }

/** Who is asking (a logged-in person), or the response to send back. Makes sure the tables exist first. */
export async function sessionUser(request: Request): Promise<SessionUser | Response> {
  if (!authConfigured()) return json({ error: 'accounts_unavailable' }, 503);
  await dbReady();
  try {
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (session) return { id: session.user.id, name: session.user.name };
    return (await databaseAnswers(request)) ? json({ error: 'signed_out' }, 401) : json({ error: 'server_error' }, 500);
  } catch {
    return json({ error: 'server_error' }, 500);
  }
}

/**
 * The login library answers "no session" both when there really is none and when the database
 * did not answer. A browser that holds a login cookie must not be told it is signed out because
 * of a database hiccup (it would forget it is logged in), so ask the database once before saying so.
 */
export async function databaseAnswers(request: Request): Promise<boolean> {
  if (!(request.headers.get('cookie') ?? '').includes('session_token')) return true; // no cookie: signed out for sure
  try {
    await getDb().execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}

/** Only our own pages may change data (the cookie is also SameSite=Lax; this is a second lock). */
export function ownOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  return !!origin && origin === new URL(process.env.BETTER_AUTH_URL as string).origin;
}

/** A small JSON body (they are all a few hundred bytes); anything bigger is not ours. */
export async function smallJson(request: Request, maxBytes = 4000): Promise<unknown | Response> {
  const text = await request.text();
  if (text.length > maxBytes) return json({ error: 'too_large' }, 413);
  try {
    return JSON.parse(text);
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
}

const LENGTHS = [15, 30, 60, 120, 180, 300, 600] as const;

/** Reads ?period=&top=&length=&mode= with safe defaults (daily, top 10, all lengths, all types). */
export function boardFilters(url: URL): BoardFilters {
  const q = url.searchParams;
  const period = PERIODS.find((p) => p === q.get('period')) ?? ('daily' as Period);
  const top = TOP_SIZES.find((t) => String(t) === q.get('top')) ?? 10;
  const length = LENGTHS.find((l) => String(l) === q.get('length')) ?? null;
  const mode = TEXT_MODES.find((m) => m === q.get('mode')) ?? null;
  return { period, top, length, mode };
}
