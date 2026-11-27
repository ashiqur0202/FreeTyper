// Run: node --experimental-strip-types --import ./scripts/register-ts.mjs scripts/test-practice-summary.mjs
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => void store.set(k, String(v)),
  removeItem: (k) => void store.delete(k),
};
const { readPracticeSummary, summaryCacheKey } = await import('../src/components/skills/typing/practiceSummary.ts');

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };
const NOW = new Date(2026, 10, 20, 15, 0, 0);
const put = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const session = (o) => ({ id: 's', date: NOW.getTime(), wpm: 50, accuracy: 96, correctChars: 1, incorrectChars: 0, totalChars: 1, duration: 60, mode: 'speed-test', ...o });
const stat = (key, total, wrong) => ({ key, totalPresses: total, correctPresses: total - wrong, incorrectPresses: wrong, averageTime: 300, lastPracticed: 0 });

t('nothing saved: no speed, no daily, no weak keys, no challenge run', () => {
  const s = readPracticeSummary(NOW);
  assert.equal(s.speed, null);
  assert.equal(s.dailyDone, false);
  assert.deepEqual(s.weakKeys, []);
  assert.equal(s.challengeRun, null);
});
t('speed counts speed tests only: not lessons, practice or number row', () => {
  put('freetyper-progress', { sessions: [session({ wpm: 61 }), session({ wpm: 120, mode: 'lesson' }), session({ wpm: 150, modeDetail: 'number row · digits · 30s' }), session({ wpm: 45, date: NOW.getTime() - 5000 })], keyStats: {}, streak: { current: 1, lastPracticeDate: '2026-11-20' } });
  const s = readPracticeSummary(NOW);
  assert.equal(s.speed.best, 61);
  assert.equal(s.speed.last, 61);
  assert.equal(s.speed.level, 'Skilled');
  assert.deepEqual(s.speed.next, { name: 'Pro', gap: 19 });
});
t('Elite has no next level', () => {
  put('freetyper-progress', { sessions: [session({ wpm: 104 })], keyStats: {}, streak: { current: 0, lastPracticeDate: '' } });
  const s = readPracticeSummary(NOW);
  assert.equal(s.speed.level, 'Elite');
  assert.equal(s.speed.next, null);
});
t('daily test counts only with a counted run for the UTC day', () => {
  const day = NOW.toISOString().slice(0, 10);
  put('freetyper-daily-challenge', { [day]: { wpm: 0, accuracy: 80, runs: 1 } });
  assert.equal(readPracticeSummary(NOW).dailyDone, false);
  put('freetyper-daily-challenge', { [day]: { wpm: 55, accuracy: 95, runs: 2 } });
  assert.equal(readPracticeSummary(NOW).dailyDone, true);
  put('freetyper-daily-challenge', { '2020-01-01': { wpm: 55, accuracy: 95, runs: 1 } });
  assert.equal(readPracticeSummary(NOW).dailyDone, false);
});
t('challenge run: the newest log entry that kept a seed and text level; older runs are skipped', () => {
  put('freetyper-speed-log', [
    { wpm: 70, accuracy: 98 },
    { wpm: 66, accuracy: 97, share: { seed: 'k3x9aq', mode: 'words', seconds: 30, level: 4 } },
    { wpm: 60, accuracy: 96, share: { seed: 'zzzzzz', mode: 'sentences', seconds: 60, level: 3 } },
  ]);
  assert.deepEqual(readPracticeSummary(NOW).challengeRun, { seed: 'k3x9aq', mode: 'words', gen: 1, language: 'any', seconds: 30, level: 4, wpm: 66, accuracy: 97 });
  put('freetyper-speed-log', [{ wpm: 70, accuracy: 98, share: { seed: 'abc123', mode: 'sentences', seconds: 60 } }]);
  assert.equal(readPracticeSummary(NOW).challengeRun, null, 'a run without a text level cannot be rebuilt');
  localStorage.setItem('freetyper-speed-log', '{not json');
  assert.equal(readPracticeSummary(NOW).challengeRun, null);
});
t('weak keys: only weak or weakest keys, worst first, at most three, with miss counts', () => {
  const keyStats = { a: stat('a', 100, 1), k: stat('k', 100, 40), d: stat('d', 100, 30), j: stat('j', 100, 50), p: stat('p', 100, 45), q: stat('q', 5, 5) };
  put('freetyper-progress', { sessions: [session({})], keyStats, streak: { current: 0, lastPracticeDate: '' } });
  const w = readPracticeSummary(NOW).weakKeys;
  assert.equal(w.length, 3);
  assert.deepEqual(w.map((x) => x.key), ['j', 'p', 'k']);
  assert.deepEqual(w.map((x) => x.misses), [50, 45, 40]);
});
t('the cache key changes when the speed log or the daily store changes', () => {
  const a = summaryCacheKey(NOW);
  put('freetyper-speed-log', [{ wpm: 1, accuracy: 1 }]);
  const b = summaryCacheKey(NOW);
  assert.notEqual(a, b);
  put('freetyper-daily-challenge', { '2026-11-20': { wpm: 9, accuracy: 99, runs: 1 } });
  assert.notEqual(b, summaryCacheKey(NOW));
});
console.log(`${n} tests passed`);
