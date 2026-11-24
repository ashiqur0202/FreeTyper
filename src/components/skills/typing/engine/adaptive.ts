import { generateSentences } from './sentences';
import { generateWordList } from './words';
import { levelIndex } from './levels';
import type { Rand } from './rng';

/**
 * Text for the typist's own plan (Smart lessons and the adaptive tab): words or sentences, chosen by level.
 * Beginner is words (best for drilling single keys). From Intermediate on, some segments are real sentences when
 * the open keys can make them, and most are at Advanced. When the keys cannot make a sentence it is words.
 */

export interface AdaptiveRequest {
  open: ReadonlySet<string>;
  weight: (letter: string) => number;
  difficulty: number;
  /** How many keys are open: this decides the level. */
  unlocked: number;
  words?: number;
  targetChars?: number;
  rand: Rand;
}

export interface AdaptiveText {
  text: string;
  /** Words that are real words (not made-up letter groups), or the number of real words in the sentences. */
  real: number;
  kind: 'words' | 'sentences';
}

/** Chance that a segment is sentences, by level: Beginner 0, Intermediate 0.5, Advanced 0.85. */
const SENTENCE_SHARE = [0, 0.5, 0.85] as const;

export function generateAdaptiveText(req: AdaptiveRequest): AdaptiveText {
  const lvl = levelIndex(req.unlocked);
  // sentences only when a length in letters is asked for (a Practice segment), not for a fixed word count
  if (req.targetChars !== undefined && req.rand() < SENTENCE_SHARE[lvl]) {
    const text = generateSentences({
      open: req.open,
      weight: req.weight,
      difficulty: req.difficulty,
      targetChars: req.targetChars,
      rand: req.rand,
    });
    if (text && text.length >= req.targetChars * 0.6) {
      return { text, real: text.split(' ').length, kind: 'sentences' };
    }
  }
  const { words, real } = generateWordList({
    open: req.open,
    weight: req.weight,
    difficulty: req.difficulty,
    words: req.words,
    targetChars: req.targetChars,
    rand: req.rand,
  });
  return { text: words.join(' '), real, kind: 'words' };
}
