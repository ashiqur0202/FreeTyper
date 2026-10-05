import type { KeyStats } from './types';
import type { PairStore } from './pairStats';

/**
 * One status per letter a-z, from two things already kept in this browser:
 *  - accuracy: `keyStats` (every press of the key, in any position),
 *  - speed: the pair store (average time of the pairs that end in the letter).
 *
 * score = 4 × error rate + how much slower than your own median letter
 * (the same shape as the pair score, so the two lists agree).
 */

export type LetterLevel = 'none' | 'good' | 'ok' | 'weak' | 'bad';

export interface LetterScore {
  key: string;
  level: LetterLevel;
  score: number;
  presses: number;
  /** Accuracy 0–100, or null with no presses. */
  accuracy: number | null;
  /** Average ms into this letter, or null when there is not enough timing. */
  ms: number | null;
}

/** Presses before a letter gets a colour at all. */
export const MIN_PRESSES = 10;
/** Letters with timing needed before speed is compared against the user's own median. */
const MIN_LETTERS_FOR_MEDIAN = 6;
const MIN_TIMED = 5;

export const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

/** score thresholds: below GOOD is green, then OK (gold), WEAK (orange), above is red. */
export const GOOD_BELOW = 0.15;
export const OK_BELOW = 0.3;
export const WEAK_BELOW = 0.6;

export function levelOf(score: number): Exclude<LetterLevel, 'none'> {
  if (score < GOOD_BELOW) return 'good';
  if (score < OK_BELOW) return 'ok';
  if (score < WEAK_BELOW) return 'weak';
  return 'bad';
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Average time into each letter, weighted by how often each pair was timed. */
export function letterSpeeds(pairs: PairStore): Record<string, { ms: number; timed: number }> {
  const sums: Record<string, { total: number; timed: number }> = {};
  for (const [pair, s] of Object.entries(pairs)) {
    if (pair.length !== 2 || s.timed <= 0) continue;
    const letter = pair[1];
    const entry = sums[letter] ?? (sums[letter] = { total: 0, timed: 0 });
    entry.total += s.ms * s.timed;
    entry.timed += s.timed;
  }
  const out: Record<string, { ms: number; timed: number }> = {};
  for (const [letter, e] of Object.entries(sums)) out[letter] = { ms: e.total / e.timed, timed: e.timed };
  return out;
}

export function scoreLetters(keyStats: Record<string, KeyStats>, pairs: PairStore): LetterScore[] {
  const speeds = letterSpeeds(pairs);
  const usable = Object.values(speeds).filter((s) => s.timed >= MIN_TIMED).map((s) => s.ms);
  const med = usable.length >= MIN_LETTERS_FOR_MEDIAN ? median(usable) : null;

  return LETTERS.map((key) => {
    const stats = keyStats[key];
    const presses = stats?.totalPresses ?? 0;
    const speed = speeds[key];
    const ms = speed && speed.timed >= MIN_TIMED ? Math.round(speed.ms) : null;
    if (!stats || presses < MIN_PRESSES) {
      return { key, level: 'none' as const, score: 0, presses, accuracy: presses ? Math.round((stats.correctPresses / presses) * 100) : null, ms };
    }
    const errorRate = stats.incorrectPresses / presses;
    const slow = med && ms !== null ? Math.max(0, ms / med - 1) : 0;
    const score = 4 * errorRate + slow;
    return { key, level: levelOf(score), score, presses, accuracy: Math.round((stats.correctPresses / presses) * 100), ms };
  });
}

/** How many letters are good, and how many have enough data to be judged. */
export function summarize(scores: LetterScore[]): { good: number; judged: number } {
  const judged = scores.filter((s) => s.level !== 'none');
  return { good: judged.filter((s) => s.level === 'good').length, judged: judged.length };
}
