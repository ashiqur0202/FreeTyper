import type { CourseLesson } from './courseData';
import { COURSE_PARAGRAPHS, COURSE_SENTENCES, COURSE_WORDS, SLASH_PAIRS } from './courseWords';

/**
 * Builds the practice text for a course lesson. Every character in the result
 * is one the lesson has unlocked (see allowedChars), so a learner is never asked
 * to type a key they have not met yet.
 */

type Rand = () => number;

const LEFT_HAND_LETTERS = 'qwertasdfgzxcvb';
const RIGHT_HAND_LETTERS = 'yuiophjklnm';
const DEFAULT_LENGTH = 250;

/** The characters a lesson's text may contain (space is always allowed). */
export function allowedChars(l: CourseLesson): Set<string> {
  const chars = new Set<string>(' ');
  for (const c of l.letters) chars.add(c);
  const upper = Boolean(l.caps) || l.style === 'sentences' || l.style === 'paragraph';
  if (upper) for (const c of l.letters.toUpperCase()) chars.add(c);
  for (const group of [l.punct, l.allowedExtra, l.digits, l.symbols]) {
    if (group) for (const c of group) chars.add(c);
  }
  return chars;
}

function pick<T>(arr: readonly T[], rand: Rand): T {
  return arr[Math.floor(rand() * arr.length)];
}

function shuffled<T>(arr: readonly T[], rand: Rand): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function randomString(chars: string[], length: number, rand: Rand): string {
  let s = '';
  for (let i = 0; i < length; i++) s += pick(chars, rand);
  return s;
}

function join(tokens: string[]): string {
  return tokens.join(' ').trim();
}

/** Short key-pair drills such as "fj jf fjf". */
function drill(l: CourseLesson, rand: Rand, target: number): string {
  const chars = [...new Set([...l.letters, ...(l.punct ?? '')])];
  const fresh = l.newKeys.filter((k) => chars.includes(k));
  const tokens: string[] = [];
  let len = 0;
  while (len < target) {
    let token = randomString(chars, 2 + Math.floor(rand() * 3), rand);
    if (fresh.length && !fresh.some((k) => token.includes(k))) {
      const at = Math.floor(rand() * token.length);
      token = token.slice(0, at) + pick(fresh, rand) + token.slice(at + 1);
    }
    tokens.push(token);
    len += token.length + 1;
  }
  return join(tokens);
}

function wordsFor(l: CourseLesson): { all: string[]; fresh: string[] } {
  const letters = new Set(l.letters);
  const all = COURSE_WORDS.filter((w) => [...w].every((c) => letters.has(c)));
  const freshSet = new Set(l.newKeys.filter((k) => /^[a-z]$/.test(k)));
  const fresh = all.filter((w) => [...w].some((c) => freshSet.has(c)));
  return { all, fresh };
}

/** Real words that use only the unlocked letters, with the new keys over-represented. */
function words(l: CourseLesson, rand: Rand, target: number): string {
  const { all, fresh } = wordsFor(l);
  if (all.length < 8) return drill(l, rand, target);

  const slashPairs = l.punct?.includes('/')
    ? SLASH_PAIRS.filter((p) => [...p].every((c) => c === '/' || l.letters.includes(c)))
    : [];

  const tokens: string[] = [];
  let len = 0;
  let sinceStop = 0;
  const recent: string[] = [];
  // One word for each new letter, used at random points so every new key is practised.
  const queue = l.newKeys
    .filter((k) => /^[a-z]$/.test(k))
    .map((k) => pick(all.filter((w) => w.includes(k)), rand))
    .filter((w): w is string => Boolean(w));
  while (len < target) {
    let token: string;
    if (queue.length && rand() < 0.25) {
      token = queue.shift() as string;
    } else if (slashPairs.length && rand() < 0.2) {
      token = pick(slashPairs, rand);
    } else {
      const pool = fresh.length >= 6 && rand() < 0.7 ? fresh : all;
      token = pick(pool, rand);
      let guard = 0;
      while (recent.includes(token) && guard++ < 8) token = pick(pool, rand);
    }
    recent.push(token);
    if (recent.length > 4) recent.shift();

    sinceStop++;
    const p = l.punct ?? '';
    if (p.includes('.') && sinceStop >= 5 + Math.floor(rand() * 4)) {
      token += '.';
      sinceStop = 0;
    } else if (p.includes(',') && rand() < 0.22) {
      token += ',';
    } else if (p.includes(';') && rand() < 0.22) {
      token += ';';
    }
    tokens.push(token);
    len += token.length + 1;
  }
  while (queue.length) tokens.push(queue.shift() as string);
  // Do not end on a dangling comma or semicolon.
  const last = tokens.length - 1;
  tokens[last] = tokens[last].replace(/[,;]$/, '');
  return join(tokens);
}

/** Words with a capital first letter on the hand being trained. */
function caps(l: CourseLesson, rand: Rand, target: number): string {
  const hand = l.caps === 'left' ? LEFT_HAND_LETTERS : RIGHT_HAND_LETTERS;
  const handWords = COURSE_WORDS.filter((w) => w.length >= 3 && hand.includes(w[0]));
  const anyWords = COURSE_WORDS.filter((w) => w.length >= 2);
  const tokens: string[] = [];
  let len = 0;
  while (len < target) {
    const useHand = rand() < 0.7;
    let w = pick(useHand ? handWords : anyWords, rand);
    if (useHand) w = w[0].toUpperCase() + w.slice(1);
    tokens.push(w);
    len += w.length + 1;
  }
  return join(tokens);
}

function sentences(l: CourseLesson, rand: Rand, target: number): string {
  const ok = allowedChars(l);
  const usable = COURSE_SENTENCES.filter((s) => [...s].every((c) => ok.has(c)));
  if (usable.length < 4) return words(l, rand, target);
  const focus = l.focus ?? '';
  const preferred = focus ? usable.filter((s) => [...s].some((c) => focus.includes(c))) : [];
  const rest = usable.filter((s) => !preferred.includes(s));
  const picked: string[] = [];
  let len = 0;
  const take = (s: string) => {
    picked.push(s);
    len += s.length + 1;
  };

  // Make sure every focus character (for example " : ; -) shows up at least once.
  for (const c of focus) {
    if (picked.some((s) => s.includes(c))) continue;
    const options = usable.filter((s) => s.includes(c) && !picked.includes(s));
    if (options.length) take(pick(options, rand));
  }
  // Then fill with focus sentences first, and the rest after.
  for (const s of [...shuffled(preferred, rand), ...shuffled(rest, rand)]) {
    if (len >= target) break;
    if (!picked.includes(s)) take(s);
  }
  return join(shuffled(picked, rand));
}

function paragraph(l: CourseLesson, rand: Rand, target: number): string {
  const ok = allowedChars(l);
  const usable = COURSE_PARAGRAPHS.filter((p) => [...p].every((c) => ok.has(c)));
  const picked: string[] = [];
  let len = 0;
  for (const p of shuffled(usable, rand)) {
    if (len >= target) break;
    picked.push(p);
    len += p.length + 1;
  }
  return join(picked);
}

function digits(chars: string, count: number, rand: Rand): string {
  const set = chars.split('');
  let s = '';
  for (let i = 0; i < count; i++) s += pick(set, rand);
  return s;
}

function numbers(l: CourseLesson, rand: Rand, target: number): string {
  const d = l.digits ?? '1234567890';
  const fresh = l.newKeys.filter((k) => d.includes(k));
  const tokens: string[] = [];
  let len = 0;
  while (len < target) {
    let token: string;
    if (l.mixed) {
      const kind = Math.floor(rand() * 5);
      token =
        kind === 0 ? digits(d, 4, rand)
        : kind === 1 ? `${digits(d, 1, rand)}${digits(d, 1, rand)}:${digits(d, 2, rand)}`
        : kind === 2 ? `${digits(d, 1 + Math.floor(rand() * 2), rand)}.${digits(d, 2, rand)}`
        : kind === 3 ? `${digits(d, 3, rand)}-${digits(d, 4, rand)}`
        : `${digits(d, 4, rand)}-${digits(d, 2, rand)}-${digits(d, 2, rand)}`;
    } else {
      token = digits(d, 2 + Math.floor(rand() * 3), rand);
      if (fresh.length && !fresh.some((k) => token.includes(k))) {
        const at = Math.floor(rand() * token.length);
        token = token.slice(0, at) + pick(fresh, rand) + token.slice(at + 1);
      }
    }
    tokens.push(token);
    len += token.length + 1;
  }
  return join(tokens);
}

const PAIRS: Record<string, string> = { '(': ')', '[': ']', '{': '}', '<': '>' };
const PREFIX = '#$@`~\\';
const POSTFIX = '%!';
const OPERATORS = '+=_|/^&*-';

/** Tokens such as $12, 50%, (word), a+b, built from the unlocked symbols only. */
function symbols(l: CourseLesson, rand: Rand, target: number): string {
  const set = l.symbols ?? '';
  const fresh = l.newKeys.filter((k) => set.includes(k));
  const pool = COURSE_WORDS.filter((w) => w.length >= 2 && w.length <= 5);
  const d = l.digits ?? '1234567890';
  const letter = () => pick('abcdefghijklmnopqrstuvwxyz'.split(''), rand);

  const make = (s: string): string | null => {
    if (PAIRS[s] && set.includes(PAIRS[s])) return `${s}${pick(pool, rand)}${PAIRS[s]}`;
    if (Object.values(PAIRS).includes(s)) return null; // closing brackets only appear with their opener
    if (PREFIX.includes(s)) return rand() < 0.5 ? `${s}${digits(d, 1 + Math.floor(rand() * 3), rand)}` : `${s}${pick(pool, rand)}`;
    if (POSTFIX.includes(s)) return rand() < 0.5 ? `${digits(d, 1 + Math.floor(rand() * 3), rand)}${s}` : `${pick(pool, rand)}${s}`;
    if (OPERATORS.includes(s)) return `${letter()}${s}${rand() < 0.5 ? letter() : digits(d, 1, rand)}`;
    return null;
  };

  const tokens: string[] = [];
  let len = 0;
  // Every new symbol appears at least once (closing brackets come with their opener).
  for (const s of fresh) {
    if (tokens.some((t) => t.includes(s))) continue;
    const token = make(s);
    if (token) {
      tokens.push(token);
      len += token.length + 1;
    }
  }
  while (len < target) {
    const s = rand() < 0.65 && fresh.length ? pick(fresh, rand) : pick(set.split(''), rand);
    const token = make(s);
    if (!token) continue;
    tokens.push(token);
    len += token.length + 1;
  }
  return join(shuffled(tokens, rand));
}

export function generateLessonText(l: CourseLesson, rand: Rand = Math.random): string {
  const target = l.length ?? DEFAULT_LENGTH;
  switch (l.style) {
    case 'drill': return drill(l, rand, target);
    case 'words': return words(l, rand, target);
    case 'caps': return caps(l, rand, target);
    case 'sentences': return sentences(l, rand, target);
    case 'paragraph': return paragraph(l, rand, target);
    case 'numbers': return numbers(l, rand, target);
    case 'symbols': return symbols(l, rand, target);
  }
}
