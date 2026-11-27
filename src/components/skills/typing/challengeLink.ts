import type { TestTextVersion, TextMode } from './testText';
import { DEFAULT_TEXT_LEVEL, normalizeLevel, type TextLevel } from './textGenerator';
import type { CodeChoice } from './engine/sources';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const SEED_RE = /^[a-z0-9]{4,12}$/;
const MAX_WPM = 400;

/** Run lengths a challenge link can carry, in seconds. A custom length is not shareable. */
export const CHALLENGE_SECONDS: readonly number[] = [15, 30, 60, 120, 180, 300];
/** The text types a version 1 link can carry; version 2 (`g=2`) adds quotes, facts and mixed. */
const MODES_V1: readonly TextMode[] = ['words', 'sentences', 'code'];
/** The code languages a version 2 code link can name with `k` (no `k` means any). */
const CODE_LANGUAGES: readonly CodeChoice[] = ['js', 'python', 'sql', 'css', 'html'];
const MODES_V2: readonly TextMode[] = ['standard', 'words', 'sentences', 'quotes', 'facts', 'code', 'mixed'];

export interface Challenge {
  /** Picks the passage; the same seed gives the same text for everyone. */
  seed: string;
  /**
   * Text type of the run. null is an older link without `m` and `d`: sentences for 60 s,
   * built by `challengeText(seed)` as before.
   */
  mode: TextMode | null;
  /** Run length in seconds (60 for an older link). */
  seconds: number;
  /**
   * Text difficulty, 1 to 5. A link without `l` is standard (3), always: it was made before levels existed or
   * with the standard level, so this default must never change.
   */
  level: TextLevel;
  /** How the text is built (see TEST_TEXT_VERSION): a link without `g` is version 1, always, so older links keep giving the same text. */
  gen: TestTextVersion;
  /** The code language of a version 2 code test ('any' for every other text). */
  language: CodeChoice;
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

/** Read `d=<seconds>`: one of the allowed run lengths, else null. */
function allowedSeconds(raw: string | null): number | null {
  const d = wholeNumber(raw, 1, 3600);
  return d !== null && CHALLENGE_SECONDS.includes(d) ? d : null;
}

/** The run length of a link, for the preview card: an allowed `d`, else 60. */
export function parseSeconds(search: string): number {
  return allowedSeconds(new URLSearchParams(search).get('d')) ?? 60;
}

/**
 * Read `?c=<seed>&w=<wpm>&a=<accuracy>` and, for links made from a speed test, `&m=<mode>&d=<seconds>&l=<level>` and, for version 2 texts, `&g=2`.
 * Anything out of range is dropped rather than trusted; `m` and `d` count only together; a missing or odd `l` is 3.
 */
export function parseChallenge(search: string): Challenge | null {
  const params = new URLSearchParams(search);
  const seed = params.get('c');
  if (!seed || !SEED_RE.test(seed)) return null;
  const gen: TestTextVersion = params.get('g') === '2' ? 2 : 1;
  const mode = (gen === 2 ? MODES_V2 : MODES_V1).find((x) => x === params.get('m')) ?? null;
  const d = allowedSeconds(params.get('d'));
  const typed = mode !== null && d !== null;
  return { seed, mode: typed ? mode : null, seconds: typed ? d : 60, level: typed ? normalizeLevel(params.get('l')) : DEFAULT_TEXT_LEVEL, gen: typed ? gen : 1, language: typed && gen === 2 && mode === 'code' ? (CODE_LANGUAGES.find((x) => x === params.get('k')) ?? 'any') : 'any', ...parseScore(search) };
}

export function buildChallengeUrl(
  origin: string,
  seed: string,
  wpm: number,
  accuracy: number,
  mode: TextMode | null = null,
  seconds = 60,
  level: TextLevel = DEFAULT_TEXT_LEVEL,
  gen: TestTextVersion = 1,
  language: CodeChoice = 'any',
): string {
  const base = `${origin}/typing-challenge?c=${seed}&w=${Math.round(wpm)}&a=${Math.round(accuracy)}`;
  return mode ? `${base}&m=${mode}&d=${seconds}&l=${level}${gen === 2 ? '&g=2' : ''}${gen === 2 && mode === 'code' && language !== 'any' ? `&k=${language}` : ''}` : base;
}

export function compareScores(mine: number, theirs: number): { delta: number; verdict: 'win' | 'tie' | 'behind' } {
  const diff = mine - theirs;
  return { delta: Math.abs(diff), verdict: diff > 0 ? 'win' : diff < 0 ? 'behind' : 'tie' };
}

/** "30 seconds", "60 seconds", "2 minutes". */
function spoken(seconds: number): string {
  return seconds < 120 ? `${seconds} seconds` : `${seconds / 60} minutes`;
}

/** The words on the link preview card (page title, description and the picture), from the link's score and length. */
export function challengeCard(
  score: { wpm: number | null; accuracy: number | null },
  seconds = 60,
): { title: string; description: string; headline: string; sub: string; footer: string } {
  const footer = `Free · No sign-up · Takes ${spoken(seconds)}`;
  if (score.wpm === null) {
    const sub = `Type the same text for ${spoken(seconds)}. See who types faster.`;
    return {
      title: 'Typing Challenge: Beat a Friend’s Score | FreeTyper',
      description: `${sub} Free, no sign-up.`,
      headline: 'Typing challenge',
      sub,
      footer,
    };
  }
  const at = score.accuracy !== null ? ` at ${score.accuracy}% accuracy` : '';
  const sub = `A friend typed ${score.wpm} WPM${at}. Same text, ${spoken(seconds)}.`;
  return {
    title: `Can you beat ${score.wpm} WPM? | FreeTyper`,
    description: `${sub} Free, no sign-up.`,
    headline: `Beat ${score.wpm} WPM`,
    sub,
    footer,
  };
}

/** Path of the preview picture for a link's score and length; those numbers are all it carries. */
export function challengeImagePath(score: { wpm: number | null; accuracy: number | null }, seconds = 60): string {
  const parts: string[] = [];
  if (score.wpm !== null) parts.push(`w=${score.wpm}`);
  if (score.wpm !== null && score.accuracy !== null) parts.push(`a=${score.accuracy}`);
  if (seconds !== 60) parts.push(`d=${seconds}`);
  return parts.length > 0 ? `/typing-challenge/og?${parts.join('&')}` : '/typing-challenge/og';
}
