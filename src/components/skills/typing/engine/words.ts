import { COURSE_WORDS } from '../courseWords';
import { ADJECTIVES, ADVERBS, NOUNS, TIME_PHRASES, VERBS } from './lexicon';
import { pickWeighted, type Rand } from './rng';
import { isBlockedWord } from './quality';

/**
 * Plain words for drilling keys: real words made only of open keys, favouring the keys to practise, with made-up
 * letter groups only when too few real words fit (a few keys open). Used by Smart lessons rounds and, together
 * with sentences, by Practice.
 */

let cache: string[] | null = null;

/** Every real word we have: the course list plus the sentence word bank, without blocked words. */
export function allWords(): string[] {
  if (cache) return cache;
  const set = new Set<string>(COURSE_WORDS);
  for (const list of Object.values(NOUNS)) for (const x of list) set.add(x);
  for (const v of VERBS) {
    set.add(v.base);
    set.add(v.third);
    set.add(v.past);
  }
  for (const a of ADJECTIVES) set.add(a.word);
  for (const a of ADVERBS) set.add(a);
  for (const t of TIME_PHRASES) for (const part of t.split(' ')) set.add(part);
  cache = [...set].filter((x) => /^[a-z]+$/.test(x) && x.length >= 2 && !isBlockedWord(x));
  return cache;
}

export interface WordsRequest {
  open: ReadonlySet<string>;
  weight: (letter: string) => number;
  difficulty: number;
  /** Stop after this many words, or once the text has this many letters, whichever is given (both: the first reached). */
  words?: number;
  targetChars?: number;
  rand: Rand;
}

function pseudoWord(open: string[], weight: (k: string) => number, target: number, rand: Rand): string {
  const vowels = open.filter((k) => 'aeiou'.includes(k));
  const cons = open.filter((k) => !'aeiou'.includes(k));
  const len = Math.max(open.length === 1 ? 2 : 3, Math.round(target + (rand() * 2 - 1)));
  let word = '';
  let useVowel = rand() < 0.4;
  for (let i = 0; i < len; i++) {
    const pool = useVowel && vowels.length ? vowels : cons.length ? cons : vowels;
    word += pickWeighted(pool, weight, rand);
    useVowel = !useVowel;
  }
  return word;
}

/** The words of a text, as a list (the caller joins them). Capitals and punctuation come in as difficulty rises. */
export function generateWordList(req: WordsRequest): { words: string[]; real: number } {
  const open = [...req.open];
  const d = Math.min(10, Math.max(1, req.difficulty));
  const target = 3 + d * 0.45;
  const pool = allWords().filter((w) => [...w].every((c) => req.open.has(c)));
  const maxWords = req.words ?? 80;
  const maxChars = req.targetChars ?? Infinity;
  const out: string[] = [];
  const recent: string[] = [];
  let total = 0;
  let real = 0;
  for (let i = 0; i < maxWords && total < maxChars; i++) {
    let w: string;
    if (pool.length >= 10 && req.rand() < 0.88) {
      w = pickWeighted(
        pool.filter((x) => !recent.includes(x)),
        (x) => {
          let s = 0;
          for (const c of x) s += req.weight(c);
          const dl = x.length - target;
          return Math.pow(s / x.length, 1.5) * Math.exp(-(dl * dl) / 6);
        },
        req.rand,
      );
      real++;
    } else {
      w = pseudoWord(open, req.weight, target, req.rand);
      // a made-up group should not repeat a recent one (with one or two keys that cannot be avoided)
      for (let tries = 0; tries < 8 && recent.includes(w) && open.length > 2; tries++) w = pseudoWord(open, req.weight, target, req.rand);
    }
    recent.push(w);
    if (recent.length > 5) recent.shift();
    if (d >= 5 && req.rand() < (d - 4) * 0.05) w = w.charAt(0).toUpperCase() + w.slice(1);
    if (d >= 6 && req.rand() < (d - 5) * 0.05) w += req.rand() < 0.5 ? ',' : '.';
    out.push(w);
    total += w.length + 1;
  }
  if (out.length) out[out.length - 1] = out[out.length - 1].replace(/[,.]$/, '') + '.';
  return { words: out, real };
}
