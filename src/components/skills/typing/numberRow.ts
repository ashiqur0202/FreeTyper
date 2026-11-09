// The number row test: text for the digits (and the shifted symbols above them), the finger hint and the
// per-digit speed of a run. Pure: tested by scripts/test-number-row.mjs.

export type NumberRowMode = 'digits' | 'symbols';

export const NUMBER_ROW_MODES: { id: NumberRowMode; label: string }[] = [
  { id: 'digits', label: 'digits' },
  { id: 'symbols', label: 'with symbols' },
];

const MIN_CHARS = 300;
const MAX_CHARS = 2400;
const CHARS_PER_SECOND = 10;

/**
 * Characters to build for a run of `seconds`: 10 per second (a 120 WPM budget). Every character is a DOM
 * element, so the text stays short; the timer ends the run.
 */
export function numberRowBudget(seconds: number): number {
  return Math.min(MAX_CHARS, Math.max(MIN_CHARS, Math.round(seconds * CHARS_PER_SECOND)));
}

type Rand = () => number;

const pick = (rand: Rand, n: number) => Math.floor(rand() * n);

/** `len` digits, the first never 0. */
function digits(rand: Rand, len: number): string {
  let out = '';
  for (let i = 0; i < len; i++) out += i === 0 ? 1 + pick(rand, 9) : pick(rand, 10);
  return out;
}

// One symbol per group, around digits, so no group has two symbols in a row. Together they cover all ten
// shifted number-row keys: ! @ # $ % ^ & * ( ).
const SYMBOL_GROUPS: Array<(rand: Rand) => string> = [
  (r) => `$${digits(r, 2 + pick(r, 4))}`,
  (r) => `${digits(r, 1 + pick(r, 2))}%`,
  (r) => `#${digits(r, 2 + pick(r, 4))}`,
  (r) => `(${digits(r, 2 + pick(r, 2))})`,
  (r) => `${digits(r, 1 + pick(r, 2))}&${digits(r, 1 + pick(r, 2))}`,
  (r) => `${digits(r, 1 + pick(r, 2))}*${digits(r, 1 + pick(r, 2))}`,
  (r) => `${digits(r, 1 + pick(r, 2))}^${digits(r, 1)}`,
  (r) => `@${digits(r, 2 + pick(r, 3))}`,
  (r) => `${digits(r, 2 + pick(r, 3))}!`,
];

/** Groups of numbers separated by single spaces, at least `numberRowBudget(seconds)` characters long. */
export function numberRowText(mode: NumberRowMode, seconds: number, rand: Rand = Math.random): string {
  const wanted = numberRowBudget(seconds);
  const groups: string[] = [];
  let length = 0;
  while (length < wanted) {
    // In symbols mode about half the groups carry a symbol; the rest stay plain digits.
    const group =
      mode === 'symbols' && rand() < 0.5
        ? SYMBOL_GROUPS[pick(rand, SYMBOL_GROUPS.length)](rand)
        : digits(rand, 2 + pick(rand, 5));
    groups.push(group);
    length += group.length + 1;
  }
  return groups.join(' ');
}

// ---- finger hint -----------------------------------------------------------------------

const DIGIT_FINGER: Record<string, string> = {
  '1': 'left little finger',
  '2': 'left ring finger',
  '3': 'left middle finger',
  '4': 'left index finger',
  '5': 'left index finger',
  '6': 'right index finger',
  '7': 'right index finger',
  '8': 'right middle finger',
  '9': 'right ring finger',
  '0': 'right little finger',
};

/** The shifted symbol on each number key. */
const SYMBOL_KEY: Record<string, string> = {
  '!': '1',
  '@': '2',
  '#': '3',
  $: '4',
  '%': '5',
  '^': '6',
  '&': '7',
  '*': '8',
  '(': '9',
  ')': '0',
};

/** The number key a typed character lives on: "7" -> "7", "&" -> "7", anything else -> null. */
export function digitOfKey(ch: string | undefined): string | null {
  if (!ch) return null;
  if (DIGIT_FINGER[ch]) return ch;
  return SYMBOL_KEY[ch] ?? null;
}

/** "right ring finger", "left index finger with right Shift", "thumb" for space, or null. Shift is held with the other hand. */
export function nextKeyHint(ch: string | undefined): string | null {
  if (ch === ' ') return 'thumb';
  const digit = digitOfKey(ch);
  if (!digit) return null;
  const finger = DIGIT_FINGER[digit];
  if (ch === digit) return finger;
  return `${finger} with ${finger.startsWith('left') ? 'right' : 'left'} Shift`;
}

// ---- per-digit speed -------------------------------------------------------------------

/** A digit needs this many timed presses before its average is shown. */
export const MIN_DIGIT_SAMPLES = 2;
/** A gap this long is a pause, not typing speed. */
const PAUSE_MS = 2500;

export interface DigitSpeed {
  digit: string;
  /** Average milliseconds to reach this key after the one before it; null with too few presses. */
  avgMs: number | null;
  count: number;
}

/**
 * `times` maps a number key to the gaps (ms) before each correct press of it. Shifted symbols count for their
 * key, so "%" is timed under 5. Returns the ten keys in order 0 to 9 and the slowest one.
 */
export function digitSpeeds(times: Record<string, number[]>): { speeds: DigitSpeed[]; slowest: string | null } {
  const speeds: DigitSpeed[] = '0123456789'.split('').map((digit) => {
    const usable = (times[digit] ?? []).filter((ms) => ms > 0 && ms < PAUSE_MS);
    const avgMs =
      usable.length >= MIN_DIGIT_SAMPLES ? Math.round(usable.reduce((sum, ms) => sum + ms, 0) / usable.length) : null;
    return { digit, avgMs, count: usable.length };
  });
  let slowest: string | null = null;
  let slowestMs = -1;
  for (const s of speeds) {
    if (s.avgMs !== null && s.avgMs > slowestMs) {
      slowest = s.digit;
      slowestMs = s.avgMs;
    }
  }
  return { speeds, slowest };
}

/** The label the speed test gives a number-row run (modeDetail), so cards and pictures can treat it apart. */
export function isNumberRowDetail(detail: string | undefined): boolean {
  return Boolean(detail?.startsWith('number row'));
}
