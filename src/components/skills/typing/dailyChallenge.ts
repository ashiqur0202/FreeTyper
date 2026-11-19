import { practiceTexts } from './typingData';
import { DEFAULT_TEXT_LEVEL, generateSentences } from './textGenerator';
import { dailyStreak, pruneDaily, utcDateKey, type DailyDay, type DailyStore } from './dailyStreak';

export { dailyStreak, utcDateKey, type DailyDay, type DailyStore };

/** One run of the daily challenge needs this many words so a fast typist cannot finish it in 60 s. */
const DAILY_WORDS = 300;
const STORE_KEY = 'freetyper-daily-challenge';
/** Runs below this accuracy do not count toward the streak (stops key-mashing). */
export const STREAK_MIN_ACCURACY = 90;

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

/** A seeded random source for any text label (same label, same sequence). */
export function seededRandom(label: string): () => number {
  return seeded(hashString(label));
}

/**
 * The passage for one date: fresh sentences made from the date (the same text for everyone on that day, a new
 * one tomorrow), at the standard level, about 300 words. Nothing is picked from a fixed list.
 */
export function dailyText(dateKey: string): string {
  return generateSentences(`daily|${dateKey}`, DEFAULT_TEXT_LEVEL, DAILY_WORDS);
}

/**
 * The older way of making a passage, from the fixed non-code practice passages put in an order by a seed.
 * Kept only so challenge links made before the generator (`?c=...` with no `m`) show the text they always did.
 */
function legacyPassageText(label: string): string {
  const rand = seeded(hashString(`freetyper-daily-${label}`));
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
      words += t.split(/s+/).length;
      if (words >= DAILY_WORDS) break;
    }
  }
  return out.join(' ');
}

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
  const kept = pruneDaily(store, dateKey);
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(kept));
  } catch {
    /* ignore */
  }
  return kept;
}

/** The passage of an older challenge link (no `m` in it): the fixed-passage way, as before, so old links keep their text. */
export function challengeText(seed: string): string {
  return legacyPassageText(`challenge-${seed}`);
}
