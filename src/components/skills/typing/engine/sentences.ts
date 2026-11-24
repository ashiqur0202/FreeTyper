import { pickOne, pickWeighted, type Rand } from './rng';
import { isBlockedWord } from './quality';
import {
  ADJECTIVES,
  ADVERBS,
  DETERMINERS,
  NOUNS,
  prepositionsFor,
  SUBJECT_PRONOUNS_PLURAL,
  SUBJECT_PRONOUNS_THIRD,
  TIME_PHRASES,
  UNCOUNTABLE,
  VERBS,
  type NounClass,
  type Verb,
} from './lexicon';

/**
 * Builds made-up everyday sentences from the word bank, using ONLY letters the typist has open. A sentence is
 * made of slots (who, does what, to what, where, when); every slot is filled from words that fit it and whose
 * letters are all open, favouring the keys the typist needs to practise. If a slot cannot be filled the
 * sentence is dropped and another shape is tried; if nothing works the caller falls back to plain words.
 *
 * What grows with the difficulty (1 to 10): one adjective, then two; a second clause; times and places; past
 * tense; a capital letter at the start (from 5); a comma before "and" (from 6); questions (from 7).
 */

export interface SentenceRequest {
  /** Letters that may appear (lower case). */
  open: ReadonlySet<string>;
  /** How much a letter should be practised: higher is more. */
  weight: (letter: string) => number;
  difficulty: number;
  /** Stop once the text has at least this many letters. */
  targetChars: number;
  rand: Rand;
}

interface Ctx {
  open: ReadonlySet<string>;
  weight: (letter: string) => number;
  d: number;
  rand: Rand;
}

const VOWELS = 'aeiou';

function ok(ctx: Ctx, word: string): boolean {
  for (const ch of word) if (ch >= 'a' && ch <= 'z' && !ctx.open.has(ch)) return false;
  return !isBlockedWord(word);
}

function wordWeight(ctx: Ctx, word: string): number {
  let sum = 0;
  let n = 0;
  for (const ch of word) {
    if (ch >= 'a' && ch <= 'z') {
      sum += ctx.weight(ch);
      n++;
    }
  }
  return Math.pow(sum / Math.max(1, n), 1.5);
}

function pickWord<T>(ctx: Ctx, items: readonly T[], text: (x: T) => string): T | null {
  const usable = items.filter((x) => ok(ctx, text(x)));
  if (usable.length === 0) return null;
  return pickWeighted(usable, (x) => wordWeight(ctx, text(x)), ctx.rand);
}

interface NP {
  text: string;
  cls: NounClass;
  /** A noun phrase for a person or an animal can take he/she/they later; kept simple here. */
  noun: string;
}

/** "the old baker", "an empty box". `classes` are the kinds of noun that fit the slot. */
function nounPhrase(ctx: Ctx, classes: NounClass[], adjectives: number): NP | null {
  const withWords = classes.filter((c) => NOUNS[c].some((n) => ok(ctx, n)));
  if (withWords.length === 0) return null;
  const cls = pickOne(withWords, ctx.rand);
  const noun = pickWord(ctx, NOUNS[cls], (n) => n);
  if (!noun) return null;
  const adjs: string[] = [];
  const axes: string[] = [];
  for (let i = 0; i < adjectives; i++) {
    const a = pickWord(
      ctx,
      ADJECTIVES.filter((x) => x.for.includes(cls) && !adjs.includes(x.word) && !(x.axis && axes.includes(x.axis))),
      (x) => x.word,
    );
    if (!a) break;
    adjs.push(a.word);
    if (a.axis) axes.push(a.axis);
  }
  const det = pickWord(
    ctx,
    DETERMINERS.filter((x) => (x !== 'a' || ok(ctx, 'an') || ok(ctx, 'a')) && !(x === 'a' && UNCOUNTABLE.has(noun))),
    (x) => x,
  );
  if (!det) return null;
  const first = adjs[0] ?? noun;
  let d = det;
  if (d === 'a') d = VOWELS.includes(first[0]) ? 'an' : 'a';
  if (!ok(ctx, d)) return null;
  return { text: [d, ...adjs, noun].join(' '), cls, noun };
}

function adjectivesFor(ctx: Ctx): number {
  if (ctx.d >= 7) return ctx.rand() < 0.5 ? 2 : 1;
  if (ctx.d >= 3) return ctx.rand() < 0.5 ? 1 : 0;
  return 0;
}

function pickVerb(ctx: Ctx, needsObject: boolean, subjectClass: NounClass): Verb | null {
  const choices = VERBS.filter((v) => v.subj.includes(subjectClass) && (needsObject ? !!v.obj : !v.obj));
  return pickWord(ctx, choices, (v) => v.base);
}

function conjugate(ctx: Ctx, v: Verb, plural: boolean, past: boolean): string | null {
  const form = past ? v.past : plural ? v.base : v.third;
  return ok(ctx, form) ? form : null;
}

interface Subject {
  text: string;
  cls: NounClass;
  plural: boolean;
  noun?: string;
}

function subject(ctx: Ctx, classes: NounClass[]): Subject | null {
  // now and then a pronoun, which needs fewer letters (he, she, we, they)
  if (classes.includes('person') && ctx.rand() < 0.25) {
    const pool = [...SUBJECT_PRONOUNS_THIRD.map((p) => ({ p, plural: false })), ...SUBJECT_PRONOUNS_PLURAL.map((p) => ({ p, plural: true }))];
    const usable = pool.filter((x) => ok(ctx, x.p));
    if (usable.length) {
      const x = pickOne(usable, ctx.rand);
      return { text: x.p, cls: 'person', plural: x.plural };
    }
  }
  const np = nounPhrase(ctx, classes, adjectivesFor(ctx));
  return np ? { text: np.text, cls: np.cls, plural: false, noun: np.noun } : null;
}

function placePhrase(ctx: Ctx): string | null {
  if (!ok(ctx, 'the')) return null;
  const place = pickWord(ctx, NOUNS.place, (p) => p);
  if (!place) return null;
  const prep = pickWord(ctx, prepositionsFor(place), (p) => p);
  return prep ? `${prep} the ${place}` : null;
}

function timePhrase(ctx: Ctx): string | null {
  return pickWord(ctx, TIME_PHRASES, (t) => t);
}

function adverb(ctx: Ctx): string | null {
  return pickWord(ctx, ADVERBS, (a) => a);
}

/** One clause: who does what (to what), with the extras the difficulty allows. No capital and no end mark. */
function clause(ctx: Ctx, kind: 'iv' | 'tv' | 'ivPlace' | 'tvPlace' | 'tvTime'): string | null {
  const needsObject = kind === 'tv' || kind === 'tvPlace' || kind === 'tvTime';
  // subjects that can do something: people and animals, or the weather and the sky for the no-object verbs
  const subjectClasses: NounClass[] = needsObject ? ['person', 'animal'] : ['person', 'animal', 'sky', 'weather', 'plant', 'water', 'land'];
  const s = subject(ctx, subjectClasses);
  if (!s) return null;
  const v = pickVerb(ctx, needsObject, s.cls);
  if (!v) return null;
  const past = ctx.d >= 4 && ctx.rand() < 0.35;
  const form = conjugate(ctx, v, s.plural, past);
  if (!form) return null;
  const parts = [s.text, form];
  if (needsObject && v.obj) {
    const o = nounPhrase(ctx, v.obj, adjectivesFor(ctx));
    if (!o || o.noun === s.noun) return null;
    parts.push(o.text);
  } else if ((s.cls === 'person' || s.cls === 'animal') && ctx.d >= 2 && ctx.rand() < 0.5) {
    const a = adverb(ctx);
    if (a) parts.push(a);
  }
  if (kind === 'ivPlace' || kind === 'tvPlace') {
    // only people and animals are somewhere; the sea does not flow in the school
    if (s.cls !== 'person' && s.cls !== 'animal') return null;
    const p = placePhrase(ctx);
    if (!p) return null;
    parts.push(p);
  }
  if (kind === 'tvTime') {
    const t = timePhrase(ctx);
    if (!t) return null;
    parts.push(t);
  }
  return parts.join(' ');
}

function question(ctx: Ctx): string | null {
  // "Does the baker bake bread?"  (the verb after "does" is the base form)
  if (!ok(ctx, 'does')) return null;
  const s = nounPhrase(ctx, ['person', 'animal'], adjectivesFor(ctx));
  if (!s) return null;
  const v = pickVerb(ctx, true, s.cls);
  if (!v || !ok(ctx, v.base)) return null;
  const o = nounPhrase(ctx, v.obj ?? [], 0);
  return o ? `does ${s.text} ${v.base} ${o.text}` : null;
}

type Shape = { kind: 'iv' | 'tv' | 'ivPlace' | 'tvPlace' | 'tvTime' | 'compound' | 'question'; from: number; weight: number };

const SHAPES: Shape[] = [
  { kind: 'iv', from: 1, weight: 3 },
  { kind: 'tv', from: 1, weight: 3 },
  { kind: 'ivPlace', from: 2, weight: 2 },
  { kind: 'tvPlace', from: 3, weight: 2 },
  { kind: 'tvTime', from: 4, weight: 2 },
  { kind: 'compound', from: 6, weight: 2 },
  { kind: 'question', from: 7, weight: 1 },
];

function oneSentence(ctx: Ctx): string | null {
  const shapes = SHAPES.filter((s) => ctx.d >= s.from);
  const shape = pickWeighted(shapes, (s) => s.weight, ctx.rand);
  let body: string | null;
  let end = '.';
  if (shape.kind === 'compound') {
    const a = clause(ctx, pickOne(['iv', 'tv', 'ivPlace'] as const, ctx.rand));
    const b = clause(ctx, pickOne(['iv', 'tv'] as const, ctx.rand));
    const joiner = ctx.rand() < 0.75 ? 'and' : 'but';
    body = a && b && ok(ctx, joiner) ? `${a},${' ' + joiner} ${b}` : null;
    if (body && ctx.d < 6) body = body.replace(',', '');
  } else if (shape.kind === 'question') {
    body = question(ctx);
    end = '?';
  } else {
    body = clause(ctx, shape.kind);
  }
  if (!body) return null;
  if (ctx.d >= 5) body = body.charAt(0).toUpperCase() + body.slice(1);
  return body + end;
}

/**
 * Sentences until about `targetChars` letters. Returns null when the open keys cannot make a real sentence at
 * all (a few keys open), so the caller can use plain words instead. When it manages some sentences but not
 * enough, it returns what it has.
 */
export function generateSentences(req: SentenceRequest): string | null {
  const ctx: Ctx = { open: req.open, weight: req.weight, d: Math.min(10, Math.max(1, Math.round(req.difficulty))), rand: req.rand };
  const out: string[] = [];
  let total = 0;
  let misses = 0;
  while (total < req.targetChars && misses < 60) {
    // a few candidates, then the one that practises the most
    let best: string | null = null;
    let bestScore = -1;
    for (let i = 0; i < 5; i++) {
      const s = oneSentence(ctx);
      if (!s || out.includes(s)) continue;
      const sc = wordWeight(ctx, s.toLowerCase().replace(/[^a-z]/g, '')) * (0.6 + ctx.rand() * 0.8);
      if (sc > bestScore) {
        best = s;
        bestScore = sc;
      }
    }
    if (!best) {
      misses++;
      continue;
    }
    out.push(best);
    total += best.length + 1;
  }
  return out.length ? out.join(' ') : null;
}
