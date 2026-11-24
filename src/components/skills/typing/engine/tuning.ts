/**
 * Every adjustable number of the adaptive engine, in one place. The values below are the defaults the site uses.
 * They were compared by simulation (scripts/text-engine/simulate.js, results in freetyper.md): simulated typists
 * who learn by the power law of practice are run through the real engine with different values, and the values
 * that learn fastest without frustrating or boring the typist are kept (2026-11-24: the AVERAGE unlock rule with
 * the 0.60-0.70 ramp won against the "every key" rule). Change a number only with that script.
 *
 * It is an object, not constants, so the simulation can try other values.
 */
export const TUNING = {
  /** How fast a key's accuracy and speed follow the latest text (0 to 1): Smart lessons rounds, and Practice texts. */
  emaRound: 0.4,
  emaText: 0.35,

  /** A key is "unlocked next" once every open key scores at least this, from the second key to the last... */
  unlockScoreFirst: 0.6,
  unlockScoreLast: 0.7,
  /** ...and has been typed at least this many times (same ramp). */
  unlockPressesFirst: 5,
  unlockPressesLast: 8,

  /** false: every open key must reach the score. true: the AVERAGE score of the open keys must reach it plus unlockMeanBonus, and no key may be more than unlockFloorGap below it. */
  unlockByAverage: true,
  unlockMeanBonus: 0.07,
  unlockFloorGap: 0.1,
  /** With the average rule: at most this many open keys may sit below the score (the rest must reach it). */
  unlockAllowLow: 99,

  /** Weights of keys in the next text: a new key, a key to fix, a key almost there, a key kept for review. */
  freshWeight: 4,
  focusWeight: 5,
  almostWeight: 2.5,
  reviewWeight: 2,
  /** Smart lessons: weight of a key is 1 + lessonWeakBoost * (1 - score). */
  lessonWeakBoost: 5,
  /** A key below this score is a key to fix; from almostFrom up to it, "almost there". */
  focusBelow: 0.8,
  almostFrom: 0.65,

  /** Difficulty goes up after a text this accurate at this speed (relative to the typist's own yardstick)... */
  upAccuracy: 95,
  upRatio: 0.85,
  /** ...or after a text this accurate even when slow... */
  upHighAccuracy: 97.5,
  upHighRatio: 0.6,
  /** ...and down after a text below this accuracy. */
  downAccuracy: 88,
};

export type Tuning = typeof TUNING;
export const DEFAULT_TUNING: Tuning = { ...TUNING };
