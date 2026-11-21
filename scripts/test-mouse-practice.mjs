// Run: node --experimental-strip-types scripts/test-mouse-practice.mjs
import assert from 'node:assert/strict';
import {
  SKILL_IDS, SKILLS, MIN_LEVEL, MAX_LEVEL, START_LEVEL, ROUND_SECONDS, STORE_KEY,
  sizeFor, movingSpeed, followSpeed, shrinkMs, scrollRows, scrollRowPx,
  accuracyOf, mainScore, adjustLevel, zoneOf, freshZones, troubleRate, weakestZone, isSlow,
  suggestedSkills, mixAt, defaultStore, parseStore, dayKey, minutesToday, addRound, compareWithLast,
  MAX_SAVED_ROUNDS, withLevel,
} from '../src/components/skills/mouse/practiceRules.ts';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };
const R = (hits, misses, on = 0, off = 0) => ({ hits, misses, onSeconds: on, offSeconds: off });

t('eight skills, each with a name, a job and a lessons level 1 to 4', () => {
  assert.equal(SKILL_IDS.length, 8);
  for (const k of SKILL_IDS) {
    assert.ok(SKILLS[k].name && SKILLS[k].job && SKILLS[k].blurb, k);
    assert.ok([1, 2, 3, 4].includes(SKILLS[k].needs), k);
  }
});
t('round length and start level', () => {
  assert.equal(ROUND_SECONDS, 30);
  assert.ok(START_LEVEL >= MIN_LEVEL && START_LEVEL <= MAX_LEVEL);
});
t('targets get smaller at higher levels (never below their floor)', () => {
  for (const k of ['click', 'dbl', 'switch', 'drag', 'moving', 'follow']) {
    assert.ok(sizeFor(k, 10) <= sizeFor(k, 1), k);
    assert.ok(sizeFor(k, 10) >= 16, k);
    assert.ok(sizeFor(k, 1) <= 80, k);
  }
  assert.equal(sizeFor('click', 99), sizeFor('click', 10), 'level is clamped');
});
t('speeds and time limits get harder with level', () => {
  assert.ok(movingSpeed(10) > movingSpeed(1));
  assert.ok(followSpeed(10) > followSpeed(1));
  assert.ok(shrinkMs(10) < shrinkMs(1));
  assert.ok(shrinkMs(10) >= 900);
  assert.ok(scrollRows(10) > scrollRows(1));
  assert.ok(scrollRowPx(10) < scrollRowPx(1));
  assert.ok(scrollRowPx(10) >= 24);
});
t('accuracy: hits over tries; follow uses time on the dot; empty is null', () => {
  assert.equal(accuracyOf('click', R(9, 1)), 90);
  assert.equal(accuracyOf('click', R(0, 0)), null);
  assert.equal(accuracyOf('follow', R(0, 0, 12, 4)), 75);
  assert.equal(accuracyOf('follow', R(0, 0, 0, 0)), null);
});
t('main score: hits, or percent on the dot for follow', () => {
  assert.equal(mainScore('click', R(12, 3)), 12);
  assert.equal(mainScore('follow', R(0, 0, 9, 1)), 90);
  assert.equal(mainScore('follow', R(0, 0, 0, 0)), 0);
});
t('level goes up on 90% and enough hits', () => {
  assert.deepEqual(adjustLevel('click', 3, R(9, 1)), { level: 4, change: 1 });
});
t('level stays when accuracy is fine but there were too few hits', () => {
  assert.deepEqual(adjustLevel('click', 3, R(5, 0)), { level: 3, change: 0 });
  assert.deepEqual(adjustLevel('scroll', 3, R(4, 0)), { level: 4, change: 1 }, 'scroll needs only 4 hits');
});
t('level goes down below 65%; a round with nothing tried changes nothing', () => {
  assert.deepEqual(adjustLevel('click', 3, R(6, 6)), { level: 2, change: -1 });
  assert.deepEqual(adjustLevel('drag', 3, R(0, 0)), { level: 3, change: 0 });
});
t('level stays between 70% and 89%', () => {
  assert.deepEqual(adjustLevel('switch', 4, R(8, 3)), { level: 4, change: 0 });
});
t('level never leaves 1 to 10', () => {
  assert.deepEqual(adjustLevel('click', 10, R(20, 0)), { level: 10, change: 0 });
  assert.deepEqual(adjustLevel('click', 1, R(0, 5)), { level: 1, change: 0 });
  assert.deepEqual(adjustLevel('click', 1, R(0, 0)), { level: 1, change: 0 });
});
t('follow moves the level on time on the dot', () => {
  assert.equal(adjustLevel('follow', 3, R(0, 0, 27, 3)).change, 1);
  assert.equal(adjustLevel('follow', 3, R(0, 0, 10, 20)).change, -1);
});
t('zones: nine squares, row by row, edges stay inside', () => {
  assert.equal(zoneOf(0, 0, 300, 300), 0);
  assert.equal(zoneOf(150, 150, 300, 300), 4);
  assert.equal(zoneOf(299, 299, 300, 300), 8);
  assert.equal(zoneOf(300, 300, 300, 300), 8);
  assert.equal(zoneOf(-5, -5, 300, 300), 0);
  assert.equal(zoneOf(10, 10, 0, 0), 4);
});
t('trouble rate needs 8 tries; the weakest square is found', () => {
  const z = freshZones();
  z[0] = { n: 7, f: 7 };
  assert.equal(troubleRate(z[0]), null);
  z[2] = { n: 10, f: 5 };
  z[6] = { n: 10, f: 8 };
  assert.equal(troubleRate(z[6]), 0.8);
  assert.deepEqual(weakestZone(z), { index: 6, rate: 0.8 });
  assert.equal(weakestZone(freshZones()), null);
  const calm = freshZones(); calm[4] = { n: 20, f: 0 };
  assert.equal(weakestZone(calm), null, 'no trouble is not reported');
});
t('slow hit: 1.6 times the earlier average, needs 3 earlier hits', () => {
  assert.equal(isSlow(5000, [1000, 1000]), false);
  assert.equal(isSlow(1700, [1000, 1000, 1000]), true);
  assert.equal(isSlow(1500, [1000, 1000, 1000]), false);
});
t('suggested skills follow the lessons progress; nothing is locked', () => {
  assert.deepEqual(suggestedSkills(0), ['click', 'dbl', 'scroll']);
  assert.deepEqual(suggestedSkills(1), ['click', 'dbl', 'scroll']);
  assert.deepEqual(suggestedSkills(2), ['click', 'dbl', 'scroll', 'drag', 'switch']);
  assert.equal(suggestedSkills(3).length, 7);
  assert.equal(suggestedSkills(4).length, 8);
});
t('mix rotates through the list and wraps', () => {
  const l = ['click', 'dbl', 'scroll'];
  assert.deepEqual([0, 1, 2, 3, 4].map((i) => mixAt(l, i)), ['click', 'dbl', 'scroll', 'click', 'dbl']);
  assert.equal(mixAt(l, -1), 'scroll');
});
t('default store has every skill at the start level and nothing today', () => {
  const s = defaultStore();
  for (const k of SKILL_IDS) assert.equal(s.levels[k], START_LEVEL);
  assert.equal(s.seconds, 0);
  assert.deepEqual(s.rounds, []);
  assert.equal(STORE_KEY, 'freetyper-mouse-practice');
});
t('parse: bad or missing data falls back to the defaults', () => {
  for (const raw of [null, '', 'nope', '[]', '12', '{"levels":5}']) {
    const s = parseStore(raw);
    assert.equal(s.levels.click, START_LEVEL, String(raw));
    assert.equal(s.seconds, 0);
  }
});
t('parse: keeps good values, clamps levels, drops bad rounds', () => {
  const raw = JSON.stringify({ levels: { click: 7, dbl: 99, scroll: -3, drag: 'x' }, day: '2026-11-21', seconds: 90,
    rounds: [{ skill: 'click', level: 3, main: 10, acc: 90, at: 1 }, { skill: 'bogus', level: 3, main: 1 }, 'x', { skill: 'drag', level: 2, main: 'a' }] });
  const s = parseStore(raw);
  assert.equal(s.levels.click, 7);
  assert.equal(s.levels.dbl, MAX_LEVEL);
  assert.equal(s.levels.scroll, MIN_LEVEL);
  assert.equal(s.levels.drag, START_LEVEL);
  assert.equal(s.day, '2026-11-21');
  assert.equal(s.seconds, 90);
  assert.equal(s.rounds.length, 1);
});
t('day key is local YYYY-MM-DD', () => {
  assert.equal(dayKey(new Date(2026, 10, 5)), '2026-11-05');
  assert.match(dayKey(), /^\d{4}-\d{2}-\d{2}$/);
});
t('minutes today count only for today', () => {
  const s = { ...defaultStore(), day: '2026-11-21', seconds: 150 };
  assert.equal(minutesToday(s, '2026-11-21'), 2.5);
  assert.equal(minutesToday(s, '2026-11-22'), 0);
});
t('adding a round: new level, seconds add up on the same day, restart on a new day', () => {
  let s = defaultStore();
  const rec = { skill: 'click', level: 2, main: 10, acc: 90, at: 1 };
  s = addRound(s, rec, 3, 30, '2026-11-21');
  assert.equal(s.levels.click, 3);
  assert.equal(s.seconds, 30);
  s = addRound(s, { ...rec, at: 2 }, 4, 30, '2026-11-21');
  assert.equal(s.seconds, 60);
  s = addRound(s, { ...rec, at: 3 }, 4, 30, '2026-11-22');
  assert.equal(s.seconds, 30, 'a new day starts again');
  assert.equal(s.day, '2026-11-22');
  assert.equal(s.levels.dbl, START_LEVEL, 'other skills untouched');
});
t('picking a level sets only that skill, clamped to 1 to 10, without changing the old data', () => {
  const s = defaultStore();
  const a = withLevel(s, 'drag', 7);
  assert.equal(a.levels.drag, 7);
  assert.equal(a.levels.click, s.levels.click);
  assert.equal(s.levels.drag, START_LEVEL, 'the original is not changed');
  assert.equal(withLevel(s, 'drag', 99).levels.drag, MAX_LEVEL);
  assert.equal(withLevel(s, 'drag', 0).levels.drag, MIN_LEVEL);
  assert.equal(a.seconds, s.seconds);
});
t('only the latest rounds are kept', () => {
  let s = defaultStore();
  for (let i = 0; i < MAX_SAVED_ROUNDS + 5; i++) s = addRound(s, { skill: 'click', level: 2, main: i, acc: 80, at: i }, 2, 30, 'd');
  assert.equal(s.rounds.length, MAX_SAVED_ROUNDS);
  assert.equal(s.rounds.at(-1).main, MAX_SAVED_ROUNDS + 4);
});
t('compare with the last round of the same skill', () => {
  const rounds = [{ skill: 'click', level: 2, main: 10, acc: 90, at: 1 }, { skill: 'follow', level: 2, main: 70, acc: 70, at: 2 }, { skill: 'click', level: 3, main: 12, acc: 80, at: 3 }];
  assert.deepEqual(compareWithLast(rounds, 'click', 15), { diff: 3, unit: 'hits' });
  assert.deepEqual(compareWithLast(rounds, 'follow', 65), { diff: -5, unit: 'points' });
  assert.equal(compareWithLast(rounds, 'drag', 5), null);
});

console.log(`\n${n} passed`);
