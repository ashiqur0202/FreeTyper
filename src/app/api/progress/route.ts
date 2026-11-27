import { authConfigured, getAuth } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { parseSyncData } from '@/lib/sync/merge';
import { loadProgress, saveMerged } from '@/lib/sync/store';

// Needs Node (database driver); answers per request for one signed-in person, never cached.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** An account's whole progress is small; anything bigger is not ours. */
const MAX_BODY_BYTES = 1_500_000;

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** Who is asking: the signed-in user's id, or the response to send back instead. */
async function userIdOf(request: Request): Promise<string | Response> {
  if (!authConfigured()) return json({ error: 'accounts_unavailable' }, 503);
  const session = await getAuth().api.getSession({ headers: request.headers });
  return session?.user.id ?? json({ error: 'signed_out' }, 401);
}

export async function GET(request: Request) {
  const who = await userIdOf(request);
  if (typeof who !== 'string') return who;
  try {
    return json(await loadProgress(getDb(), who));
  } catch {
    // Nothing from the request or the data is logged.
    return json({ error: 'server_error' }, 500);
  }
}

export async function PUT(request: Request) {
  const who = await userIdOf(request);
  if (typeof who !== 'string') return who;

  // Only our own pages may save (the cookie is also SameSite=Lax; this is a second lock).
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(process.env.BETTER_AUTH_URL as string).origin) return json({ error: 'bad_origin' }, 403);

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return json({ error: 'too_large' }, 413);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
  const incoming = parseSyncData((body as { data?: unknown } | null)?.data);
  if (!incoming) return json({ error: 'bad_data' }, 400);

  try {
    return json(await saveMerged(getDb(), who, incoming));
  } catch {
    return json({ error: 'server_error' }, 500);
  }
}
