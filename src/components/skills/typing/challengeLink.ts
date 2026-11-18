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

/** Read `w=<wpm>&a=<accuracy>`. Out-of-range values become null; accuracy needs a valid score. */
export function parseScore(search: string): { wpm: number | null; accuracy: number | null } {
  const params = new URLSearchParams(search);
  const wpm = wholeNumber(params.get('w'), 1, MAX_WPM);
  const accuracy = wpm === null ? null : wholeNumber(params.get('a'), 0, 100);
  return { wpm, accuracy };
}

/** Read `?c=<seed>&w=<wpm>&a=<accuracy>`. Anything out of range is dropped rather than trusted. */
export function parseChallenge(search: string): Challenge | null {
  const seed = new URLSearchParams(search).get('c');
  if (!seed || !SEED_RE.test(seed)) return null;
  return { seed, ...parseScore(search) };
}

/** The words on the link preview card (page title, description and the picture), from the link's score. */
export function challengeCard(score: { wpm: number | null; accuracy: number | null }): {
  title: string;
  description: string;
  headline: string;
  sub: string;
} {
  if (score.wpm === null) {
    const sub = 'Type the same text for 60 seconds. See who types faster.';
    return {
      title: 'Typing Challenge: Beat a Friend’s Score | FreeTyper',
      description: `${sub} Free, no sign-up.`,
      headline: 'Typing challenge',
      sub,
    };
  }
  const at = score.accuracy !== null ? ` at ${score.accuracy}% accuracy` : '';
  const sub = `A friend typed ${score.wpm} WPM${at}. Same text, 60 seconds.`;
  return {
    title: `Can you beat ${score.wpm} WPM? | FreeTyper`,
    description: `${sub} Free, no sign-up.`,
    headline: `Beat ${score.wpm} WPM`,
    sub,
  };
}

/** Path of the preview picture for a link's score; the score is the only thing it carries. */
export function challengeImagePath(score: { wpm: number | null; accuracy: number | null }): string {
  if (score.wpm === null) return '/typing-challenge/og';
  const a = score.accuracy !== null ? `&a=${score.accuracy}` : '';
  return `/typing-challenge/og?w=${score.wpm}${a}`;
}

export function buildChallengeUrl(origin: string, seed: string, wpm: number, accuracy: number): string {
  return `${origin}/typing-challenge?c=${seed}&w=${Math.round(wpm)}&a=${Math.round(accuracy)}`;
}

export function compareScores(mine: number, theirs: number): { delta: number; verdict: 'win' | 'tie' | 'behind' } {
  const diff = mine - theirs;
  return { delta: Math.abs(diff), verdict: diff > 0 ? 'win' : diff < 0 ? 'behind' : 'tie' };
}
