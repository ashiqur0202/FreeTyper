import { toNextJsHandler } from 'better-auth/next-js';
import { authConfigured, getAuth } from '@/lib/auth';

// Needs Node (database driver, crypto); answers per request, never cached.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Login is optional: with no database or keys set, say so and let the site carry on as a guest. */
function unavailable() {
  return Response.json({ error: 'accounts_unavailable' }, { status: 503 });
}

export async function GET(request: Request) {
  if (!authConfigured()) return unavailable();
  return toNextJsHandler(getAuth()).GET(request);
}

export async function POST(request: Request) {
  if (!authConfigured()) return unavailable();
  return toNextJsHandler(getAuth()).POST(request);
}
