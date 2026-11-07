// Run: node --experimental-strip-types scripts/test-mouse.mjs
import assert from 'node:assert/strict';
import { STEPS, HINT_AFTER_MS } from '../src/components/skills/mouse/mouseData.ts';
import {
  AIM_SIZES, AIM_SECONDS, scoreRun, randomTarget, isNewBest, defaultSize,
} from '../src/components/skills/mouse/aimScoring.ts';

import {
  LEVEL_ITEMS, LEVEL_NAMES, isLevelPassed, isLevelUnlocked, rankOf, firstOpenIndex,
  PASS, meetsAccuracy, densify, selectionMatches, distToSegment, insideRatio, scalePath, stepTarget, shrinkDiameter, gauntletScore,
} from '../src/components/skills/mouse/levelRules.ts';

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


// ---- levels ----
const L1 = LEVEL_ITEMS[1], L2 = LEVEL_ITEMS[2], L3 = LEVEL_ITEMS[3], L4 = LEVEL_ITEMS[4];
t('level items', () => {
  assert.deepEqual(L1, ['move', 'click', 'double', 'right', 'drag', 'scroll', 'mixed']);
  assert.deepEqual(L2, ['small', 'precise', 'hold', 'select', 'find']);
  assert.deepEqual(L3, ['moving', 'steer', 'quick', 'menu', 'sort']);
  assert.deepEqual(L4, ['gauntlet', 'shrink', 'tiny']);
  assert.deepEqual(Object.values(LEVEL_NAMES).map((x) => x.level), ['Beginner', 'Comfortable', 'Skilled', 'Mastery']);
});
t('suggested pass marks', () => {
  assert.deepEqual(PASS, { small: 80, steer: 85, tiny: 90, gauntlet: 15, shrink: 15 });
});
t('level 1 is always open, later levels need the one before', () => {
  assert.equal(isLevelUnlocked(1, []), true);
  assert.equal(isLevelUnlocked(2, []), false);
  assert.equal(isLevelUnlocked(2, L1), true);
  assert.equal(isLevelUnlocked(3, L1), false);
});
t('partial progress never unlocks', () => {
  assert.equal(isLevelUnlocked(3, [...L1, ...L2.slice(0, 4)]), false);
  assert.equal(isLevelUnlocked(3, [...L1, ...L2]), true);
});
t('old saved data (7 steps) still passes level 1', () => {
  assert.equal(isLevelPassed(1, L1), true);
  assert.equal(isLevelPassed(1, L1.slice(0, 6)), false);
});
t('rank follows the highest passed level', () => {
  assert.equal(rankOf([]), null);
  assert.equal(rankOf(L1), 'Beginner');
  assert.equal(rankOf([...L1, ...L2]), 'Comfortable');
  assert.equal(rankOf([...L1, ...L2, ...L3]), 'Skilled');
  assert.equal(rankOf([...L1, ...L2, ...L3, ...L4]), 'Master');
  assert.equal(rankOf([...L2, ...L3]), null);
});
t('first open drill index', () => {
  assert.equal(firstOpenIndex(2, []), 0);
  assert.equal(firstOpenIndex(2, ['small', 'precise']), 2);
  assert.equal(firstOpenIndex(2, L2), -1);
});
t('accuracy rule', () => {
  assert.equal(meetsAccuracy(10, 2, 80), true);
  assert.equal(meetsAccuracy(10, 3, 80), false);
  assert.equal(meetsAccuracy(0, 0, 80), false);
  assert.equal(meetsAccuracy(20, 2, 90), true);
  assert.equal(meetsAccuracy(20, 3, 90), false);
});
t('distance to a segment', () => {
  assert.equal(distToSegment(5, 3, 0, 0, 10, 0), 3);
  assert.equal(distToSegment(-3, 4, 0, 0, 10, 0), 5);
  assert.equal(distToSegment(1, 1, 2, 2, 2, 2), Math.SQRT2);
});
t('inside ratio, with and without samples', () => {
  const poly = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
  assert.equal(insideRatio([], poly, 10), 0);
  assert.equal(insideRatio([{ x: 5, y: 2 }, { x: 50, y: 9 }, { x: 60, y: 30 }, { x: 90, y: -4 }], poly, 10), 75);
});
t('scale a unit path into a box', () => {
  assert.deepEqual(scalePath([{ x: 0, y: 0 }, { x: 1, y: 0.5 }], 400, 200), [{ x: 0, y: 0 }, { x: 400, y: 100 }]);
});
t('target bounces and stays inside, even with a big time step', () => {
  let tg = { x: 10, y: 10, vx: 200, vy: 150 };
  for (let i = 0; i < 400; i++) {
    tg = stepTarget(tg, i % 7 === 0 ? 3 : 0.016, 500, 300, 60);
    assert.ok(tg.x >= 0 && tg.x <= 440 && tg.y >= 0 && tg.y <= 240, JSON.stringify(tg));
  }
  const b = stepTarget({ x: 430, y: 100, vx: 100, vy: 0 }, 0.5, 500, 300, 60);
  assert.ok(b.vx < 0);
});
t('shrinking diameter', () => {
  assert.equal(shrinkDiameter(0), 80);
  assert.equal(shrinkDiameter(5), 60);
  assert.equal(shrinkDiameter(14), 24);
  assert.equal(shrinkDiameter(50), 24);
});
t('gauntlet score floors at zero', () => {
  assert.equal(gauntletScore(20, 3), 17);
  assert.equal(gauntletScore(2, 5), 0);
});
t('densify fills the gap between two pointer samples', () => {
  const pts = densify({ x: 0, y: 0 }, { x: 100, y: 0 }, 10);
  assert.ok(pts.length >= 9 && pts.length <= 10, String(pts.length));
  for (let i = 1; i < pts.length; i++) assert.ok(pts[i].x - pts[i - 1].x <= 10.001);
  assert.ok(pts.every((p) => p.x > 0 && p.x < 100));
  assert.deepEqual(densify({ x: 0, y: 0 }, { x: 5, y: 0 }, 10), []);
});
t('a fast flick across the path is judged on the line it traces', () => {
  const poly = [{ x: 0, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 }];
  const flick = [{ x: 0, y: 100 }, ...densify({ x: 0, y: 100 }, { x: 100, y: 0 }, 5), { x: 100, y: 0 }];
  assert.ok(insideRatio(flick, poly, 10) < 85);
  const careful = [{ x: 0, y: 100 }, ...densify({ x: 0, y: 100 }, { x: 100, y: 100 }, 5), { x: 100, y: 100 }, ...densify({ x: 100, y: 100 }, { x: 100, y: 0 }, 5), { x: 100, y: 0 }];
  assert.equal(insideRatio(careful, poly, 10), 100);
});
t('selection match: exact, with and without the full stop, any spacing', () => {
  const T = 'Drag across this whole sentence to select it.';
  assert.equal(selectionMatches(T, T), true);
  assert.equal(selectionMatches('Drag across this whole sentence to select it', T), true);
  assert.equal(selectionMatches('  Drag across this  whole sentence' + String.fromCharCode(10) + 'to select it.  ', T), true);
});
t('selection match: a little extra is fine, a lot is not', () => {
  const T = 'Drag across this whole sentence to select it.';
  assert.equal(selectionMatches('Drag across this whole sentence to select it. Let', T), true);
  assert.equal(selectionMatches('The Drag across this whole sentence to select it.', T), true);
  assert.equal(selectionMatches(T + ' Let go when the last word is selected.', T), false);
});
t('selection match: too little or nothing is not a match', () => {
  const T = 'Drag across this whole sentence to select it.';
  assert.equal(selectionMatches('rag across this whole sentence to select it.', T), false);
  assert.equal(selectionMatches('Drag across this whole sentence to select', T), false);
  assert.equal(selectionMatches('', T), false);
  assert.equal(selectionMatches('   ', T), false);
});
console.log(`\n${n} passed`);
