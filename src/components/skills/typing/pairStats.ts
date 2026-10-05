/**
 * Letter-pair (bigram) statistics, kept only in this browser.
 *
 * Every typed letter that follows another letter is one sample for the pair
 * "previous letter + this letter" (for example "th"). A sample records whether
 * the key was right and, when the previous key was typed without a Backspace
 * in between, how long it took. Only letters a-z count, so there are at most
 * 676 pairs. Nothing here is sent anywhere.
 *
 * Written to localStorage at most every couple of seconds and when the page is
 * hidden, never on every keystroke.
 */

export interface PairStat {
  /** Samples seen (right or wrong). */
  n: number;
  /** Recent-weighted sample count and error count (decay per sample). */
  dn: number;
  de: number;
  /** Samples that also have a usable timing, and the recent-weighted average in ms. */
  timed: number;
  ms: number;
  /** Last time the pair was typed. */
  last: number;
}

export type PairStore = Record<string, PairStat>;

export const PAIRS_KEY = 'freetyper-pairs';

/** A gap outside this window is a pause or a key rollover, not a usable timing. */
export const MIN_GAP_MS = 15;
export const MAX_GAP_MS = 2000;
/** Samples a pair needs before it can be called weak. */
export const MIN_SAMPLES = 5;
/** Pairs with timings needed before speed is compared against the user's own median. */
const MIN_TIMED_PAIRS_FOR_MEDIAN = 8;
const MIN_TIMED_SAMPLES = 3;
const DECAY = 0.97;
const MS_ALPHA = 0.25;
/** Minimum weakness score to be listed. */
export const WEAK_SCORE = 0.3;

const LETTERS = /^[a-z]$/;

export function pairKey(prev: string, key: string): string | null {
  const a = prev.toLowerCase();
  const b = key.toLowerCase();
  return LETTERS.test(a) && LETTERS.test(b) ? a + b : null;
}

export function emptyStat(): PairStat {
  return { n: 0, dn: 0, de: 0, timed: 0, ms: 0, last: 0 };
}

/** Add one sample. Time only counts for a correct key with a usable gap. */
export function addSample(store: PairStore, pair: string, correct: boolean, gapMs: number | undefined, now = Date.now()) {
  const s = store[pair] ?? (store[pair] = emptyStat());
  s.n += 1;
  s.dn = s.dn * DECAY + 1;
  s.de = s.de * DECAY + (correct ? 0 : 1);
  s.last = now;
  if (correct && gapMs !== undefined && gapMs >= MIN_GAP_MS && gapMs <= MAX_GAP_MS) {
    s.ms = s.timed === 0 ? gapMs : s.ms + MS_ALPHA * (gapMs - s.ms);
    s.timed += 1;
  }
}

export interface PairScore {
  pair: string;
  score: number;
  /** Recent error rate, 0–1. */
  errorRate: number;
  /** Average time for the pair in ms, or null when there is not enough timing. */
  ms: number | null;
  /** Speed against the user's own median pair, 1 = typical, null when unknown. */
  relativeSpeed: number | null;
  samples: number;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Rank pairs from weakest to strongest.
 *
 * score = 4 × recent error rate (shrunk toward 0 for small samples)
 *       + how much slower than your own median pair (0 when typical or faster)
 *
 * so a 10 % error rate scores 0.4 and a pair twice as slow as your median
 * scores 1.0. Speed is judged only against your own typing, so a slow typist is
 * not penalised for being slow overall.
 */
export function scorePairs(store: PairStore): PairScore[] {
  const timedMs = Object.values(store)
    .filter((s) => s.timed >= MIN_TIMED_SAMPLES)
    .map((s) => s.ms);
  const med = timedMs.length >= MIN_TIMED_PAIRS_FOR_MEDIAN ? median(timedMs) : null;

  return Object.entries(store)
    .filter(([, s]) => s.n >= MIN_SAMPLES)
    .map(([pair, s]) => {
      const errorRate = s.de / (s.dn + 2);
      const hasTime = s.timed >= MIN_TIMED_SAMPLES;
      const relativeSpeed = med && hasTime ? s.ms / med : null;
      const slow = relativeSpeed !== null ? Math.max(0, relativeSpeed - 1) : 0;
      return {
        pair,
        score: 4 * errorRate + slow,
        errorRate: s.de / Math.max(s.dn, 1),
        ms: hasTime ? Math.round(s.ms) : null,
        relativeSpeed,
        samples: s.n,
      };
    })
    .sort((a, b) => b.score - a.score);
}

/** The weakest pairs worth drilling. */
export function weakPairsOf(store: PairStore, limit = 5): PairScore[] {
  return scorePairs(store)
    .filter((p) => p.score >= WEAK_SCORE)
    .slice(0, limit);
}

/** Total samples, to tell the interface whether there is enough data to say anything. */
export function totalSamples(store: PairStore): number {
  return Object.values(store).reduce((sum, s) => sum + s.n, 0);
}

// ---- storage -----------------------------------------------------------

let cache: PairStore | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let listening = false;

function isStore(value: unknown): value is PairStore {
  if (!value || typeof value !== 'object') return false;
  return Object.values(value as Record<string, unknown>).every(
    (s) => !!s && typeof s === 'object' && typeof (s as PairStat).n === 'number',
  );
}

function read(): PairStore {
  try {
    const raw = localStorage.getItem(PAIRS_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isStore(parsed)) return parsed;
    }
  } catch {
    /* unreadable: start fresh */
  }
  return {};
}

export function flushPairs() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!cache) return;
  try {
    localStorage.setItem(PAIRS_KEY, JSON.stringify(cache));
  } catch {
    /* storage full or unavailable */
  }
}

function load(): PairStore {
  if (typeof window === 'undefined') return {};
  if (!cache) cache = read();
  if (!listening) {
    listening = true;
    window.addEventListener('pagehide', flushPairs);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushPairs();
    });
  }
  return cache;
}

/** The stored pairs (reads from storage once, then from memory). */
export function getPairStore(): PairStore {
  return load();
}

/**
 * Record one typed key. `prev` is the letter before it in the text, `gapMs` the
 * time since the previous keystroke (undefined after a Backspace or at the start).
 */
export function recordPair(prev: string | undefined, key: string, correct: boolean, gapMs: number | undefined) {
  if (!prev) return;
  const pair = pairKey(prev, key);
  if (!pair) return;
  addSample(load(), pair, correct, gapMs);
  if (!timer) timer = setTimeout(flushPairs, 2000);
}

export function clearPairs() {
  cache = {};
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  try {
    localStorage.removeItem(PAIRS_KEY);
  } catch {
    /* ignore */
  }
}
