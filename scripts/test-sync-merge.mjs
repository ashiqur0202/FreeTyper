// Run: npm run test:sync
import assert from 'node:assert/strict';
import { mergeSyncData, parseSyncData, summarize, hasProgress, emptySyncData, LIMITS } from '../src/lib/sync/merge.ts';
import { courseLessons } from '../src/components/skills/typing/courseData.ts';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };

const L = (i) => courseLessons[i].id;
const session = (id, date, over = {}) => ({ id, date, wpm: 50, accuracy: 95, correctChars: 250, incorrectChars: 5, totalChars: 255, duration: 60, mode: 'speed-test', ...over });
const progress = (over = {}) => ({
  sessions: [], achievements: [], keyStats: {}, streak: { current: 0, best: 0, lastPracticeDate: '' },
  totalTypingTime: 0, wordsTyped: 0, bestWpm: 0, bestAccuracy: 0, ...over,
});
const data = (over = {}) => ({ ...emptySyncData(), ...over });
// Every copy passes through the same cleaning the server applies, so tests compare what is really stored.
const clean = (d) => parseSyncData(JSON.parse(JSON.stringify(d)));
const merge = (a, b) => mergeSyncData(clean(a), clean(b));

const phone = data({
  progress: progress({
    sessions: [session('a1', 1000, { wpm: 40 }), session('a2', 2000, { wpm: 62 })],
    keyStats: { e: { key: 'e', totalPresses: 100, correctPresses: 90, incorrectPresses: 10, averageTime: 220, lastPracticed: 2000 }, t: { key: 't', totalPresses: 5, correctPresses: 5, incorrectPresses: 0, averageTime: 300, lastPracticed: 1500 } },
    streak: { current: 3, best: 5, lastPracticeDate: '2026-11-20' }, totalTypingTime: 120, wordsTyped: 100, bestWpm: 62, bestAccuracy: 96,
    achievements: [{ id: 'first-test', name: 'First Steps', description: 'd', icon: 'Footprints', condition: 'c', unlockedAt: 2000 }],
  }),
  course: { completed: [L(0), L(1)], skipped: [], attempts: { [L(2)]: 2 } },
  smart: { version: 1, unlocked: 6, difficulty: 3, rounds: 12, keys: { f: { n: 40, acc: 0.9, ms: 300 }, j: { n: 10, acc: 0.8, ms: 350 } }, history: [{ accuracy: 95, wpm: 30, dir: 1, difficulty: 3, keys: 6 }] },
  daily: { '2026-11-18': { wpm: 50, accuracy: 95, runs: 1 }, '2026-11-19': { wpm: 55, accuracy: 96, runs: 2 } },
});
const laptop = data({
  progress: progress({
    sessions: [session('a2', 2000, { wpm: 62 }), session('b1', 3000, { wpm: 71 })],
    keyStats: { e: { key: 'e', totalPresses: 60, correctPresses: 55, incorrectPresses: 5, averageTime: 250, lastPracticed: 3000 }, q: { key: 'q', totalPresses: 8, correctPresses: 6, incorrectPresses: 2, averageTime: 500, lastPracticed: 2500 } },
    streak: { current: 7, best: 7, lastPracticeDate: '2026-11-26' }, totalTypingTime: 300, wordsTyped: 400, bestWpm: 71, bestAccuracy: 97,
    achievements: [{ id: 'first-test', name: 'First Steps', description: 'd', icon: 'Footprints', condition: 'c', unlockedAt: 1000 }, { id: 'speed-70', name: 'Speed Demon', description: 'd', icon: 'Flame', condition: 'c', unlockedAt: 3000 }],
  }),
  course: { completed: [L(1), L(2)], skipped: [L(3)], attempts: { [L(2)]: 1, [L(4)]: 3 } },
  smart: { version: 1, unlocked: 9, difficulty: 4, rounds: 30, keys: { f: { n: 90, acc: 0.95, ms: 250 }, d: { n: 20, acc: 0.9, ms: 280 } }, history: [{ accuracy: 97, wpm: 40, dir: 0, difficulty: 4, keys: 9 }] },
  daily: { '2026-11-19': { wpm: 48, accuracy: 94, runs: 1 }, '2026-11-25': { wpm: 60, accuracy: 97, runs: 1 } },
});
const third = data({ progress: progress({ sessions: [session('c1', 4000, { wpm: 80 })], bestWpm: 80, streak: { current: 1, best: 1, lastPracticeDate: '2026-11-27' } }), course: { completed: [L(5)], skipped: [], attempts: {} } });

t('merging a copy with itself changes nothing (a device can sync as often as it likes)', () => {
  assert.deepEqual(merge(phone, phone), clean(phone));
  assert.deepEqual(merge(laptop, laptop), clean(laptop));
});
t('the order does not matter: merge(a, b) equals merge(b, a)', () => {
  assert.deepEqual(merge(phone, laptop), merge(laptop, phone));
});
t('three devices in any grouping give one answer', () => {
  const x = mergeSyncData(merge(phone, laptop), clean(third));
  const y = mergeSyncData(clean(phone), merge(laptop, third));
  assert.deepEqual(x, y);
});
t('an empty copy adds nothing and removes nothing', () => {
  assert.deepEqual(merge(phone, emptySyncData()), clean(phone));
  assert.deepEqual(merge(emptySyncData(), phone), clean(phone));
});
t('sessions: the same run on two devices counts once; all others are kept, oldest first', () => {
  const m = merge(phone, laptop).progress.sessions;
  assert.deepEqual(m.map((s) => s.id), ['a1', 'a2', 'b1']);
});
t('no number goes down: bests, time, words and the best streak are the larger of the two', () => {
  const m = merge(phone, laptop).progress;
  assert.equal(m.bestWpm, 71);
  assert.equal(m.bestAccuracy, 97);
  assert.equal(m.totalTypingTime, 300);
  assert.equal(m.wordsTyped, 400);
  assert.equal(m.streak.best, 7);
});
t('streak: the copy practised more recently is the live one', () => {
  const m = merge(phone, laptop).progress.streak;
  assert.deepEqual(m, { current: 7, best: 7, lastPracticeDate: '2026-11-26' });
  const m2 = merge(laptop, third).progress.streak;
  assert.equal(m2.lastPracticeDate, '2026-11-27');
  assert.equal(m2.current, 1);
  assert.equal(m2.best, 7);
});
t('key stats: the copy with more presses wins each key, keys only in one copy are kept', () => {
  const k = merge(phone, laptop).progress.keyStats;
  assert.equal(k.e.totalPresses, 100);
  assert.ok(k.t && k.q);
});
t('achievements: both lists, earliest unlock time kept', () => {
  const a = merge(phone, laptop).progress.achievements;
  assert.deepEqual(a.map((x) => x.id), ['first-test', 'speed-70']);
  assert.equal(a[0].unlockedAt, 1000);
});
t('course: passed and skipped lessons are combined; failed-try counts take the larger', () => {
  const c = merge(phone, laptop).course;
  assert.deepEqual(c.completed, [L(0), L(1), L(2)]);
  assert.deepEqual(c.skipped, [L(3)]);
  assert.equal(c.attempts[L(2)], 2);
  assert.equal(c.attempts[L(4)], 3);
});
t('smart lessons: keys that were opened stay open; per-key stats from the copy with more presses; the rest from the copy with more rounds', () => {
  const s = merge(phone, laptop).smart;
  assert.equal(s.unlocked, 9);
  assert.equal(s.rounds, 30);
  assert.equal(s.difficulty, 4);
  assert.equal(s.keys.f.n, 90);
  assert.ok(s.keys.j && s.keys.d);
  assert.equal(s.history[0].keys, 9);
});
t('daily results: the better run of each day, the larger run count, every day kept', () => {
  const d = merge(phone, laptop).daily;
  assert.deepEqual(Object.keys(d), ['2026-11-18', '2026-11-19', '2026-11-25']);
  assert.equal(d['2026-11-19'].wpm, 55);
  assert.equal(d['2026-11-19'].runs, 2);
});
t('size: only the newest 1,000 sessions are kept and only the newest 5 keep their curves', () => {
  const run = { speed: [1, 2], raw: [1, 2], errors: [0, 0], seconds: 2, consistency: 90, spots: [] };
  const many = Array.from({ length: 1200 }, (_, i) => session('s' + i, 1000 + i, { run }));
  const m = merge(data({ progress: progress({ sessions: many }) }), emptySyncData()).progress.sessions;
  assert.equal(m.length, LIMITS.sessions);
  assert.equal(m[0].id, 's200');
  assert.equal(m.filter((s) => s.run).length, LIMITS.runDetail);
  assert.ok(m[m.length - 1].run);
});
t('a run on only one device keeps its curves when the same run arrives without them', () => {
  const run = { speed: [1], raw: [1], errors: [0], seconds: 1, consistency: 80, spots: [] };
  const a = data({ progress: progress({ sessions: [session('x', 5, { run })] }) });
  const b = data({ progress: progress({ sessions: [session('x', 5)] }) });
  assert.ok(merge(a, b).progress.sessions[0].run);
  assert.ok(merge(b, a).progress.sessions[0].run);
});

t('parse: not a SyncData of this version gives null', () => {
  assert.equal(parseSyncData(null), null);
  assert.equal(parseSyncData('x'), null);
  assert.equal(parseSyncData([]), null);
  assert.equal(parseSyncData({ schemaVersion: 2 }), null);
  assert.equal(parseSyncData({}), null);
});
t('parse: bad parts are dropped, numbers are held in range, nothing throws', () => {
  const p = parseSyncData({
    schemaVersion: 1,
    progress: { sessions: [session('ok', 10, { wpm: 9999, accuracy: -5 }), { id: 5 }, null, 'x', { ...session('bad', 'now') }, session('m', 11, { mode: 'hack' })], bestWpm: Infinity, streak: { current: -3, best: 'x', lastPracticeDate: '<script>' } },
    course: { completed: ['a', 5, 'a', 'x'.repeat(100)], skipped: 'no', attempts: { a: 99999 } },
    smart: { version: 2 },
    daily: { '2026-01-01': { wpm: 1e9 }, 'not-a-date': { wpm: 5 } },
  });
  assert.equal(p.progress.sessions.length, 1);
  assert.equal(p.progress.sessions[0].wpm, 500);
  assert.equal(p.progress.sessions[0].accuracy, 0);
  assert.equal(p.progress.bestWpm, 0);
  assert.deepEqual(p.progress.streak, { current: 0, best: 0, lastPracticeDate: '' });
  assert.deepEqual(p.course.completed, ['a']);
  assert.deepEqual(p.course.skipped, []);
  assert.equal(p.course.attempts.a, 1000);
  assert.equal(p.smart, null);
  assert.deepEqual(Object.keys(p.daily), ['2026-01-01']);
  assert.equal(p.daily['2026-01-01'].wpm, 500);
});
t('parse: typed text never rides along, only known fields survive', () => {
  const p = parseSyncData({ schemaVersion: 1, progress: { sessions: [{ ...session('s', 5), typedText: 'secret words', text: 'more' }], typed: 'x' }, extra: 'y' });
  const json = JSON.stringify(p);
  assert.ok(!json.includes('secret words'));
  assert.ok(!json.includes('typedText'));
  assert.ok(!('extra' in p));
});
t('parse: lists are limited (key stats, ids, daily days)', () => {
  const ks = Object.fromEntries(Array.from({ length: 500 }, (_, i) => ['k' + i, { totalPresses: 1 }]));
  const p = parseSyncData({ schemaVersion: 1, progress: { keyStats: ks }, course: { completed: Array.from({ length: 500 }, (_, i) => 'l' + i) }, daily: Object.fromEntries(Array.from({ length: 600 }, (_, i) => [new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10), { wpm: 1 }])) });
  assert.equal(Object.keys(p.progress.keyStats).length, LIMITS.keyStats);
  assert.equal(p.course.completed.length, LIMITS.ids);
  assert.equal(Object.keys(p.daily).length, LIMITS.dailyDays);
});
t('summary: the few numbers kept as columns', () => {
  const s = summarize(merge(phone, laptop));
  assert.deepEqual(s, { bestWpm: 71, totalTests: 3, lessonsCompleted: 3, currentLesson: 5, dailyStreak: 7, lastActiveDate: '2026-11-26' });
  assert.deepEqual(summarize(emptySyncData()), { bestWpm: 0, totalTests: 0, lessonsCompleted: 0, currentLesson: 1, dailyStreak: 0, lastActiveDate: null });
});

t('hasProgress: an untouched copy has none; any session, lesson, smart round or daily day counts', () => {
  assert.equal(hasProgress(emptySyncData()), false);
  assert.equal(hasProgress(data({ progress: progress() })), false, 'an empty progress object is not progress');
  assert.equal(hasProgress(data({ progress: progress({ sessions: [session('a', 1, 40)] }) })), true);
  assert.equal(hasProgress(data({ course: { completed: [], skipped: [L(2)], attempts: {} } })), true);
  assert.equal(hasProgress(data({ smart: { version: 1, unlocked: 1, difficulty: 2, rounds: 0, keys: {}, history: [] } })), false);
  assert.equal(hasProgress(data({ smart: { version: 1, unlocked: 3, difficulty: 2, rounds: 4, keys: {}, history: [] } })), true);
  assert.equal(hasProgress(data({ daily: { '2026-11-01': { wpm: 50, accuracy: 95, runs: 1 } } })), true);
});
console.log(`\n${n} passed`);
