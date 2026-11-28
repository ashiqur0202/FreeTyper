// Run: npm run test:leaderboard-store (in-memory Postgres, no server, no Docker)
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { eq } from 'drizzle-orm';

const schema = await import('../src/lib/db/schema.ts');
const S = await import('../src/lib/leaderboard/store.ts');

let n = 0;
const t = async (name, fn) => { await fn(); n++; console.log('ok -', name); };

const client = new PGlite();
for (const f of readdirSync('drizzle').filter((x) => x.endsWith('.sql')).sort()) {
  for (const stmt of readFileSync('drizzle/' + f, 'utf8').split('--> statement-breakpoint')) if (stmt.trim()) await client.exec(stmt);
}
const db = drizzle(client, { schema });

const NOW = new Date(Date.UTC(2026, 10, 25, 13, 0)); // Wednesday 25 Nov 2026, 13:00 UTC
const at = (days, hours = 0) => new Date(NOW.getTime() - days * 86_400_000 - hours * 3_600_000);
const user = async (id, name) => { await db.insert(schema.user).values({ id, name, email: id + '@example.com', emailVerified: true }); return { id, name }; };
const input = (over = {}) => ({ runId: 'run-' + Math.random().toString(36).slice(2), wpm: 60, accuracy: 97, seconds: 60, textMode: 'standard', textLevel: 3, ...over });
// Put a score straight in the table at a chosen time (the rules about timing apply to submitScore, not to this).
const put = async (typistId, over = {}) => {
  const s = input(over);
  await db.insert(schema.score).values({ id: 'sc-' + Math.random().toString(36).slice(2), typistId, runId: s.runId, wpm: s.wpm, accuracy: s.accuracy, seconds: s.seconds, textMode: s.textMode, textLevel: s.textLevel, hidden: over.hidden ?? false, createdAt: over.createdAt ?? NOW });
};
const board = (over = {}) => S.leaderboard(db, { period: 'lifetime', top: 10, length: null, mode: null, now: NOW, ...over });

await t('a typist is made on first use with a username from the Google name; asking again gives the same one', async () => {
  const u = await user('u1', 'Sam Kowalski');
  const a = await S.ensureTypist(db, u);
  assert.equal(a.username, 'samkowalski');
  assert.equal(a.status, 'active');
  assert.equal(a.userId, 'u1');
  assert.equal((await S.ensureTypist(db, u)).id, a.id);
  assert.equal((await db.select().from(schema.typist)).length, 1);
});
await t('two people with the same name get different usernames; capital letters do not make them different', async () => {
  const b = await S.ensureTypist(db, await user('u2', 'Sam Kowalski'));
  assert.notEqual(b.username, 'samkowalski');
  assert.match(b.username, /^samkowalski\d{4}$/);
  const c = await S.ensureTypist(db, await user('u3', 'SAM KOWALSKI'));
  assert.match(c.username, /^samkowalski\d{4}$/);
  assert.notEqual(c.username, b.username);
});
await t('two requests at once for a new person make one typist, not two', async () => {
  const u = await user('u4', 'Race Condition');
  const [x, y, z] = await Promise.all([S.ensureTypist(db, u), S.ensureTypist(db, u), S.ensureTypist(db, u)]);
  assert.equal(x.id, y.id);
  assert.equal(y.id, z.id);
  assert.equal((await db.select().from(schema.typist).where(eq(schema.typist.userId, 'u4'))).length, 1);
});
await t('changing a username: valid ones work, bad and reserved ones are refused, taken ones are refused whatever the case', async () => {
  const u1 = { id: 'u1', name: 'Sam Kowalski' };
  assert.equal((await S.setUsername(db, u1, 'Sam_K')).typist.username, 'sam_k');
  assert.equal((await S.setUsername(db, u1, 'sam_k')).ok, true, 'keeping your own name is fine');
  assert.equal((await S.setUsername(db, u1, 'a')).reason, 'bad_username');
  assert.equal((await S.setUsername(db, u1, 'Admin')).reason, 'reserved');
  assert.equal((await S.setUsername(db, u1, 'bad name')).reason, 'bad_username');
  const u2 = { id: 'u2', name: 'Sam Kowalski' };
  assert.equal((await S.setUsername(db, u2, 'SAM_K')).reason, 'taken');
  assert.equal((await S.setUsername(db, u2, 'maya.t')).ok, true);
  assert.equal((await S.getTypist(db, 'u1')).username, 'sam_k');
});

await t('submitting a score: counted, then the same run again is a duplicate, then a different run counts', async () => {
  const u = await user('s1', 'Score One');
  const first = input({ runId: 'same-run' });
  assert.deepEqual(await S.submitScore(db, u, first, at(0, 1)), { status: 'counted' });
  assert.deepEqual(await S.submitScore(db, u, first, at(0, 0.5)), { status: 'duplicate' });
  assert.deepEqual(await S.submitScore(db, u, input({ wpm: 70 }), at(0, 0.2)), { status: 'counted' });
  assert.equal((await db.select().from(schema.score)).filter((r) => r.runId === 'same-run').length, 1);
});
await t('the same run sent again straight away is a duplicate (not "too fast")', async () => {
  const u = await user('s5', 'Retry Typist');
  const run = input({ runId: 'retry-me' });
  assert.deepEqual(await S.submitScore(db, u, run, at(0, 4)), { status: 'counted' });
  assert.deepEqual(await S.submitScore(db, u, run, new Date(at(0, 4).getTime() + 500)), { status: 'duplicate' });
  assert.deepEqual(await S.submitScore(db, u, { ...run, wpm: 150 }, new Date(at(0, 4).getTime() + 900)), { status: 'duplicate' }, 'a retry with a different speed cannot replace the first');
});
await t('below 95 percent accuracy is ignored; impossible input is rejected with a reason; neither is stored', async () => {
  const u = { id: 's1', name: 'Score One' };
  const before = (await db.select().from(schema.score)).length;
  assert.deepEqual(await S.submitScore(db, u, input({ accuracy: 94.9 }), NOW), { status: 'ignored', reason: 'below_accuracy' });
  assert.equal((await S.submitScore(db, u, input({ wpm: 400 }), NOW)).reason, 'implausible');
  assert.equal((await S.submitScore(db, u, input({ seconds: 5 }), NOW)).reason, 'bad_length');
  assert.equal((await S.submitScore(db, u, input({ textMode: 'number_row_digits' }), NOW)).status, 'rejected');
  assert.equal((await S.submitScore(db, u, null, NOW)).status, 'rejected');
  assert.equal((await db.select().from(schema.score)).length, before);
});
await t('timing: two 60 s runs cannot arrive 10 s apart (a run takes time), but can arrive a minute apart', async () => {
  const u = await user('s2', 'Timing Typist');
  assert.equal((await S.submitScore(db, u, input(), at(0, 3))).status, 'counted');
  assert.equal((await S.submitScore(db, u, input(), new Date(at(0, 3).getTime() + 10_000))).reason, 'too_fast');
  assert.equal((await S.submitScore(db, u, input(), new Date(at(0, 3).getTime() + 60_000))).status, 'counted');
});
await t('a burst of submissions at the same instant: only the first can count (each run takes time), nobody waits, none fails', async () => {
  const u = await user('s4', 'Burst Typist');
  const results = await Promise.all(Array.from({ length: 12 }, () => S.submitScore(db, u, input(), at(0, 5))));
  assert.equal(results.filter((r) => r.status === 'counted').length, 1);
  assert.equal(results.filter((r) => r.status === 'rejected' && (r.reason === 'too_fast' || r.reason === 'busy')).length, 11);
  const me = await S.getTypist(db, 's4');
  assert.equal((await db.select().from(schema.score).where(eq(schema.score.typistId, me.id))).length, 1);
});
await t('rate limit: after 120 scores in an hour the next one is refused', async () => {
  const u = await user('s3', 'Busy Typist');
  const me = await S.ensureTypist(db, u);
  for (let i = 0; i < 120; i++) await put(me.id, { wpm: 50, createdAt: new Date(NOW.getTime() - (3_000_000 - i * 1000) ) });
  assert.equal((await S.submitScore(db, u, input({ seconds: 15 }), NOW)).reason, 'rate_limited');
});

// ---- boards: a fixed cast with scores at chosen times
const cast = {};
for (const [id, name] of [['b1', 'Ada Weber'], ['b2', 'Ravi Patel'], ['b3', 'Nora Kaplan'], ['b4', 'Jun Park'], ['b5', 'Leo Martins']]) {
  cast[id] = await S.ensureTypist(db, await user(id, name));
}
await put(cast.b1.id, { wpm: 100, createdAt: at(0, 2) });                       // today
await put(cast.b1.id, { wpm: 140, createdAt: at(60) });                          // long ago (lifetime best)
await put(cast.b2.id, { wpm: 90, createdAt: at(1, 1) });                         // Tuesday (this week)
await put(cast.b3.id, { wpm: 95, createdAt: at(3) });                            // Sunday 22 Nov: last week, this month
await put(cast.b4.id, { wpm: 80, createdAt: at(15) });                           // 10 Nov: this month, not this week
await put(cast.b5.id, { wpm: 70, createdAt: at(40) });                           // last month
await put(cast.b3.id, { wpm: 99, createdAt: at(0, 1), seconds: 180, textMode: 'sentences', textLevel: 4 });  // today, 3 min sentences

await t('daily: only today, best per person, fastest first', async () => {
  const b = await board({ period: 'daily' });
  const mine = b.filter((e) => e.name === 'Ada Weber' || e.name === 'Nora Kaplan');
  assert.deepEqual(mine.map((e) => [e.name, e.wpm]), [['Ada Weber', 100], ['Nora Kaplan', 99]]);
  assert.ok(mine[0].rank < mine[1].rank, 'the faster one is ranked higher');
  assert.ok(!b.some((e) => ['Ravi Patel', 'Jun Park', 'Leo Martins'].includes(e.name)), 'nobody whose scores are older than today');
  const wpms = b.map((e) => e.wpm);
  assert.deepEqual(wpms, [...wpms].sort((x, y) => y - x), 'sorted fastest first');
});
await t('weekly: Monday to now (UTC): Tuesday counts, last Sunday does not', async () => {
  const b = await board({ period: 'weekly' });
  const who = (nm) => b.find((e) => e.name === nm);
  assert.equal(who('Ravi Patel')?.wpm, 90);
  assert.equal(who('Ada Weber')?.wpm, 100);
  assert.equal(who('Nora Kaplan')?.wpm, 99, 'her best this week is the 99 from today, not the 95 from Sunday');
  assert.equal(who('Jun Park'), undefined);
  assert.equal(who('Leo Martins'), undefined);
});
await t('monthly: from the 1st: includes the 10th and last Sunday, not last month', async () => {
  const b = await board({ period: 'monthly' });
  const who = (nm) => b.find((e) => e.name === nm);
  assert.equal(who('Jun Park')?.wpm, 80);
  assert.equal(who('Ravi Patel')?.wpm, 90);
  assert.equal(who('Ada Weber')?.wpm, 100);
  assert.equal(who('Leo Martins'), undefined);
});
await t('lifetime: everything; each person once with their best (Ada 140 beats her 100 today)', async () => {
  const b = await board({ period: 'lifetime' });
  const ada = b.filter((e) => e.name === 'Ada Weber');
  assert.equal(ada.length, 1);
  assert.equal(ada[0].wpm, 140);
  assert.equal(ada[0].rank, 1);
  assert.equal(b.find((e) => e.name === 'Leo Martins')?.wpm, 70);
  const ranks = b.map((e) => e.rank);
  assert.deepEqual(ranks, [...ranks].sort((x, y) => x - y));
  assert.deepEqual(ranks, ranks.map((_, i) => i + 1));
});
await t('filters: by test length and by text type', async () => {
  const three = await board({ period: 'lifetime', length: 180 });
  assert.deepEqual(three.map((e) => [e.name, e.wpm]), [['Nora Kaplan', 99]]);
  const sent = await board({ period: 'lifetime', mode: 'sentences' });
  assert.deepEqual(sent.map((e) => e.name), ['Nora Kaplan']);
  assert.equal((await board({ period: 'lifetime', length: 180, mode: 'quotes' })).length, 0);
  assert.equal(three[0].seconds, 180);
  assert.equal(three[0].textMode, 'sentences');
  assert.equal(three[0].textLevel, 4);
});
await t('top 10: never more than asked; ties go to whoever got there first', async () => {
  for (let i = 0; i < 12; i++) {
    const m = await S.ensureTypist(db, await user('t' + i, 'Tied Typist ' + i));
    await put(m.id, { wpm: 50, createdAt: new Date(NOW.getTime() - (100 - i) * 1000), seconds: 30, textMode: 'words', textLevel: 2 });
  }
  const b = await board({ period: 'daily', top: 10, length: 30 });
  assert.equal(b.length, 10);
  assert.deepEqual(b.map((e) => e.username), Array.from({ length: 10 }, (_, i) => b[i].username));
  const order = b.map((e) => e.name);
  assert.equal(order[0], 'Tied Typist 0', 'the earliest of the tied scores is first');
  assert.equal((await board({ period: 'daily', top: 50, length: 30 })).length, 12);
});
await t('a hidden score is on no board; the next best of that person shows instead', async () => {
  const m = await S.ensureTypist(db, await user('h1', 'Hidden Hero'));
  await put(m.id, { wpm: 200, hidden: true, createdAt: at(0, 1), seconds: 45 });
  await put(m.id, { wpm: 61, createdAt: at(0, 2), seconds: 45 });
  const b = await board({ period: 'daily', length: 45 });
  assert.deepEqual(b.map((e) => [e.name, e.wpm]), [['Hidden Hero', 61]]);
});
await t('my position: my rank on a board, or nothing when I have no counted score there', async () => {
  const me = await S.myPosition(db, 'b3', { period: 'daily', top: 10, length: null, mode: null, now: NOW });
  assert.equal(me.name, 'Nora Kaplan');
  assert.equal(me.wpm, 99);
  assert.ok(me.rank >= 1);
  assert.equal(await S.myPosition(db, 'b5', { period: 'daily', top: 10, length: null, mode: null, now: NOW }), null);
  assert.equal(await S.myPosition(db, 'nobody', { period: 'lifetime', top: 10, length: null, mode: null, now: NOW }), null);
});

await t('an active entry shows the Google name; the typist row is the public identity', async () => {
  const b = await board({ period: 'lifetime' });
  const ada = b.find((e) => e.username === cast.b1.username);
  assert.equal(ada.name, 'Ada Weber');
  assert.equal(ada.deleted, false);
});
await t('DELETING AN ACCOUNT: scores and username stay (marked deleted) and the data of that person is archived, sessions go, the public board shows none of it', async () => {
  const typistId = cast.b1.id;
  await db.insert(schema.account).values({ id: 'ac1', accountId: 'g-b1', providerId: 'google', userId: 'b1' });
  await db.insert(schema.session).values({ id: 'se1', token: 'tok-b1', expiresAt: new Date(NOW.getTime() + 1e9), userId: 'b1' });
  await db.insert(schema.userProgress).values({ userId: 'b1', bestWpm: 140, data: { schemaVersion: 1 } });
  const scoresBefore = (await db.select().from(schema.score).where(eq(schema.score.typistId, typistId))).length;
  assert.equal(scoresBefore, 2);

  await S.markTypistDeleted(db, 'b1', NOW);
  await db.delete(schema.user).where(eq(schema.user.id, 'b1')); // what Better Auth does after the hook

  const [row] = await db.select().from(schema.typist).where(eq(schema.typist.id, typistId));
  assert.equal(row.status, 'deleted');
  assert.equal(row.userId, null);
  assert.equal(row.deletedAt.toISOString(), NOW.toISOString());
  assert.equal((await db.select().from(schema.score).where(eq(schema.score.typistId, typistId))).length, 2, 'scores kept');
  for (const [table, col] of [[schema.account, schema.account.userId], [schema.session, schema.session.userId], [schema.userProgress, schema.userProgress.userId]]) {
    assert.equal((await db.select().from(table).where(eq(col, 'b1'))).length, 0, 'live rows removed');
  }
  assert.equal(row.archive.email, 'b1@example.com', 'email archived');
  assert.equal(row.archive.name, 'Ada Weber', 'name archived');
  assert.deepEqual(row.archive.logins, [{ providerId: 'google', accountId: 'g-b1' }], 'Google link archived');
  assert.equal(row.archive.progress.bestWpm, 140, 'saved progress archived');
  assert.ok(!JSON.stringify(row.archive).includes('tok-b1'), 'no session token kept');
  assert.equal((await db.select().from(schema.user).where(eq(schema.user.id, 'b1'))).length, 0);

  const b = await board({ period: 'lifetime' });
  const entry = b.find((e) => e.username === row.username);
  assert.ok(entry, 'still on the board');
  assert.equal(entry.deleted, true);
  assert.equal(entry.name, null, 'no name once deleted');
  assert.equal(entry.wpm, 140);
  assert.equal(entry.rank, 1, 'still ranked');
  assert.ok(!JSON.stringify(b).includes('Ada Weber'), 'the name is nowhere in the board data');
  assert.ok(!JSON.stringify(b).includes('b1@example.com'), 'nor the email');
});
await t('even if the status update were missed, no user link still means deleted (the database clears it)', async () => {
  const m = await S.ensureTypist(db, await user('x9', 'Quiet Leaver'));
  await put(m.id, { wpm: 88, createdAt: at(0, 1), seconds: 77 });
  await db.delete(schema.user).where(eq(schema.user.id, 'x9')); // no markTypistDeleted call
  const b = await board({ period: 'daily', length: 77 });
  assert.equal(b[0].deleted, true);
  assert.equal(b[0].name, null);
});
await t('a deleted person\'s username stays reserved: nobody else can take it', async () => {
  const [row] = await db.select().from(schema.typist).where(eq(schema.typist.id, cast.b1.id));
  const other = { id: 'u2', name: 'Sam Kowalski' };
  assert.equal((await S.setUsername(db, other, row.username)).reason, 'taken');
});

await t('reports: stored for a real score; unknown score and empty reason refused; ten a day at most', async () => {
  const reporter = await user('rp1', 'Reporter');
  const [target] = await db.select().from(schema.score).limit(1);
  assert.deepEqual(await S.reportScore(db, reporter, target.id, 'looks impossible', NOW), { ok: true });
  assert.equal((await S.reportScore(db, reporter, 'no-such-score', 'x', NOW)).reason, 'not_found');
  assert.equal((await S.reportScore(db, reporter, target.id, '   ', NOW)).reason, 'bad_input');
  assert.equal((await S.reportScore(db, reporter, 5, 'x', NOW)).reason, 'bad_input');
  for (let i = 0; i < 9; i++) assert.equal((await S.reportScore(db, reporter, target.id, 'again ' + i, NOW)).ok, true);
  assert.equal((await S.reportScore(db, reporter, target.id, 'one too many', NOW)).reason, 'rate_limited');
  const rows = await db.select().from(schema.scoreReport);
  assert.equal(rows.length, 10);
});
await t('deleting a reporter keeps the report (the link just clears)', async () => {
  await S.markTypistDeleted(db, 'rp1', NOW);
  await db.delete(schema.user).where(eq(schema.user.id, 'rp1'));
  const rows = await db.select().from(schema.scoreReport);
  assert.equal(rows.length, 10);
  assert.ok(rows.every((r) => r.reporterTypistId !== null), 'the typist row still exists, so the link stays');
});

console.log(`\n${n} passed`);
await client.close();
