// Run: node --experimental-strip-types scripts/test-ladder.mjs
import assert from 'node:assert/strict';
import {
  LEVELS, ELITE_FILL_MAX, AVG_WINDOW, AVG_MIN, levelIndex, bandFill, nextStep, averages,
} from '../src/components/skills/typing/levelLadder.ts';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };
const s = (id, wpm, totalChars, incorrectChars, duration, mode = 'speed-test') => ({
  id, date: 0, wpm, accuracy: 90, correctChars: totalChars - incorrectChars, incorrectChars, totalChars, duration, mode,
});

t('five levels with the spec thresholds', () => {
  assert.deepEqual(LEVELS.map((l) => l.key), ['beginner', 'average', 'skilled', 'pro', 'elite']);
  assert.deepEqual(LEVELS.map((l) => l.min), [0, 40, 60, 80, 100]);
  assert.deepEqual(LEVELS.map((l) => l.threshold), ['<40', '40', '60', '80', '100+']);
  assert.equal(ELITE_FILL_MAX, 130);
  assert.equal(AVG_WINDOW, 30);
  assert.equal(AVG_MIN, 3);
});
t('levelIndex: a threshold belongs to the higher level', () => {
  const cases = [[0, 0], [39, 0], [40, 1], [59, 1], [60, 2], [79, 2], [80, 3], [99, 3], [100, 4], [250, 4]];
  for (const [net, i] of cases) assert.equal(levelIndex(net), i, String(net));
});
t('bandFill: position inside each band, clamped 0..1', () => {
  assert.equal(bandFill(36, 0), 0.9);
  assert.equal(bandFill(50, 0), 1);
  assert.equal(bandFill(50, 1), 0.5);
  assert.equal(bandFill(50, 2), 0);
  assert.equal(bandFill(0, 0), 0);
  assert.equal(bandFill(115, 4), 0.5);
  assert.equal(bandFill(300, 4), 1);
});
t('nextStep: gap to the next level, null at the top', () => {
  assert.deepEqual(nextStep(36), { name: 'Average', gap: 4 });
  assert.deepEqual(nextStep(99), { name: 'Elite', gap: 1 });
  assert.equal(nextStep(100), null);
  assert.equal(nextStep(250), null);
});
t('averages: net, gross and errors over the earlier sessions', () => {
  const list = [s('a', 30, 150, 3, 60), s('b', 20, 100, 5, 60), s('c', 40, 200, 4, 60), s('d', 50, 250, 2, 60)];
  assert.deepEqual(averages(list, 'd', 60), { count: 3, net: 30, gross: 30, errors: 4 });
});
t('averages: null under three earlier sessions', () => {
  assert.equal(averages([s('a', 30, 150, 3, 60), s('b', 20, 100, 5, 60), s('d', 50, 250, 2, 60)], 'd', 60), null);
});
t('averages: games, practice and lessons are ignored', () => {
  const list = [s('a', 30, 150, 3, 60), s('b', 20, 100, 5, 60), s('g', 99, 500, 0, 60, 'game'), s('p', 99, 500, 0, 60, 'practice'), s('l', 99, 500, 0, 60, 'lesson'), s('d', 50, 250, 2, 60)];
  assert.equal(averages(list, 'd', 60), null);
});
t('averages: only the last 30 earlier sessions count', () => {
  const list = [];
  for (let i = 1; i <= 40; i++) list.push(s('s' + i, i, 100, 1, 60));
  list.push(s('cur', 70, 350, 1, 60));
  const a = averages(list, 'cur', 60);
  assert.equal(a.count, 30);
  assert.equal(a.net, 26);
});
t('averages: odd saved sessions are skipped, results stay finite', () => {
  const good = [s('a', 30, 150, 3, 60), s('b', 20, 100, 5, 60), s('c', 40, 200, 4, 60)];
  const odd = [s('z', 30, 150, 3, 0), { ...s('y', 30, 150, 3, 60), incorrectChars: undefined }, s('x', NaN, 150, 3, 60)];
  const a = averages([...odd, ...good, s('d', 50, 250, 2, 60)], 'd', 60);
  assert.deepEqual(a, { count: 3, net: 30, gross: 30, errors: 4 });
  for (const v of Object.values(a)) assert.ok(Number.isFinite(v));
});
t('averages: errors are scaled to the length of the finished run', () => {
  const prior = [s('a', 30, 150, 3, 60), s('b', 20, 100, 5, 60), s('c', 40, 200, 4, 60)]; // 4 errors per 60 s on average
  assert.equal(averages([...prior, s('d', 50, 60, 1, 15)], 'd', 15).errors, 1);
  assert.equal(averages([...prior, s('e', 50, 600, 1, 120)], 'e', 120).errors, 8);
  assert.equal(averages([...prior, s('f', 50, 250, 2, 60)], 'f', 60).errors, 4);
});
console.log(`${n} tests passed`);
