// Run: npm run test:leaderboard-rules
import assert from 'node:assert/strict';
import { checkScore, countsForBoard, timingPossible, checkUsername, suggestUsername, periodStart, MAX_WPM } from '../src/lib/leaderboard/rules.ts';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };
const good = { runId: 'r1', wpm: 72.46, accuracy: 96.44, seconds: 60, textMode: 'standard', textLevel: 3 };

t('a normal score is accepted and rounded to one decimal', () => {
  const r = checkScore(good);
  assert.equal(r.ok, true);
  assert.deepEqual(r.value, { runId: 'r1', wpm: 72.5, accuracy: 96.4, seconds: 60, textMode: 'standard', textLevel: 3 });
});
t('every text type and the daily and challenge runs are accepted', () => {
  for (const m of ['standard', 'words', 'sentences', 'quotes', 'facts', 'code', 'mixed', 'daily', 'challenge']) assert.equal(checkScore({ ...good, textMode: m, textLevel: m === 'code' || m === 'daily' ? 0 : 3 }).ok, true, m);
});
t('the number row test and unknown types are refused', () => {
  assert.equal(checkScore({ ...good, textMode: 'number_row_digits' }).ok, false);
  assert.equal(checkScore({ ...good, textMode: 'hack' }).ok, false);
});
t('impossible speeds are refused (zero, negative, above the ceiling, not a number)', () => {
  assert.equal(checkScore({ ...good, wpm: MAX_WPM }).ok, true);
  assert.equal(checkScore({ ...good, wpm: MAX_WPM + 0.1 }).reason, 'implausible');
  assert.equal(checkScore({ ...good, wpm: 0 }).reason, 'implausible');
  assert.equal(checkScore({ ...good, wpm: -5 }).reason, 'implausible');
  assert.equal(checkScore({ ...good, wpm: 'fast' }).reason, 'bad_input');
  assert.equal(checkScore({ ...good, wpm: Infinity }).reason, 'bad_input');
  assert.equal(checkScore({ ...good, wpm: NaN }).reason, 'bad_input');
});
t('lengths: 15 s to 30 min whole seconds only', () => {
  assert.equal(checkScore({ ...good, seconds: 15 }).ok, true);
  assert.equal(checkScore({ ...good, seconds: 1800 }).ok, true);
  assert.equal(checkScore({ ...good, seconds: 14 }).reason, 'bad_length');
  assert.equal(checkScore({ ...good, seconds: 1801 }).reason, 'bad_length');
  assert.equal(checkScore({ ...good, seconds: 59.5 }).reason, 'bad_length');
});
t('bad shapes never throw: null, arrays, missing fields, long ids, bad levels, accuracy out of range', () => {
  for (const x of [null, undefined, 5, 'x', [], {}, { ...good, runId: '' }, { ...good, runId: 'x'.repeat(65) }, { ...good, runId: 7 }, { ...good, textLevel: 6 }, { ...good, textLevel: 1.5 }, { ...good, accuracy: 101 }, { ...good, accuracy: -1 }]) {
    assert.equal(checkScore(x).ok, false);
  }
});
t('only runs with at least 95 percent accuracy count for the boards', () => {
  assert.equal(countsForBoard({ ...good, accuracy: 95 }), true);
  assert.equal(countsForBoard({ ...good, accuracy: 94.9 }), false);
});
t('timing: a 60 s run cannot follow the previous submission within about 52 s', () => {
  assert.equal(timingPossible(null, 1000, 60), true);
  assert.equal(timingPossible(0, 30_000, 60), false);
  assert.equal(timingPossible(0, 52_000, 60), true);
  assert.equal(timingPossible(0, 60_000, 60), true);
  assert.equal(timingPossible(0, 5_000, 15), false);
});
t('usernames: 3 to 20 letters, digits, dot, dash, underscore; lower-cased; reserved words refused', () => {
  assert.deepEqual(checkUsername('Sam_K'), { ok: true, value: 'sam_k' });
  assert.deepEqual(checkUsername('  maya.t  '), { ok: true, value: 'maya.t' });
  for (const bad of ['ab', 'a'.repeat(21), '_abc', '.abc', 'has space', 'émile', 'a/b', '<b>x</b>', '', 5, null]) assert.equal(checkUsername(bad).ok, false, String(bad));
  for (const r of ['admin', 'Admin', 'FreeTyper', 'free_typer', 'deleted', 'anonymous', 'support']) assert.equal(checkUsername(r).reason, 'reserved', r);
});
t('a first username is made from the Google name: plain letters, 3 to 14 characters, never empty', () => {
  assert.equal(suggestUsername('Sam Kowalski'), 'samkowalski');
  assert.equal(suggestUsername('Zoë Brontë-Smith Longname'), 'zoebrontesmith');
  assert.equal(suggestUsername('李雷'), 'typist');
  assert.equal(suggestUsername('Al'), 'altypist');
  assert.equal(suggestUsername('   '), 'typist');
  assert.ok(checkUsername(suggestUsername('Ana')).ok || checkUsername(suggestUsername('Ana')).reason === 'reserved');
});
t('periods are UTC: daily from midnight, weeks start on Monday, months on the 1st, lifetime has no start', () => {
  const wed = new Date(Date.UTC(2026, 10, 25, 13, 30)); // Wed 25 Nov 2026
  assert.equal(periodStart('daily', wed).toISOString(), '2026-11-25T00:00:00.000Z');
  assert.equal(periodStart('weekly', wed).toISOString(), '2026-11-23T00:00:00.000Z');
  assert.equal(periodStart('monthly', wed).toISOString(), '2026-11-01T00:00:00.000Z');
  assert.equal(periodStart('lifetime', wed), null);
  const mon = new Date(Date.UTC(2026, 10, 23, 0, 0)); // Monday exactly at midnight
  assert.equal(periodStart('weekly', mon).toISOString(), '2026-11-23T00:00:00.000Z');
  const sun = new Date(Date.UTC(2026, 10, 29, 23, 59)); // Sunday night
  assert.equal(periodStart('weekly', sun).toISOString(), '2026-11-23T00:00:00.000Z');
  const jan1 = new Date(Date.UTC(2027, 0, 1, 5)); // Friday, week began in the old year
  assert.equal(periodStart('weekly', jan1).toISOString(), '2026-12-28T00:00:00.000Z');
});

console.log(`\n${n} passed`);
