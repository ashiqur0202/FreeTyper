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
export const KEY_ORDER = 'fjdaslekghirutnocmwbypvxqz';

/** Everyone starts with ONE key (F) and earns the rest one at a time. */
export const START_KEYS = 1;

/** Beginner, Intermediate and Advanced by how many keys are open. `from` is the first key count of a level. */
export const LEVELS = [
  { name: 'Beginner', from: START_KEYS },
  { name: 'Intermediate', from: 12 },
  { name: 'Advanced', from: 20 },
] as const;

export function levelIndex(unlocked: number): number {
  return unlocked >= LEVELS[2].from ? 2 : unlocked >= LEVELS[1].from ? 1 : 0;
}

export function levelName(unlocked: number): string {
  return LEVELS[levelIndex(unlocked)].name;
}

/** How many lines of text a level fills: Beginner 1, Intermediate 2, Advanced 3. */
export function linesForLevel(unlocked: number): number {
  return levelIndex(unlocked) + 1;
}

/**
 * What the NEXT key asks for before it opens. Easy keys open quickly and hard keys ask for more: the score every
 * open key must reach goes from 0.65 (the second key) to 0.75 (the last), and the presses each key needs from 6
 * to 10. `open` is how many keys are open now.
 */
export function unlockRequirement(open: number): { score: number; presses: number } {
  const t = Math.min(1, Math.max(0, open / (KEY_ORDER.length - 1)));
  return { score: Math.round((0.65 + 0.1 * t) * 100) / 100, presses: 6 + Math.floor(t * 4.99) };
}
