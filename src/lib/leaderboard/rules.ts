/**
 * The leaderboard's rules, with no database and no network, so they can be tested alone.
 *
 * What counts: any finished speed test (the number row test is left out: digits are a different
 * skill), with at least 95 % accuracy. Scores come from the browser, so they cannot be proven;
 * these rules turn away the impossible and slow down abuse, and nothing more is claimed.
 */

export const MIN_ACCURACY = 95;
/** The fastest typists in the world are well below this over a test; anything above is not a typing test. */
export const MAX_WPM = 250;
export const MIN_SECONDS = 15;
export const MAX_SECONDS = 1800;
/** A person cannot submit more than this many scores in an hour. */
export const MAX_SCORES_PER_HOUR = 120;
export const MAX_REPORTS_PER_DAY = 10;

export const TEXT_MODES = ['standard', 'words', 'sentences', 'quotes', 'facts', 'code', 'mixed', 'daily', 'challenge'] as const;
export type ScoreMode = (typeof TEXT_MODES)[number];

export const PERIODS = ['daily', 'weekly', 'monthly', 'lifetime'] as const;
export type Period = (typeof PERIODS)[number];
export const TOP_SIZES = [10, 50] as const;

export interface ScoreInput {
  runId: string;
  wpm: number;
  accuracy: number;
  seconds: number;
  textMode: ScoreMode;
  textLevel: number;
}

export type Checked = { ok: true; value: ScoreInput } | { ok: false; reason: string };

const num = (x: unknown): number | null => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const round1 = (x: number) => Math.round(x * 10) / 10;

/** Cleans what a browser sent. Anything impossible is refused with a short reason (never echoed back). */
export function checkScore(raw: unknown): Checked {
  if (typeof raw !== 'object' || raw === null) return { ok: false, reason: 'bad_input' };
  const r = raw as Record<string, unknown>;
  const wpm = num(r.wpm), accuracy = num(r.accuracy), seconds = num(r.seconds), level = num(r.textLevel);
  const mode = TEXT_MODES.find((m) => m === r.textMode);
  if (typeof r.runId !== 'string' || r.runId.length < 1 || r.runId.length > 64) return { ok: false, reason: 'bad_input' };
  if (wpm === null || accuracy === null || seconds === null || level === null || !mode) return { ok: false, reason: 'bad_input' };
  if (!Number.isInteger(seconds) || seconds < MIN_SECONDS || seconds > MAX_SECONDS) return { ok: false, reason: 'bad_length' };
  if (!Number.isInteger(level) || level < 0 || level > 5) return { ok: false, reason: 'bad_input' };
  if (wpm <= 0 || wpm > MAX_WPM) return { ok: false, reason: 'implausible' };
  if (accuracy < 0 || accuracy > 100) return { ok: false, reason: 'bad_input' };
  return { ok: true, value: { runId: r.runId, wpm: round1(wpm), accuracy: round1(accuracy), seconds, textMode: mode, textLevel: level } };
}

/** True when the run counts for the boards (the others are still the person's own progress). */
export const countsForBoard = (s: ScoreInput) => s.accuracy >= MIN_ACCURACY;

/**
 * A run lasts \`seconds\`, so it cannot be submitted sooner than that after the previous one
 * was (a small allowance for the clock). Returns true when the timing is possible.
 */
export function timingPossible(prevSubmittedAtMs: number | null, nowMs: number, seconds: number): boolean {
  if (prevSubmittedAtMs === null) return true;
  return nowMs - prevSubmittedAtMs >= Math.max(0, seconds * 0.9 - 2) * 1000;
}

// ---------------------------------------------------------------- usernames

const RESERVED = new Set([
  'admin', 'administrator', 'root', 'system', 'support', 'staff', 'moderator', 'mod', 'owner', 'freetyper', 'free_typer', 'official',
  'anonymous', 'anon', 'deleted', 'null', 'undefined', 'guest', 'you', 'me', 'api', 'login', 'account', 'leaderboard',
]);

/** 3 to 20 characters: letters, digits, dot, dash, underscore; starts with a letter or digit. Stored in lower case. */
export function checkUsername(raw: unknown): { ok: true; value: string } | { ok: false; reason: 'bad_username' | 'reserved' } {
  if (typeof raw !== 'string') return { ok: false, reason: 'bad_username' };
  const v = raw.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9_.-]{2,19}$/.test(v)) return { ok: false, reason: 'bad_username' };
  if (RESERVED.has(v.replace(/[._-]/g, '_')) || RESERVED.has(v)) return { ok: false, reason: 'reserved' };
  return { ok: true, value: v };
}

/** A first username from the Google name: letters and digits only, 3 to 14 characters, never empty. */
export function suggestUsername(name: string): string {
  const base = name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 14);
  return base.length >= 3 ? base : (base + 'typist').slice(0, 14);
}

// ---------------------------------------------------------------- periods

/** The start of each board's window, all in UTC; null for lifetime. Weeks run Monday to Sunday. */
export function periodStart(period: Period, now: Date): Date | null {
  const y = now.getUTCFullYear(), m = now.getUTCMonth(), d = now.getUTCDate();
  switch (period) {
    case 'daily':
      return new Date(Date.UTC(y, m, d));
    case 'weekly': {
      const sinceMonday = (now.getUTCDay() + 6) % 7;
      return new Date(Date.UTC(y, m, d - sinceMonday));
    }
    case 'monthly':
      return new Date(Date.UTC(y, m, 1));
    default:
      return null;
  }
}
