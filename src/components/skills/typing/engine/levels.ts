/**
 * The spine of the text engine: which keys exist, in what order they open, and what Beginner, Intermediate and
 * Advanced mean. Everything that makes or judges text (Smart lessons, Practice, the library picker) reads this.
 * Our own design; none of it is a standard.
 */

/**
 * The order the keys open in, from easy to hard. It was chosen by measuring (see freetyper.md): the home row first,
 * the vowel A early (the first six keys F J D A S L already make real words such as sad, lad, ads), E next, the rest
 * of the home row, then the keys one reach away (I R U T N O C M W), and last the far and rare keys. Compared with
 * the older order (F J D K S L A E ...) it gives real words two keys sooner at almost the same reach cost, and
 * Advanced is exactly the far and rare keys. Same order as the guides.
 */
import { TUNING } from './tuning';

export const KEY_ORDER = 'fjdaslekghirutnocmwbypvxqz';

/** Everyone starts with ONE key (F) and earns the rest one at a time. */
export const START_KEYS = 1;

/**
 * While only a few keys are open the text cannot be real words, and with ONE key it would be "ffff". So the next
 * keys in the order are PREVIEWED: they appear in a little of the text, mostly as a way to see them. They do not
 * count toward unlocking and never show as weak. Previews stop once PREVIEW_UNTIL keys are open, by which time
 * real words (sad, fads, dads) fit. The share is in engine/words.ts.
 */
export const PREVIEW_UNTIL = 5;
/** Rounds are short only for the very first keys. */
export const SHORT_UNTIL = 3;
export const PREVIEW_COUNT = 2;

export function previewKeys(unlocked: number): string[] {
  return unlocked <= PREVIEW_UNTIL ? KEY_ORDER.slice(unlocked, unlocked + PREVIEW_COUNT).split('') : [];
}

/** The first rounds are short (a few seconds), so the narrow text is over quickly: about 12 letters with one key, 24 with two, 36 with three. */
export function shortRoundChars(unlocked: number): number | null {
  return unlocked <= SHORT_UNTIL ? 12 * unlocked : null;
}

/** Beginner, Intermediate and Advanced by how many keys are open. `from` is the first key count of a level. */
export const LEVELS = [
  { name: 'Beginner', from: START_KEYS },
  { name: 'Intermediate', from: 12 },
  { name: 'Advanced', from: 20 },
] as const;

export function levelIndex(unlocked: number): number {
  return unlocked >= LEVELS[2].from ? 2 : unlocked >= LEVELS[1].from ? 1 : 0;
}

/**
 * The hardest text a level gets (the 1 to 10 text difficulty): Beginner stops at 4 (letters only, no capitals and no
 * punctuation: those start at 5 and 6), Intermediate at 7, Advanced at 10. So a typist who types well on six keys gets
 * longer words, not capitals and commas, until the level changes.
 */
export function difficultyCap(unlocked: number): number {
  return [4, 7, 10][levelIndex(unlocked)];
}

export function levelName(unlocked: number): string {
  return LEVELS[levelIndex(unlocked)].name;
}

/** How many lines of text a level fills: Beginner 1, Intermediate 2, Advanced 3. */
export function linesForLevel(unlocked: number): number {
  return levelIndex(unlocked) + 1;
}

/**
 * What the NEXT key asks for before it opens. Easy keys open quickly and hard keys ask for more: the bar goes from 0.60
 * (the second key) to 0.70 (the last) and the presses each key needs from 5 to 8. The average score of the open keys
 * must reach the bar plus a margin, and no key may be far under the bar (see tryUnlock in smartEngine.ts and
 * engine/tuning.ts). `open` is how many keys are open now.
 */
export function unlockRequirement(open: number): { score: number; presses: number } {
  const t = Math.min(1, Math.max(0, open / (KEY_ORDER.length - 1)));
  const score = TUNING.unlockScoreFirst + (TUNING.unlockScoreLast - TUNING.unlockScoreFirst) * t;
  const presses = TUNING.unlockPressesFirst + (TUNING.unlockPressesLast - TUNING.unlockPressesFirst) * t;
  return { score: Math.round(score * 100) / 100, presses: Math.floor(presses + 0.01) };
}
