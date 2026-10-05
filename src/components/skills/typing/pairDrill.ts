import { COURSE_WORDS } from './courseWords';

/**
 * Builds a practice passage from real words that contain the user's weakest
 * letter pairs.
 *
 *  1. Every weak pair is guaranteed up to `MIN_WORDS_PER_PAIR` words that contain it.
 *  2. The rest is filled by weighted random choice: a word is more likely the
 *     more weak pairs it holds, and weaker pairs weigh more.
 *  3. A pair that almost no word contains (like "qz") gets short repeated chunks.
 *  4. The same word never appears twice in a row.
 */

const MIN_WORDS_PER_PAIR = 3;
const WORD_COUNT = 40;
/** A pair with fewer matching words than this also gets a repeated chunk. */
const THIN_PAIR_WORDS = 3;

function countPair(word: string, pair: string): number {
  let count = 0;
  for (let i = 0; i + 1 < word.length; i++) {
    if (word[i] === pair[0] && word[i + 1] === pair[1]) count++;
  }
  return count;
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface PairDrill {
  text: string;
  /** Pairs that really appear in the text, strongest focus first. */
  pairs: string[];
}

/** `pairs` is ordered weakest first. */
export function generatePairDrill(
  pairs: string[],
  rand: () => number = Math.random,
  words: string[] = COURSE_WORDS,
  wordCount = WORD_COUNT,
): PairDrill {
  const weights = new Map<string, number>();
  pairs.forEach((p, i) => weights.set(p, pairs.length - i));

  const weighted = words
    .map((word) => {
      let weight = 0;
      for (const [pair, w] of weights) weight += countPair(word, pair) * w;
      return { word, weight };
    })
    .filter((w) => w.weight > 0);

  const chosen: string[] = [];
  const used = new Set<string>();

  // 1. Every pair gets its own words first.
  for (const pair of pairs) {
    const holders = shuffle(
      weighted.filter((w) => w.word.includes(pair)),
      rand,
    ).sort((a, b) => b.weight - a.weight);
    let added = 0;
    for (const h of holders) {
      if (added >= MIN_WORDS_PER_PAIR) break;
      if (used.has(h.word)) continue;
      chosen.push(h.word);
      used.add(h.word);
      added++;
    }
  }

  // 3. Thin pairs get a repeated chunk so they are still practised.
  const chunks: string[] = [];
  for (const pair of pairs) {
    const holders = weighted.filter((w) => w.word.includes(pair)).length;
    if (holders < THIN_PAIR_WORDS) chunks.push(`${pair}${pair} ${pair}${pair}${pair}`);
  }

  // 2. Fill the rest by weight.
  const total = weighted.reduce((sum, w) => sum + w.weight, 0);
  const pickWeighted = (): string => {
    let r = rand() * total;
    for (const w of weighted) {
      r -= w.weight;
      if (r <= 0) return w.word;
    }
    return weighted[weighted.length - 1].word;
  };

  const sequence = shuffle([...chosen, ...chunks], rand);
  if (weighted.length > 0) {
    let guard = 0;
    while (sequence.length < wordCount && guard++ < wordCount * 20) {
      const w = pickWeighted();
      // 4. no immediate repeats
      if (sequence[sequence.length - 1] === w) continue;
      sequence.push(w);
    }
  }
  // Remove any adjacent repeats that the shuffle created.
  const text = sequence.filter((w, i) => i === 0 || w !== sequence[i - 1]).slice(0, Math.max(wordCount, chosen.length + chunks.length)).join(' ');

  const present = pairs.filter((p) => text.includes(p));
  return { text, pairs: present };
}
