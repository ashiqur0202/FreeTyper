import { periodStart, type Period } from './rules';

/**
 * Sample rows for a leaderboard that has few real entries. They exist only in the browser: nothing here is stored,
 * sent or counted, they get no rank, and the page labels each one "Sample". A real person is never ranked below one.
 */
export const SAMPLE_MIN_WPM = 15;
export const SAMPLE_MAX_WPM = 35;
/** Sample rows fill a board up to this many rows; with this many real entries (or more) there are none. */
export const SAMPLE_FILL_TO = 10;

export interface SampleRow {
  key: string;
  username: string;
  wpm: number;
  accuracy: number;
  seconds: number;
  textMode: string;
  textLevel: number;
}

const NAMES = [
  'pixel_otter', 'quietkeys', 'maya.types', 'slowandsteady', 'nova_k', 'tinyfingers', 'oliver_w', 'bluebird.7', 'keystrokes_kim', 'late_bloomer',
  'sunny_side', 'wordsmith_j', 'rain_on_keys', 'little_lex', 'typo_tom', 'ana_b', 'mintleaf', 'fox.in.socks', 'daily_dani', 'paperplane',
  'cinder_k', 'hello_keys', 'marlow', 'one_finger_ben',
];
const MODES = ['standard', 'sentences', 'words', 'quotes', 'facts'];
const LENGTHS = [60, 120, 180, 300];
const PERIOD_INDEX: Record<Period, number> = { daily: 0, weekly: 1, monthly: 2, lifetime: 3 };

/** A small seeded generator (mulberry32): the same seed always gives the same numbers. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hashOf = (text: string) => [...text].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);

export interface SampleOptions {
  /** How many real entries the board has. */
  realCount: number;
  /** Their usernames, so a sample never reuses a real name. */
  realNames: string[];
  period: Period;
  /** The active filters: samples are made to match them. */
  length: number | null;
  mode: string | null;
  now?: Date;
}

/**
 * Random speeds between 15 and 35 WPM, picked from a seed made of the UTC day, the board and its filters:
 * the same all day (switching tabs does not change them), new the next day. Fastest first.
 */
export function sampleRows(o: SampleOptions): SampleRow[] {
  const count = Math.max(0, SAMPLE_FILL_TO - o.realCount);
  if (count === 0) return [];
  const day = Math.floor((periodStart('daily', o.now ?? new Date()) as Date).getTime() / 86_400_000);
  const rnd = seeded(day * 7919 + PERIOD_INDEX[o.period] * 104729 + hashOf(`${o.length ?? ''}|${o.mode ?? ''}`));
  const taken = new Set(o.realNames.map((n) => n.toLowerCase()));
  const pool = NAMES.filter((n) => !taken.has(n));
  const rows: SampleRow[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const username = pool.splice(Math.floor(rnd() * pool.length), 1)[0];
    const textMode = o.mode ?? MODES[Math.floor(rnd() * MODES.length)];
    rows.push({
      key: `sample-${i}-${username}`,
      username,
      wpm: SAMPLE_MIN_WPM + Math.floor(rnd() * (SAMPLE_MAX_WPM - SAMPLE_MIN_WPM + 1)),
      accuracy: 95 + Math.floor(rnd() * 5),
      seconds: o.length ?? LENGTHS[Math.floor(rnd() * LENGTHS.length)],
      textMode,
      textLevel: textMode === 'daily' ? 0 : 2 + Math.floor(rnd() * 3),
    });
  }
  return rows.sort((a, b) => b.wpm - a.wpm);
}
