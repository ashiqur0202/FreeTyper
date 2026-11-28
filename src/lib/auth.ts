import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { getDb } from './db';
import { markTypistDeleted, type LbDb } from './leaderboard/store';
import * as schema from './db/schema';

/**
 * Optional login. Guest mode never depends on any of this: when the settings
 * are missing the account routes answer "unavailable" and the site works as it
 * always did. The auth object is built on first use, never at import or build.
 *
 * Login methods: Google now; email code and magic link come in a later release.
 * No password login.
 */

export { authConfigured } from './auth-config';

/** The database handed to the auth adapter: the real one in the app, an in-memory Postgres in tests/test-accounts-db.mjs. */
type AuthDb = Parameters<typeof drizzleAdapter>[0];

/** Google's sign-in tokens are only needed to learn who you are, so they are never kept (the privacy page says so). */
const NO_TOKENS = { accessToken: null, refreshToken: null, idToken: null, accessTokenExpiresAt: null, refreshTokenExpiresAt: null };

export function createAuth(db: AuthDb) {
  const baseURL = process.env.BETTER_AUTH_URL as string;
  return betterAuth({
    baseURL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [baseURL],
    database: drizzleAdapter(db, { provider: 'pg', schema }),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    // The same verified email from two methods is one account, never two.
    account: { accountLinking: { enabled: true, trustedProviders: ['google'] } },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    advanced: {
      useSecureCookies: process.env.NODE_ENV === 'production',
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax' },
    },
    databaseHooks: {
      user: {
        delete: {
          // The leaderboard keeps the username and scores (marked deleted); everything else of theirs goes with the user row.
          before: async (u) => {
            try {
              await markTypistDeleted(db as unknown as LbDb, u.id);
            } catch {
              // Not fatal: with no user link left the entry reads as deleted anyway.
            }
          },
        },
      },
      account: {
        create: { before: async (account) => ({ data: { ...account, ...NO_TOKENS } }) },
        update: { before: async (account) => ({ data: { ...account, ...NO_TOKENS } }) },
      },
    },
    // Delete account: removes the user and, through the database, their sessions and saved progress.
    user: { deleteUser: { enabled: true } },
    // Must stay last: it lets server actions set cookies.
    plugins: [nextCookies()],
  });
}

let instance: ReturnType<typeof createAuth> | null = null;

export function getAuth() {
  if (!instance) instance = createAuth(getDb());
  return instance;
}
