import { practiceTexts } from './typingData';
import { seededRandom } from './dailyChallenge';
import { DEFAULT_TEXT_LEVEL, generateSentences, generateWords, type TextLevel } from './textGenerator';
import { generateCode } from './engine/code';
import { factItems, quoteItems, type LibraryItem } from './engine/library';
import { rateDifficulty } from './engine/rating';
import { seeded, type Rand } from './engine/rng';

export type TextMode = 'words' | 'sentences' | 'quotes' | 'facts' | 'code' | 'mixed';

/**
 * The version of the way test texts are built, kept in challenge links (`g=2`; a link without `g` is version 1).
 * Version 1 had words and sentences from `textGenerator` and code from a few fixed snippets. Version 2 keeps words and
 * sentences exactly as they were, makes code with the code generator (`engine/code.ts`) and adds quotes, facts and
 * mixed. A link made under version 1 must keep giving the same text, so version 1 is
 * kept as it was: never change a released version, add a new one.
 */
export type TestTextVersion = 1 | 2;
export const TEST_TEXT_VERSION: TestTextVersion = 2;

/**
 * Words to build for a run of `seconds`: 5 per second (a 300 WPM budget), so a
 * 1-minute test builds 300 words, not the 1,500 a long run needs. Every character
 * is a DOM element, so a shorter passage makes the first load much lighter.
 * Runs of 5 minutes or more get the same amount as before; the timer still ends the test.
 */
function wordBudget(seconds: number, max: number): number {
  return Math.min(max, Math.max(300, Math.round(seconds * 5)));
}

/** About 5.7 characters per word with the space, the budget the library and code texts are filled to. */
function charBudget(seconds: number, maxWords: number): number {
  return Math.round(wordBudget(seconds, maxWords) * 5.7);
}

/** Fisher-Yates: a fair shuffle driven by `rand`, so a seeded source gives the same order every time. */
function shuffled<T>(items: readonly T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Version 1 code: fixed snippets, shuffled, joined until long enough. Kept so older challenge links still rebuild. */
function codeTextV1(seconds: number, rand: () => number): string {
  const codeTexts = practiceTexts.filter((p) => p.category === 'code');
  const chunks: string[] = [];
  const wantedWords = Math.min(800, Math.max(200, Math.round(wordBudget(seconds, 800) * 0.6)));
  while (chunks.join(' ').split(/\s+/).length < wantedWords) {
    chunks.push(...shuffled(codeTexts, rand).map((p) => p.text));
    if (codeTexts.length === 0) break;
  }
  return chunks.join(' ');
}

/** The code generator's levels: test levels 1 and 2 are Beginner, 3 and 4 Intermediate, 5 Advanced. */
function codeLevel(level: TextLevel): 0 | 1 | 2 {
  return level <= 2 ? 0 : level <= 4 ? 1 : 2;
}

/** Version 2 code: made fresh by the code generator, one language at a time, until the length is reached. */
function codeText(seconds: number, seed: string, level: TextLevel): string {
  const rand = seeded(`freetyper-test-code2|${seed}|${seconds}|${level}`);
  const goal = charBudget(seconds, 800);
  const parts: string[] = [];
  let total = 0;
  for (let guard = 0; total < goal && guard < 60; guard++) {
    const made = generateCode({ level: codeLevel(level), weight: () => 1, targetChars: Math.min(700, goal - total), rand });
    parts.push(made.text);
    total += made.text.length + 1;
  }
  return parts.join(' ');
}

/**
 * Items for a quotes or facts test, easiest to hardest by our difficulty rating: the level picks the part of that
 * order the test starts from (level 1 the easiest fifth, level 5 the hardest), with some seeded noise so the same
 * level does not show the same texts every time. When the library runs out (a long test) it is used again from the start.
 */
function libraryOrder(items: LibraryItem[], level: TextLevel, rand: Rand): LibraryItem[] {
  if (items.length === 0) return [];
  const rated = items.map((it) => ({ it, r: rateDifficulty(it.text) })).sort((a, b) => a.r - b.r);
  const target = (level - 0.5) / 5;
  return rated
    .map((x, i) => ({ it: x.it, score: Math.abs((i + 0.5) / rated.length - target) + rand() * 0.3 }))
    .sort((a, b) => a.score - b.score)
    .map((x) => x.it);
}

function libraryText(items: LibraryItem[], seconds: number, seed: string, level: TextLevel, kind: string): string {
  const rand = seeded(`freetyper-test-${kind}|${seed}|${seconds}|${level}`);
  const order = libraryOrder(items, level, rand);
  if (order.length === 0) return '';
  const goal = charBudget(seconds, 2000);
  const parts: string[] = [];
  let total = 0;
  for (let i = 0; total < goal; i++) {
    const text = order[i % order.length].text;
    parts.push(text);
    total += text.length + 1;
  }
  return parts.join(' ');
}

/** Mixed: short pieces of sentences, quotes, facts and code, never the same kind twice in a row (code less often). */
function mixedText(seconds: number, seed: string, level: TextLevel): string {
  const rand = seeded(`freetyper-test-mixed|${seed}|${seconds}|${level}`);
  const quotes = libraryOrder(quoteItems(), level, rand);
  const facts = libraryOrder(factItems(), level, rand);
  const goal = charBudget(seconds, 2000);
  const weights: [string, number][] = [['sentences', 3], ['quotes', 3], ['facts', 3], ['code', 1]];
  const parts: string[] = [];
  let total = 0;
  let prev = '';
  let qi = 0;
  let fi = 0;
  for (let i = 0; total < goal && i < 400; i++) {
    const options = weights.filter(([k]) => k !== prev);
    const sum = options.reduce((s, [, w]) => s + w, 0);
    let pick = rand() * sum;
    let kind = options[options.length - 1][0];
    for (const [k, w] of options) {
      pick -= w;
      if (pick <= 0) {
        kind = k;
        break;
      }
    }
    prev = kind;
    let piece = '';
    if (kind === 'quotes' && quotes.length) piece = quotes[qi++ % quotes.length].text;
    else if (kind === 'facts' && facts.length) piece = facts[fi++ % facts.length].text;
    else if (kind === 'code') piece = generateCode({ level: codeLevel(level), weight: () => 1, targetChars: 110, rand }).text;
    else piece = generateSentences(`${seed}|mix|${i}`, level, 14);
    parts.push(piece);
    total += piece.length + 1;
  }
  return parts.join(' ');
}

/**
 * The same text for the same seed, mode, length, level and version, on any device. Words, sentences and code are
 * made fresh by their generators (never a fixed passage); quotes and facts are picked from the checked libraries
 * in an order drawn from the seed (a made-up quote or fact would be false, so they are never generated); mixed
 * joins pieces of all of them. Every speed test is built this way (with a new seed), so a finished run can be sent as a
 * challenge link: the friend's page rebuilds the text from the link's seed, mode, length, level and version.
 */
export function seededTestText(
  mode: TextMode,
  seconds: number,
  seed: string,
  level: TextLevel = DEFAULT_TEXT_LEVEL,
  version: TestTextVersion = TEST_TEXT_VERSION,
): string {
  if (mode === 'sentences') return generateSentences(`${seed}|${seconds}`, level, wordBudget(seconds, 1500));
  if (mode === 'words') return generateWords(`${seed}|${seconds}`, level, wordBudget(seconds, 2000));
  if (mode === 'code') return version === 1 ? codeTextV1(seconds, seededRandom(`freetyper-test-code-${seconds}-${seed}`)) : codeText(seconds, seed, level);
  if (mode === 'quotes') return libraryText(quoteItems(), seconds, seed, level, 'quotes');
  if (mode === 'facts') return libraryText(factItems(), seconds, seed, level, 'facts');
  return mixedText(seconds, seed, level);
}

/** A text from a random source, without a seed to send (the generator needs a seed, so it is drawn from `rand`). */
export function generateTestText(
  mode: TextMode,
  seconds = 60,
  rand: () => number = Math.random,
  level: TextLevel = DEFAULT_TEXT_LEVEL,
): string {
  return seededTestText(mode, seconds, Math.floor(rand() * 0xffffffff).toString(36), level);
}

