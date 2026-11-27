// Checks the account tables against Better Auth on an in-memory Postgres (PGlite): no server, no Docker.
// Run: npm run test:accounts
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { eq } from 'drizzle-orm';

process.env.BETTER_AUTH_URL = 'http://localhost:3000';
process.env.BETTER_AUTH_SECRET = 'test-secret-test-secret-test-secret-123456';
process.env.GOOGLE_CLIENT_ID = 'test-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-secret';

const schema = await import('../src/lib/db/schema.ts');
const { createAuth } = await import('../src/lib/auth.ts');

let passed = 0;
const ok = (name) => { passed += 1; console.log('ok  ' + name); };

// Apply every migration in order, exactly as the SQL files say.
const client = new PGlite();
for (const f of readdirSync('drizzle').filter((x) => x.endsWith('.sql')).sort()) {
  for (const stmt of readFileSync('drizzle/' + f, 'utf8').split('--> statement-breakpoint')) {
    if (stmt.trim()) await client.exec(stmt);
  }
}
ok('migrations apply to an empty database');

const db = drizzle(client, { schema });
const auth = createAuth(db);
const ctx = await auth.$context;
const a = ctx.internalAdapter;

// A user, a Google link, a session: the rows Better Auth writes on a Google login.
const u = await a.createUser({ email: 'sam@example.com', name: 'Sam', emailVerified: true });
assert.equal(u.email, 'sam@example.com');
await a.linkAccount({ userId: u.id, providerId: 'google', accountId: 'g-123' });
const s = await a.createSession(u.id);
assert.ok(s.token);
ok('Better Auth writes a user, a Google account and a session');

// The same verified email is one account: finding it by email returns the same user with its link.
const found = await a.findUserByEmail('sam@example.com', { includeAccounts: true });
assert.equal(found.user.id, u.id);
assert.equal(found.accounts.length, 1);
ok('finding the user by email returns the one account with its Google link');

// A second user with the same email is refused by the database itself.
await assert.rejects(() => a.createUser({ email: 'sam@example.com', name: 'Other', emailVerified: true }));
ok('a second account with the same email is refused');

// Our own table: one progress row per user, JSON column keeps its shape.
await db.insert(schema.userProgress).values({ userId: u.id, bestWpm: 62.5, totalTests: 3, data: { sessions: [{ wpm: 62.5 }], schemaVersion: 1 } });
const [p] = await db.select().from(schema.userProgress).where(eq(schema.userProgress.userId, u.id));
assert.equal(p.bestWpm, 62.5);
assert.equal(p.data.sessions[0].wpm, 62.5);
assert.equal(p.version, 0);
await assert.rejects(() => db.insert(schema.userProgress).values({ userId: u.id }));
ok('user_progress keeps the JSON and allows one row per user');

// Deleting the user removes everything that belongs to it.
await a.deleteUser(u.id);
for (const t of ['session', 'account', 'userProgress', 'user']) {
  const rows = await db.select().from(schema[t]);
  assert.equal(rows.length, 0, t + ' should be empty after the user is deleted');
}
ok('deleting a user removes its sessions, links and progress');

console.log(`\n${passed} account database checks passed`);
await client.close();
