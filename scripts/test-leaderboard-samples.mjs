import assert from 'node:assert/strict';
import { sampleRows, seeded, SAMPLE_FILL_TO, SAMPLE_MAX_WPM, SAMPLE_MIN_WPM } from '../src/lib/leaderboard/samples.ts';

let passed = 0;
const t = (name, fn) => {
  fn();
  passed++;
  console.log('ok - ' + name);
};

const base = { realCount: 1, realNames: ['mdashiqurrahman'], period: 'daily', length: null, mode: null, now: new Date('2026-11-28T10:00:00Z') };

t('fills the board up to 10 rows, and none once 10 real entries exist', () => {
  assert.equal(sampleRows({ ...base, realCount: 0 }).length, 10);
  assert.equal(sampleRows(base).length, 9);
  assert.equal(sampleRows({ ...base, realCount: 6 }).length, 4);
  assert.equal(sampleRows({ ...base, realCount: SAMPLE_FILL_TO }).length, 0);
  assert.equal(sampleRows({ ...base, realCount: 50 }).length, 0);
});

t('every sample is between 15 and 35 WPM, accuracy 95 to 99, whole numbers, fastest first', () => {
  for (let day = 0; day < 60; day++) {
    for (const period of ['daily', 'weekly', 'monthly', 'lifetime']) {
      const rows = sampleRows({ ...base, realCount: 0, period, now: new Date(Date.UTC(2026, 0, 1 + day, 12)) });
      for (const r of rows) {
        assert.ok(Number.isInteger(r.wpm) && r.wpm >= SAMPLE_MIN_WPM && r.wpm <= SAMPLE_MAX_WPM, 'wpm ' + r.wpm);
        assert.ok(Number.isInteger(r.accuracy) && r.accuracy >= 95 && r.accuracy <= 99, 'accuracy ' + r.accuracy);
        assert.ok(r.seconds >= 60, 'a sample is never shorter than the 1 minute rule');
      }
      const speeds = rows.map((r) => r.wpm);
      assert.deepEqual(speeds, [...speeds].sort((a, b) => b - a));
    }
  }
});

t('random, not fixed: the speeds are spread over the range and differ from day to day', () => {
  const seen = new Set();
  for (let day = 0; day < 30; day++) for (const r of sampleRows({ ...base, realCount: 0, now: new Date(Date.UTC(2026, 3, 1 + day, 1)) })) seen.add(r.wpm);
  assert.ok(seen.size >= 15, 'at least 15 different speeds over a month, got ' + seen.size);
  const a = sampleRows({ ...base, now: new Date('2026-11-28T00:00:00Z') });
  const b = sampleRows({ ...base, now: new Date('2026-11-29T00:00:00Z') });
  assert.notDeepEqual(a.map((r) => r.wpm + r.username), b.map((r) => r.wpm + r.username), 'a new day gives new rows');
});

t('steady during one UTC day: same rows at 00:00 and 23:59, for the same board and filters', () => {
  const a = sampleRows({ ...base, now: new Date('2026-11-28T00:00:01Z') });
  const b = sampleRows({ ...base, now: new Date('2026-11-28T23:59:59Z') });
  assert.deepEqual(a, b);
});

t('different boards and filters get different rows', () => {
  const daily = sampleRows(base).map((r) => r.username + r.wpm).join();
  assert.notEqual(daily, sampleRows({ ...base, period: 'weekly' }).map((r) => r.username + r.wpm).join());
  assert.notEqual(daily, sampleRows({ ...base, length: 120 }).map((r) => r.username + r.wpm).join());
});

t('samples match the filters: the chosen length and text type', () => {
  for (const r of sampleRows({ ...base, realCount: 0, length: 180, mode: 'quotes' })) {
    assert.equal(r.seconds, 180);
    assert.equal(r.textMode, 'quotes');
  }
  for (const r of sampleRows({ ...base, realCount: 0, mode: 'daily' })) assert.equal(r.textLevel, 0);
});

t('usernames are unique, never a real username, and the keys are unique', () => {
  const rows = sampleRows({ ...base, realCount: 0, realNames: ['quietkeys', 'NOVA_K', 'pixel_otter'] });
  const names = rows.map((r) => r.username);
  assert.equal(new Set(names).size, names.length);
  for (const real of ['quietkeys', 'nova_k', 'pixel_otter']) assert.ok(!names.includes(real), real + ' is a real name');
  assert.equal(new Set(rows.map((r) => r.key)).size, rows.length);
});

t('the generator is deterministic for a seed', () => {
  const a = seeded(42), b = seeded(42);
  assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
  assert.notEqual(seeded(1)(), seeded(2)());
});

console.log(`\n${passed} passed`);
