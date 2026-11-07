// Run: node --experimental-strip-types scripts/test-mouse.mjs
import assert from 'node:assert/strict';
import { STEPS, HINT_AFTER_MS } from '../src/components/skills/mouse/mouseData.ts';
import {
  AIM_SIZES, AIM_SECONDS, scoreRun, randomTarget, isNewBest, defaultSize,
} from '../src/components/skills/mouse/aimScoring.ts';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };

t('seven steps in the spec order', () => {
  assert.deepEqual(STEPS.map((s) => s.id), ['move', 'click', 'double', 'right', 'drag', 'scroll', 'mixed']);
});
t('every step has wording for both devices', () => {
  for (const s of STEPS) {
    assert.ok(s.title.length > 0);
    assert.ok(s.text.mouse.length > 0, s.id);
    assert.ok(s.text.trackpad.length > 0, s.id);
  }
});
t('trackpad right-click mentions two-finger', () => {
  assert.match(STEPS.find((s) => s.id === 'right').text.trackpad, /two-finger/i);
});
t('hint appears after 10 seconds', () => assert.equal(HINT_AFTER_MS, 10000));

t('sizes and run length', () => {
  assert.deepEqual(AIM_SIZES, { large: 80, medium: 56, small: 36 });
  assert.equal(AIM_SECONDS, 30);
});
t('empty run scores zero, no NaN', () => {
  assert.deepEqual(scoreRun([]), { hits: 0, misses: 0, accuracy: 0, avgReactionMs: 0, score: 0 });
});
t('3 hits and 1 miss', () => {
  const r = scoreRun([
    { hit: true, reactionMs: 400 }, { hit: false }, { hit: true, reactionMs: 500 }, { hit: true, reactionMs: 600 },
  ]);
  assert.deepEqual(r, { hits: 3, misses: 1, accuracy: 75, avgReactionMs: 500, score: 2 });
});
t('score floors at zero', () => {
  const r = scoreRun([{ hit: true, reactionMs: 300 }, { hit: false }, { hit: false }, { hit: false }, { hit: false }]);
  assert.equal(r.score, 0);
  assert.equal(r.accuracy, 20);
});
t('target stays inside the area', () => {
  assert.deepEqual(randomTarget(500, 300, 80, () => 0), { x: 0, y: 0 });
  const p = randomTarget(500, 300, 80, () => 0.999999);
  assert.ok(p.x <= 420 && p.y <= 220, JSON.stringify(p));
});
t('target bigger than the area is pinned to 0', () => {
  assert.deepEqual(randomTarget(50, 50, 80, () => 0.5), { x: 0, y: 0 });
});
t('new best rules', () => {
  assert.equal(isNewBest(undefined, 1), true);
  assert.equal(isNewBest(5, 5), false);
  assert.equal(isNewBest(5, 6), true);
  assert.equal(isNewBest(5, 0), false);
  assert.equal(isNewBest(undefined, 0), false);
});
t('default sizes by device', () => {
  assert.equal(defaultSize('mouse'), 'medium');
  assert.equal(defaultSize('trackpad'), 'large');
});
console.log(`\n${n} passed`);
