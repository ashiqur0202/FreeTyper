// Run: npm run test:sync-store (in-memory Postgres, no server, no Docker)
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { eq } from 'drizzle-orm';

const schema = await import('../src/lib/db/schema.ts');
const { loadProgress, saveMerged, deleteProgress } = await import('../src/lib/sync/store.ts');
const { emptySyncData } = await import('../src/lib/sync/merge.ts');

let n = 0;
const t = async (name, fn) => { await fn(); n++; console.log('ok -', name); };

const client = new PGlite();
for (const f of readdirSync('drizzle').filter((x) => x.endsWith('.sql')).sort()) {
  for (const stmt of readFileSync('drizzle/' + f, 'utf8').split('--> statement-breakpoint')) if (stmt.trim()) await client.exec(stmt);
}
const db = drizzle(client, { schema });
const addUser = async (id) => db.insert(schema.user).values({ id, name: id, email: id + '@example.com', emailVerified: true });
await addUser('u1');
await addUser('u2');

const session = (id, date, wpm) => ({ id, date, wpm, accuracy: 95, correctChars: 250, incorrectChars: 5, totalChars: 255, duration: 60, mode: 'speed-test' });
const device = (id, date, wpm, over = {}) => ({
  ...emptySyncData(),
  progress: { sessions: [session(id, date, wpm)], achievements: [], keyStats: {}, streak: { current: 1, best: 1, lastPracticeDate: '2026-11-2' + (date % 8) }, totalTypingTime: 60, wordsTyped: 50, bestWpm: wpm, bestAccuracy: 95, ...over },
});
const row = async (id) => (await db.select().from(schema.userProgress).where(eq(schema.userProgress.userId, id)))[0];

await t('a new account has no progress yet: empty data, version 0', async () => {
  const r = await loadProgress(db, 'u1');
  assert.equal(r.version, 0);
  assert.deepEqual(r.data, emptySyncData());
});
await t('first save from a device: stored, version 1, summary columns filled', async () => {
  const r = await saveMerged(db, 'u1', device('p1', 1000, 62));
  assert.equal(r.version, 1);
  assert.equal(r.data.progress.sessions.length, 1);
  const x = await row('u1');
  assert.equal(x.version, 1);
  assert.equal(x.bestWpm, 62);
  assert.equal(x.totalTests, 1);
  assert.equal(x.schemaVersion, 1);
});
await t('saving the same thing again changes nothing: the version stays', async () => {
  const r = await saveMerged(db, 'u1', device('p1', 1000, 62));
  assert.equal(r.version, 1);
  assert.equal((await row('u1')).version, 1);
});
await t('a second device adds to the account instead of replacing it', async () => {
  const r = await saveMerged(db, 'u1', device('l1', 2000, 71));
  assert.equal(r.version, 2);
  assert.deepEqual(r.data.progress.sessions.map((s) => s.id), ['p1', 'l1']);
  const x = await row('u1');
  assert.equal(x.bestWpm, 71);
  assert.equal(x.totalTests, 2);
});
await t('the account answers a load with the combined progress', async () => {
  const r = await loadProgress(db, 'u1');
  assert.equal(r.version, 2);
  assert.equal(r.data.progress.bestWpm, 71);
});
await t('six devices saving at the same moment all keep their changes', async () => {
  await Promise.all(Array.from({ length: 6 }, (_, i) => saveMerged(db, 'u1', device('d' + i, 3000 + i, 40 + i))));
  const r = await loadProgress(db, 'u1');
  const ids = r.data.progress.sessions.map((s) => s.id).sort();
  assert.deepEqual(ids, ['d0', 'd1', 'd2', 'd3', 'd4', 'd5', 'l1', 'p1']);
  assert.equal((await row('u1')).totalTests, 8);
});
await t('accounts are separate: another user sees none of it', async () => {
  const r = await loadProgress(db, 'u2');
  assert.deepEqual(r.data, emptySyncData());
  await saveMerged(db, 'u2', device('z1', 9000, 30));
  assert.equal((await loadProgress(db, 'u1')).data.progress.sessions.some((s) => s.id === 'z1'), false);
});
await t('unreadable stored data is treated as empty and the next save repairs it', async () => {
  await db.update(schema.userProgress).set({ data: { schemaVersion: 99, junk: true } }).where(eq(schema.userProgress.userId, 'u2'));
  assert.deepEqual((await loadProgress(db, 'u2')).data, emptySyncData());
  const r = await saveMerged(db, 'u2', device('z2', 9500, 33));
  assert.equal(r.data.progress.sessions.length, 1);
});
await t('reset: removes only this account\'s saved progress, the account stays, and a later save starts clean', async () => {
  await deleteProgress(db, 'u2');
  assert.equal((await db.select().from(schema.userProgress).where(eq(schema.userProgress.userId, 'u2'))).length, 0);
  assert.equal((await db.select().from(schema.user).where(eq(schema.user.id, 'u2'))).length, 1);
  assert.equal((await db.select().from(schema.userProgress).where(eq(schema.userProgress.userId, 'u1'))).length, 1, 'another account is untouched');
  assert.deepEqual((await loadProgress(db, 'u2')).data, emptySyncData());
  const r = await saveMerged(db, 'u2', device('z3', 9800, 36));
  assert.deepEqual(r.data.progress.sessions.map((s) => s.id), ['z3']);
  await deleteProgress(db, 'nobody'); // a missing row is not an error
});
await t('deleting the account removes its progress', async () => {
  await db.delete(schema.user).where(eq(schema.user.id, 'u1'));
  assert.equal((await db.select().from(schema.userProgress).where(eq(schema.userProgress.userId, 'u1'))).length, 0);
  assert.equal((await db.select().from(schema.userProgress)).length, 1);
});

console.log(`\n${n} passed`);
await client.close();
