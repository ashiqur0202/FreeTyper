import { courseLessons } from '@/components/skills/typing/courseData';
import type { Achievement, KeyStats, ProgressData, TypingSession } from '@/components/skills/typing/types';
import type { CourseProgress } from '@/components/skills/typing/courseProgress';
import type { DailyStore } from '@/components/skills/typing/dailyStreak';
import type { KeyState, SmartState } from '@/components/skills/typing/smartEngine';

/**
 * What an account keeps for a typist, and how two copies of it become one.
 *
 * The data is exactly what the site already keeps in the browser (speed and
 * lesson history, per-key stats, lesson progress, daily results): numbers,
 * dates and key names. Never typed text.
 *
 * Merging is the heart of "nothing is ever lost": it never lowers a number, it
 * gives the same answer whichever copy comes first, and merging a copy with
 * itself changes nothing, so a device can sync as often as it likes.
 */

export const SYNC_SCHEMA_VERSION = 1;

export interface SyncData {
  schemaVersion: 1;
  /** freetyper-progress */
  progress: ProgressData | null;
  /** freetyper-course-progress */
  course: CourseProgress | null;
  /** freetyper-smart-progress */
  smart: SmartState | null;
  /** freetyper-daily-challenge */
  daily: DailyStore | null;
}

export function emptySyncData(): SyncData {
  return { schemaVersion: 1, progress: null, course: null, smart: null, daily: null };
}

/** Limits that keep one account's data small however long it is used. */
export const LIMITS = {
  sessions: 1000,
  /** Only the newest runs keep their per-second curves (the rest would be most of the size). */
  runDetail: 5,
  keyStats: 200,
  dailyDays: 400,
  ids: 200,
  achievements: 100,
  history: 60,
} as const;

const SESSION_MODES = ['lesson', 'practice', 'speed-test', 'game'] as const;
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

// ---------------------------------------------------------------- checks

type Obj = Record<string, unknown>;
const isObj = (x: unknown): x is Obj => typeof x === 'object' && x !== null && !Array.isArray(x);

/** A finite number inside a range, else the fallback. */
function num(x: unknown, min: number, max: number, fallback: number): number {
  return typeof x === 'number' && Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : fallback;
}
const int = (x: unknown, min: number, max: number, fallback: number) => Math.round(num(x, min, max, fallback));
const str = (x: unknown, max: number): string | null => (typeof x === 'string' && x.length <= max ? x : null);

function numArray(x: unknown, maxLen: number): number[] | null {
  if (!Array.isArray(x) || x.length > maxLen) return null;
  return x.every((n) => typeof n === 'number' && Number.isFinite(n)) ? (x as number[]) : null;
}

function cleanRun(x: unknown): TypingSession['run'] | undefined {
  if (!isObj(x)) return undefined;
  const speed = numArray(x.speed, 2000);
  const raw = numArray(x.raw, 2000);
  const errors = numArray(x.errors, 2000);
  if (!speed || !raw || !errors) return undefined;
  const spots = Array.isArray(x.spots) ? x.spots.slice(0, 20) : [];
  const cleanSpots = spots.flatMap((s) => {
    if (!isObj(s) || (s.kind !== 'key' && s.kind !== 'pair')) return [];
    const label = str(s.label, 40);
    const detail = str(s.detail, 200);
    return label !== null && detail !== null ? [{ kind: s.kind as 'key' | 'pair', label, detail }] : [];
  });
  return { speed, raw, errors, seconds: int(x.seconds, 0, 86400, 0), consistency: num(x.consistency, 0, 100, 0), spots: cleanSpots };
}

function cleanSession(x: unknown): TypingSession | null {
  if (!isObj(x)) return null;
  const id = str(x.id, 64);
  const mode = SESSION_MODES.find((m) => m === x.mode);
  if (!id || !mode || typeof x.date !== 'number' || !Number.isFinite(x.date) || x.date <= 0) return null;
  const s: TypingSession = {
    id,
    date: x.date,
    wpm: num(x.wpm, 0, 500, 0),
    accuracy: num(x.accuracy, 0, 100, 0),
    correctChars: int(x.correctChars, 0, 1e7, 0),
    incorrectChars: int(x.incorrectChars, 0, 1e7, 0),
    totalChars: int(x.totalChars, 0, 1e7, 0),
    duration: num(x.duration, 0, 86400, 0),
    mode,
  };
  const detail = str(x.modeDetail, 100);
  if (detail) s.modeDetail = detail;
  const run = cleanRun(x.run);
  if (run) s.run = run;
  return s;
}

function cleanKeyStats(x: unknown): Record<string, KeyStats> {
  const out: Record<string, KeyStats> = {};
  if (!isObj(x)) return out;
  for (const k of Object.keys(x).slice(0, LIMITS.keyStats)) {
    const v = x[k];
    if (k.length > 12 || !isObj(v)) continue;
    out[k] = {
      key: k,
      totalPresses: int(v.totalPresses, 0, 1e9, 0),
      correctPresses: int(v.correctPresses, 0, 1e9, 0),
      incorrectPresses: int(v.incorrectPresses, 0, 1e9, 0),
      averageTime: num(v.averageTime, 0, 1e6, 0),
      lastPracticed: num(v.lastPracticed, 0, 1e14, 0),
    };
  }
  return out;
}

function cleanAchievements(x: unknown): Achievement[] {
  if (!Array.isArray(x)) return [];
  return x.slice(0, LIMITS.achievements).flatMap((a) => {
    if (!isObj(a)) return [];
    const id = str(a.id, 64), name = str(a.name, 100), description = str(a.description, 300), icon = str(a.icon, 40), condition = str(a.condition, 100);
    if (!id || name === null || description === null || icon === null || condition === null) return [];
    const out: Achievement = { id, name, description, icon, condition };
    if (typeof a.unlockedAt === 'number' && Number.isFinite(a.unlockedAt)) out.unlockedAt = a.unlockedAt;
    return [out];
  });
}

function cleanProgress(x: unknown): ProgressData | null {
  if (!isObj(x)) return null;
  const sessions = (Array.isArray(x.sessions) ? x.sessions.slice(-LIMITS.sessions * 2) : []).flatMap((s) => {
    const c = cleanSession(s);
    return c ? [c] : [];
  });
  const streak = isObj(x.streak) ? x.streak : {};
  const last = typeof streak.lastPracticeDate === 'string' && (streak.lastPracticeDate === '' || DATE_KEY.test(streak.lastPracticeDate)) ? streak.lastPracticeDate : '';
  return {
    sessions,
    achievements: cleanAchievements(x.achievements),
    keyStats: cleanKeyStats(x.keyStats),
    streak: { current: int(streak.current, 0, 100000, 0), best: int(streak.best, 0, 100000, 0), lastPracticeDate: last },
    totalTypingTime: num(x.totalTypingTime, 0, 1e10, 0),
    wordsTyped: int(x.wordsTyped, 0, 1e9, 0),
    bestWpm: num(x.bestWpm, 0, 500, 0),
    bestAccuracy: num(x.bestAccuracy, 0, 100, 0),
  };
}

function idList(x: unknown): string[] {
  if (!Array.isArray(x)) return [];
  return [...new Set(x.filter((v): v is string => typeof v === 'string' && v.length <= 64))].slice(0, LIMITS.ids);
}

function cleanCourse(x: unknown): CourseProgress | null {
  if (!isObj(x)) return null;
  const attempts: Record<string, number> = {};
  if (isObj(x.attempts)) for (const k of Object.keys(x.attempts).slice(0, LIMITS.ids)) if (k.length <= 64) attempts[k] = int(x.attempts[k], 0, 1000, 0);
  return { completed: idList(x.completed), skipped: idList(x.skipped), attempts };
}

function cleanSmart(x: unknown): SmartState | null {
  if (!isObj(x) || x.version !== 1) return null;
  const keys: Record<string, KeyState> = {};
  if (isObj(x.keys)) {
    for (const k of Object.keys(x.keys).slice(0, 64)) {
      const v = x.keys[k];
      if (k.length > 2 || !isObj(v)) continue;
      const ks: KeyState = { n: int(v.n, 0, 1e9, 0), acc: num(v.acc, 0, 1, 1), ms: num(v.ms, 0, 1e6, 0) };
      if (typeof v.last === 'number' && Number.isFinite(v.last)) ks.last = v.last;
      keys[k] = ks;
    }
  }
  const history = (Array.isArray(x.history) ? x.history.slice(-LIMITS.history) : []).flatMap((h) => {
    if (!isObj(h)) return [];
    const dir = h.dir === -1 || h.dir === 1 ? h.dir : 0;
    const r: SmartState['history'][number] = {
      accuracy: num(h.accuracy, 0, 100, 0), wpm: num(h.wpm, 0, 500, 0), dir, difficulty: int(h.difficulty, 0, 30, 0), keys: int(h.keys, 0, 64, 0),
    };
    const u = str(h.unlockedKey, 2);
    if (u) r.unlockedKey = u;
    return [r];
  });
  return { version: 1, unlocked: int(x.unlocked, 1, 26, 1), difficulty: int(x.difficulty, 1, 30, 2), rounds: int(x.rounds, 0, 1e9, 0), keys, history };
}

function cleanDaily(x: unknown): DailyStore | null {
  if (!isObj(x)) return null;
  const out: DailyStore = {};
  for (const k of Object.keys(x).filter((d) => DATE_KEY.test(d)).sort().slice(-LIMITS.dailyDays)) {
    const v = x[k];
    if (isObj(v)) out[k] = { wpm: num(v.wpm, 0, 500, 0), accuracy: num(v.accuracy, 0, 100, 0), runs: int(v.runs, 0, 100000, 0) };
  }
  return out;
}

/**
 * Turns anything a client sent (or a database row held) into a SyncData, or null
 * when it is not one. Bad parts are dropped rather than refused, and every list
 * and number is held inside the limits.
 */
export function parseSyncData(raw: unknown): SyncData | null {
  if (!isObj(raw) || raw.schemaVersion !== SYNC_SCHEMA_VERSION) return null;
  return {
    schemaVersion: 1,
    progress: cleanProgress(raw.progress),
    course: cleanCourse(raw.course),
    smart: cleanSmart(raw.smart),
    daily: cleanDaily(raw.daily),
  };
}

// ---------------------------------------------------------------- merging

/** A stable text for a value, only used to break ties the same way on every device. */
const tie = (v: unknown) => JSON.stringify(v);

/** The larger of two numbers by `score`; on a tie the smaller JSON, so the order of a and b never matters. */
function pick<T>(a: T, b: T, score: (v: T) => number): T {
  const sa = score(a), sb = score(b);
  if (sa !== sb) return sa > sb ? a : b;
  return tie(a) <= tie(b) ? a : b;
}

function mergeSessions(a: TypingSession[], b: TypingSession[]): TypingSession[] {
  const byId = new Map<string, TypingSession>();
  for (const s of [...a, ...b]) {
    const have = byId.get(s.id);
    // The same run on two devices: keep the copy that still has its curves.
    byId.set(s.id, have ? pick(have, s, (x) => (x.run ? 1 : 0)) : s);
  }
  const all = [...byId.values()].sort((x, y) => x.date - y.date || (x.id < y.id ? -1 : 1)).slice(-LIMITS.sessions);
  // Only the newest few keep their curves.
  return all.map((s, i) => {
    if (i >= all.length - LIMITS.runDetail || !s.run) return s;
    const lean = { ...s };
    delete lean.run;
    return lean;
  });
}

function mergeKeyStats(a: Record<string, KeyStats>, b: Record<string, KeyStats>): Record<string, KeyStats> {
  const out: Record<string, KeyStats> = {};
  for (const k of [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()) {
    // Counts cannot be added (the same presses may be in both copies), so the copy with more presses wins.
    out[k] = a[k] && b[k] ? pick(a[k], b[k], (s) => s.totalPresses) : (a[k] ?? b[k]);
  }
  return out;
}

function mergeAchievements(a: Achievement[], b: Achievement[]): Achievement[] {
  const byId = new Map<string, Achievement>();
  for (const x of [...a, ...b]) {
    const have = byId.get(x.id);
    if (!have) { byId.set(x.id, x); continue; }
    const times = [have.unlockedAt, x.unlockedAt].filter((t): t is number => typeof t === 'number');
    const base = tie(have) <= tie(x) ? have : x;
    byId.set(x.id, times.length ? { ...base, unlockedAt: Math.min(...times) } : base);
  }
  return [...byId.values()].sort((x, y) => (x.id < y.id ? -1 : 1));
}

function mergeProgress(a: ProgressData, b: ProgressData): ProgressData {
  // The streak that was practised more recently is the live one; the best is the best of both.
  const live = pick(a.streak, b.streak, (s) => (s.lastPracticeDate ? Date.parse(s.lastPracticeDate) || 0 : 0) * 1e3 + s.current);
  return {
    sessions: mergeSessions(a.sessions, b.sessions),
    achievements: mergeAchievements(a.achievements, b.achievements),
    keyStats: mergeKeyStats(a.keyStats, b.keyStats),
    streak: { current: live.current, best: Math.max(a.streak.best, b.streak.best, live.current), lastPracticeDate: live.lastPracticeDate },
    totalTypingTime: Math.max(a.totalTypingTime, b.totalTypingTime),
    wordsTyped: Math.max(a.wordsTyped, b.wordsTyped),
    bestWpm: Math.max(a.bestWpm, b.bestWpm),
    bestAccuracy: Math.max(a.bestAccuracy, b.bestAccuracy),
  };
}

const courseOrder = new Map(courseLessons.map((l, i) => [l.id, i] as const));
const byCourseOrder = (x: string, y: string) => (courseOrder.get(x) ?? 1e6) - (courseOrder.get(y) ?? 1e6) || (x < y ? -1 : x > y ? 1 : 0);

function mergeCourse(a: CourseProgress, b: CourseProgress): CourseProgress {
  const completed = [...new Set([...a.completed, ...b.completed])].sort(byCourseOrder);
  const skipped = [...new Set([...a.skipped, ...b.skipped])].sort(byCourseOrder);
  const attempts: Record<string, number> = {};
  for (const id of [...new Set([...Object.keys(a.attempts), ...Object.keys(b.attempts)])].sort(byCourseOrder)) {
    // Failed tries: the larger count (it only matters for a lesson that is not done yet, and never lowers).
    attempts[id] = Math.max(a.attempts[id] ?? 0, b.attempts[id] ?? 0);
  }
  return { completed, skipped, attempts };
}

function mergeSmart(a: SmartState, b: SmartState): SmartState {
  const lead = pick(a, b, (s) => s.rounds);
  const keys: Record<string, KeyState> = {};
  for (const k of [...new Set([...Object.keys(a.keys), ...Object.keys(b.keys)])].sort()) {
    keys[k] = a.keys[k] && b.keys[k] ? pick(a.keys[k], b.keys[k], (s) => s.n) : (a.keys[k] ?? b.keys[k]);
  }
  // Keys never close again: the copy that opened more keeps them open. Everything else follows the copy with more rounds.
  return { version: 1, unlocked: Math.max(a.unlocked, b.unlocked), difficulty: lead.difficulty, rounds: Math.max(a.rounds, b.rounds), keys, history: lead.history };
}

function mergeDaily(a: DailyStore, b: DailyStore): DailyStore {
  const out: DailyStore = {};
  for (const day of [...new Set([...Object.keys(a), ...Object.keys(b)])].sort().slice(-LIMITS.dailyDays)) {
    out[day] = a[day] && b[day] ? { ...pick(a[day], b[day], (d) => d.wpm), runs: Math.max(a[day].runs, b[day].runs) } : (a[day] ?? b[day]);
  }
  return out;
}

function either<T>(a: T | null, b: T | null, both: (x: T, y: T) => T): T | null {
  return a && b ? both(a, b) : (a ?? b);
}

const EMPTY_PROGRESS: ProgressData = {
  sessions: [], achievements: [], keyStats: {}, streak: { current: 0, best: 0, lastPracticeDate: '' },
  totalTypingTime: 0, wordsTyped: 0, bestWpm: 0, bestAccuracy: 0,
};

/** A copy that exists on one side only still goes through the size limits (a first login from a device with a long history). */
const progressOf = (a: ProgressData | null, b: ProgressData | null): ProgressData | null =>
  a && b ? mergeProgress(a, b) : (a ?? b) ? mergeProgress((a ?? b) as ProgressData, EMPTY_PROGRESS) : null;

/** Two copies of a typist's data become one. Never lowers a number; the order of a and b does not matter; merge(a, a) is a. */
export function mergeSyncData(a: SyncData, b: SyncData): SyncData {
  return {
    schemaVersion: 1,
    progress: progressOf(a.progress, b.progress),
    course: either(a.course, b.course, mergeCourse),
    smart: either(a.smart, b.smart, mergeSmart),
    daily: either(a.daily, b.daily, mergeDaily),
  };
}

// ---------------------------------------------------------------- summary

/** The few numbers kept as table columns (a profile page or leaderboard reads these without opening the JSON). */
export interface Summary {
  bestWpm: number;
  totalTests: number;
  lessonsCompleted: number;
  currentLesson: number;
  dailyStreak: number;
  lastActiveDate: string | null;
}

export function summarize(data: SyncData): Summary {
  const p = data.progress;
  const c = data.course;
  const done = new Set([...(c?.completed ?? []), ...(c?.skipped ?? [])]);
  const firstOpen = courseLessons.find((l) => !done.has(l.id));
  return {
    bestWpm: p?.bestWpm ?? 0,
    totalTests: p ? p.sessions.filter((s) => s.mode === 'speed-test').length : 0,
    lessonsCompleted: c?.completed.length ?? 0,
    currentLesson: firstOpen ? firstOpen.number : courseLessons.length,
    dailyStreak: p?.streak.current ?? 0,
    lastActiveDate: p?.streak.lastPracticeDate || null,
  };
}
