import type { RunDetail, RunSpot } from './types';

/**
 * Per-run detail for the result card: a speed curve, consistency, and the
 * run's own weak spots. Built from keystrokes while typing, kept in memory,
 * and saved only with the latest few runs (never in the long progress history).
 *
 * The curve is keystroke-based: a mistake you later correct still shows as a
 * mistake. The headline net WPM and accuracy keep their own rules (Backspace
 * takes the character back out of the tally).
 */

/** The curve is reduced to at most this many points so saved runs stay small. */
export const MAX_POINTS = 120;
/** Runs shorter than this get no graph. */
export const MIN_GRAPH_SECONDS = 5;
/** Smoothing windows in seconds; runs under 20 s use shorter ones so a short run still shows its shape. */
const SPEED_WINDOW = 5;
const RAW_WINDOW = 3;
const SHORT_RUN_SECONDS = 20;
const SHORT_SPEED_WINDOW = 3;
const SHORT_RAW_WINDOW = 2;
/** A letter pair is "slow" when it is this many times slower than this run's median pair. */
const SLOW_FACTOR = 1.5;
const SLOW_MIN_MS = 120;
const MIN_PAIRS_FOR_MEDIAN = 5;
const MAX_SPOTS = 4;

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function rolling(values: number[], window: number): number[] {
  return values.map((_, i) => {
    let sum = 0;
    let n = 0;
    for (let k = Math.max(0, i - window + 1); k <= i; k++) {
      sum += values[k];
      n++;
    }
    return sum / n;
  });
}

/** Average the curve down to `max` points (errors are summed, not averaged). */
function shrink(values: number[], max: number, sum = false): number[] {
  if (values.length <= max) return values;
  const size = Math.ceil(values.length / max);
  const out: number[] = [];
  for (let i = 0; i < values.length; i += size) {
    const chunk = values.slice(i, i + size);
    const total = chunk.reduce((a, b) => a + b, 0);
    out.push(sum ? total : total / chunk.length);
  }
  return out;
}

/**
 * Consistency, 0–100: 100 minus how much per-second speed varies around its
 * average (standard deviation ÷ mean, as a percentage). Steady typing scores
 * high, bursts and stalls score low. This is our own measure, not a standard.
 * Seconds before the first key and after the last key are ignored.
 */
export function consistencyOf(rawPerSecond: number[]): number {
  if (rawPerSecond.length < 3) return 100;
  const mean = rawPerSecond.reduce((a, b) => a + b, 0) / rawPerSecond.length;
  if (mean <= 0) return 0;
  const variance = rawPerSecond.reduce((a, b) => a + (b - mean) ** 2, 0) / rawPerSecond.length;
  const cv = Math.sqrt(variance) / mean;
  return Math.max(0, Math.min(100, Math.round(100 - cv * 100)));
}

interface PairTotals {
  timed: number;
  ms: number;
}

export interface Recorder {
  /** One typed key. `t` is ms since the run started. */
  key(t: number, correct: boolean, expected: string, prev: string | undefined, gapMs: number | undefined): void;
  reset(): void;
  /** Build the result for a run of `durationSec` seconds, or undefined with no keystrokes. */
  finish(durationSec: number): RunDetail | undefined;
}

export function createRecorder(): Recorder {
  let keys: { t: number; correct: boolean }[] = [];
  let keyErrors: Record<string, number> = {};
  let pairs: Record<string, PairTotals> = {};

  return {
    key(t, correct, expected, prev, gapMs) {
      keys.push({ t, correct });
      if (!correct && expected.trim()) {
        const k = expected.toLowerCase();
        keyErrors[k] = (keyErrors[k] ?? 0) + 1;
      }
      if (correct && prev && gapMs !== undefined && gapMs >= 15 && gapMs <= 2000) {
        const a = prev.toLowerCase();
        const b = expected.toLowerCase();
        if (/^[a-z]$/.test(a) && /^[a-z]$/.test(b)) {
          const p = pairs[a + b] ?? (pairs[a + b] = { timed: 0, ms: 0 });
          p.timed += 1;
          p.ms += gapMs;
        }
      }
    },

    reset() {
      keys = [];
      keyErrors = {};
      pairs = {};
    },

    finish(durationSec) {
      if (keys.length === 0 || durationSec <= 0) return undefined;
      const seconds = Math.max(1, Math.ceil(durationSec));
      const correctPer = new Array<number>(seconds).fill(0);
      const allPer = new Array<number>(seconds).fill(0);
      const errsPer = new Array<number>(seconds).fill(0);
      for (const k of keys) {
        const s = Math.min(seconds - 1, Math.max(0, Math.floor(k.t / 1000)));
        allPer[s] += 1;
        if (k.correct) correctPer[s] += 1;
        else errsPer[s] += 1;
      }
      // characters per second → words per minute (5 characters = 1 word).
      // The last second is usually only partly used, so it is scaled up instead of showing a false dip.
      const frac = durationSec - Math.floor(durationSec);
      const lastScale = frac >= 0.3 && seconds > 1 ? Math.min(3, 1 / frac) : 1;
      const scale = (i: number) => (i === seconds - 1 ? lastScale : 1);
      const rawWpm = allPer.map((n, i) => n * 12 * scale(i));
      const correctWpm = correctPer.map((n, i) => n * 12 * scale(i));

      const firstKeySec = Math.min(seconds - 1, Math.floor(keys[0].t / 1000));
      const lastKeySec = Math.min(seconds - 1, Math.floor(keys[keys.length - 1].t / 1000));
      const active = rawWpm.slice(firstKeySec, lastKeySec + 1);

      const spots: RunSpot[] = [];
      const wrongKeys = Object.entries(keyErrors)
        .filter(([, n]) => n >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2);
      for (const [key, n] of wrongKeys) spots.push({ kind: 'key', label: key.toUpperCase(), detail: `${n} errors` });

      const avgs = Object.entries(pairs)
        .filter(([, p]) => p.timed >= 2)
        .map(([pair, p]) => ({ pair, ms: p.ms / p.timed }));
      if (avgs.length >= MIN_PAIRS_FOR_MEDIAN) {
        const med = median(avgs.map((a) => a.ms));
        const slow = avgs
          .filter((a) => a.ms >= SLOW_FACTOR * med && a.ms >= SLOW_MIN_MS)
          .sort((a, b) => b.ms - a.ms)
          .slice(0, 2);
        for (const s of slow) spots.push({ kind: 'pair', label: s.pair, detail: `${Math.round(s.ms)} ms` });
      }

      const short = seconds < SHORT_RUN_SECONDS;
      return {
        speed: shrink(rolling(correctWpm, short ? SHORT_SPEED_WINDOW : SPEED_WINDOW), MAX_POINTS).map((v) => Math.round(v)),
        raw: shrink(rolling(rawWpm, short ? SHORT_RAW_WINDOW : RAW_WINDOW), MAX_POINTS).map((v) => Math.round(v)),
        errors: shrink(errsPer, MAX_POINTS, true),
        seconds,
        consistency: consistencyOf(active),
        spots: spots.slice(0, MAX_SPOTS),
      };
    },
  };
}

/** The session without its per-run detail, for the long progress history. */
export function withoutRun<T extends { run?: unknown }>(session: T): Omit<T, 'run'> {
  const rest = { ...session };
  delete rest.run;
  return rest;
}
