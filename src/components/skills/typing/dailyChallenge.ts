import { practiceTexts } from './typingData';

/** One run of the daily challenge needs this many words so a fast typist cannot finish it in 60 s. */
const DAILY_WORDS = 300;
const STORE_KEY = 'freetyper-daily-challenge';
const KEEP_DAYS = 60;
/** Runs below this accuracy do not count toward the streak (stops key-mashing). */
export const STREAK_MIN_ACCURACY = 90;

/** Today's challenge date, as UTC `YYYY-MM-DD`, so everyone gets the same passage at the same moment. */
export function utcDateKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small seeded random generator (mulberry32). Same seed gives the same sequence everywhere. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The passage for one date: the practice passages that are not code, put in an
 * order decided only by the date, joined until there are about 300 words. There
 * are few passages, so the same passage can come up on different days; the order
 * (and so what you start with) changes.
 */
export function dailyText(dateKey: string): string {
  const rand = seeded(hashString(`freetyper-daily-${dateKey}`));
  const pool = practiceTexts.filter((p) => p.category !== 'code').map((p) => p.text);
  const out: string[] = [];
  let words = 0;
  while (words < DAILY_WORDS && pool.length > 0) {
    const order = [...pool];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    for (const t of order) {
      out.push(t);
      words += t.split(/\s+/).length;
      if (words >= DAILY_WORDS) break;
    }
  }
  return out.join(' ');
}

export interface DailyDay {
  /** Best net WPM among counted runs that day. */
  wpm: number;
  accuracy: number;
  runs: number;
}

export type DailyStore = Record<string, DailyDay>;

export function loadDaily(): DailyStore {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as DailyStore) : {};
  } catch {
    return {};
  }
}

/** Record a finished run. Every run is counted in `runs`; only clean runs set the best and the streak. */
export function recordDailyRun(dateKey: string, wpm: number, accuracy: number): DailyStore {
  const store = loadDaily();
  const day = store[dateKey] ?? { wpm: 0, accuracy: 0, runs: 0 };
  day.runs += 1;
  if (accuracy >= STREAK_MIN_ACCURACY && wpm >= day.wpm) {
    day.wpm = wpm;
    day.accuracy = accuracy;
  }
  store[dateKey] = day;
  const keys = Object.keys(store).sort();
  for (const k of keys.slice(0, Math.max(0, keys.length - KEEP_DAYS))) delete store[k];
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
  return store;
}

function previousDay(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return utcDateKey(d);
}

const counted = (day?: DailyDay) => !!day && day.wpm > 0;

/**
 * Days in a row with a counted run, ending today. If today has no counted run
 * yet, the streak still shows yesterday's chain so it is not lost until the day ends.
 */
export function dailyStreak(store: DailyStore, today: string): number {
  let day = counted(store[today]) ? today : previousDay(today);
  let n = 0;
  while (counted(store[day])) {
    n += 1;
    day = previousDay(day);
  }
  return n;
}
