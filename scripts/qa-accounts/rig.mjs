// QA rig for accounts (see README.md in this folder): an in-memory Postgres that speaks the real wire
// protocol (so the real `pg` driver and the real built server can use it), migrated with the real
// migrations, with four users (sam, alex, carol, dave) and valid signed login cookies.
// Keeps running until killed. Writes .qa-rig.json (throwaway tokens for this in-memory database only).
// Run from the repo root: node --import ./scripts/register-ts.mjs scripts/qa-accounts/rig.mjs
import { writeFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
process.chdir(resolve(dirname(fileURLToPath(import.meta.url)), '../..'));
const PORT = Number(process.env.RIG_DB_PORT || 54329);
const SITE = process.env.RIG_SITE || 'http://localhost:3120';
process.env.BETTER_AUTH_URL = SITE;
process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || 'qa-rig-secret-qa-rig-secret-qa-rig-secret-123';
process.env.GOOGLE_CLIENT_ID = 'qa';
process.env.GOOGLE_CLIENT_SECRET = 'qa';
process.env.NODE_ENV = 'production';

const schema = await import('../../src/lib/db/schema.ts');
const { createAuth } = await import('../../src/lib/auth.ts');
const { serializeSignedCookie } = await import('better-call');

const client = await PGlite.create();
const db = drizzle(client, { schema });
await migrate(db, { migrationsFolder: 'drizzle' });

const server = new PGLiteSocketServer({ db: client, port: PORT, host: '127.0.0.1', maxConnections: 8 });
await server.start();

const auth = createAuth(db);
const ctx = await auth.$context;
const out = { dbUrl: `postgres://postgres:postgres@127.0.0.1:${PORT}/postgres`, cookieName: ctx.authCookies.sessionToken.name, users: {} };
for (const [key, email, name] of [['sam', 'sam@example.com', 'Sam'], ['alex', 'alex@example.com', 'Alex'], ['carol', 'carol@example.com', 'Carol'], ['dave', 'dave@example.com', 'Dave']]) {
  const user = await ctx.internalAdapter.createUser({ email, name, emailVerified: true });
  await ctx.internalAdapter.linkAccount({ userId: user.id, providerId: 'google', accountId: 'g-' + key });
  const session = await ctx.internalAdapter.createSession(user.id);
  const header = await serializeSignedCookie(ctx.authCookies.sessionToken.name, session.token, ctx.secret, {});
  out.users[key] = { id: user.id, email, cookie: header.split(';')[0] };
}
writeFileSync(process.env.RIG_OUT || '.qa-rig.json', JSON.stringify(out, null, 2));
console.log('rig ready on ' + PORT);
setInterval(() => {}, 1 << 30);
