// Run: node --experimental-strip-types scripts/test-audit-fixes.mjs
import assert from 'node:assert/strict';
import { dailyStreak, pruneDaily, utcDateKey, KEEP_DAYS } from '../src/components/skills/typing/dailyStreak.ts';
import { isShareCancel } from '../src/components/skills/typing/shareOutcome.ts';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };

/** `days` consecutive counted days ending on `end` (UTC date). */
function chain(end, days) {
  const store = {};
  const d = new Date(`${end}T00:00:00Z`);
  for (let i = 0; i < days; i++) {
    store[utcDateKey(d)] = { wpm: 50, accuracy: 95, runs: 1 };
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return store;
}

t('streak counts a chain longer than KEEP_DAYS after pruning', () => {
  const today = '2026-11-09';
  const kept = pruneDaily(chain(today, 70), today);
  assert.equal(dailyStreak(kept, today), 70);
});
t('pruneDaily drops old days that are not part of the current streak', () => {
  const today = '2026-11-09';
  const store = { ...chain('2026-01-01', 5), ...chain(today, 3) };
  const kept = pruneDaily(store, today, 3);
  assert.equal(Object.keys(kept).length, 3);
  assert.equal(dailyStreak(kept, today), 3);
});
t('pruneDaily keeps the newest KEEP_DAYS days when there is no streak', () => {
  const today = '2026-11-09';
  const store = {};
  const d = new Date(`${today}T00:00:00Z`);
  for (let i = 0; i < 100; i++) {
    store[utcDateKey(d)] = { wpm: 0, accuracy: 0, runs: 1 }; // runs, none counted
    d.setUTCDate(d.getUTCDate() - 1);
  }
  assert.equal(Object.keys(pruneDaily(store, today)).length, KEEP_DAYS);
});
t('a chain that ends yesterday is kept whole', () => {
  const kept = pruneDaily(chain('2026-11-08', 80), '2026-11-09');
  assert.equal(dailyStreak(kept, '2026-11-09'), 80);
});
t('isShareCancel is true only for an AbortError', () => {
  assert.equal(isShareCancel(new DOMException('x', 'AbortError')), true);
  assert.equal(isShareCancel(new DOMException('x', 'NotAllowedError')), false);
  assert.equal(isShareCancel(new Error('boom')), false);
  assert.equal(isShareCancel(undefined), false);
});

console.log(`\n${n} passed`);
