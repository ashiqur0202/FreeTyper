const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const SEED_RE = /^[a-z0-9]{4,12}$/;
const MAX_WPM = 400;

export interface Challenge {
  /** Picks the passage; the same seed gives the same text for everyone. */
  seed: string;
  /** The sender's net WPM and accuracy, or null when the link carries no score. */
  wpm: number | null;
  accuracy: number | null;
}

export function newSeed(rand: () => number = Math.random): string {
  let s = '';
  for (let i = 0; i < 6; i++) s += ALPHABET[Math.floor(rand() * ALPHABET.length)];
  return s;
}

function wholeNumber(raw: string | null, min: number, max: number): number | null {
  if (raw === null || !/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n >= min && n <= max ? n : null;
}

/** Read `?c=<seed>&w=<wpm>&a=<accuracy>`. Anything out of range is dropped rather than trusted. */
export function parseChallenge(search: string): Challenge | null {
  const params = new URLSearchParams(search);
  const seed = params.get('c');
  if (!seed || !SEED_RE.test(seed)) return null;
  const wpm = wholeNumber(params.get('w'), 1, MAX_WPM);
  const accuracy = wpm === null ? null : wholeNumber(params.get('a'), 0, 100);
  return { seed, wpm, accuracy };
}

export function buildChallengeUrl(origin: string, seed: string, wpm: number, accuracy: number): string {
  return `${origin}/typing-challenge?c=${seed}&w=${Math.round(wpm)}&a=${Math.round(accuracy)}`;
}

export function compareScores(mine: number, theirs: number): { delta: number; verdict: 'win' | 'tie' | 'behind' } {
  const diff = mine - theirs;
  return { delta: Math.abs(diff), verdict: diff > 0 ? 'win' : diff < 0 ? 'behind' : 'tie' };
}
