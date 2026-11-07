// Scoring and placement for the Aim tab (AimTrainer.tsx). No React, so Node can test it.
import type { Device } from './mouseData';

export type AimSize = 'large' | 'medium' | 'small';

/** Target diameters in px. Suggestions to tune after testing, not researched values. */
export const AIM_SIZES: Record<AimSize, number> = { large: 80, medium: 56, small: 36 };
export const AIM_SECONDS = 30;

export type AimEvent = { hit: boolean; reactionMs?: number };
export type AimResult = {
  hits: number;
  misses: number;
  /** Whole percent: hits / (hits + misses), 0 when nothing was clicked. */
  accuracy: number;
  avgReactionMs: number;
  /** hits - misses, never below 0. */
  score: number;
};

export function scoreRun(events: AimEvent[]): AimResult {
  const hitEvents = events.filter((e) => e.hit);
  const hits = hitEvents.length;
  const misses = events.length - hits;
  const reactions = hitEvents.map((e) => e.reactionMs).filter((r): r is number => typeof r === 'number');
  const avgReactionMs = reactions.length ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length) : 0;
  return {
    hits,
    misses,
    accuracy: events.length ? Math.round((hits / events.length) * 100) : 0,
    avgReactionMs,
    score: Math.max(0, hits - misses),
  };
}

/** Top-left of a target of diameter `d`, fully inside an area of areaW x areaH. */
export function randomTarget(areaW: number, areaH: number, d: number, rand: () => number = Math.random) {
  const maxX = Math.max(0, areaW - d);
  const maxY = Math.max(0, areaH - d);
  return { x: Math.floor(rand() * (maxX + 1)), y: Math.floor(rand() * (maxY + 1)) };
}

export function isNewBest(prev: number | undefined, score: number): boolean {
  return score > 0 && (prev === undefined || score > prev);
}

export function defaultSize(device: Device): AimSize {
  return device === 'trackpad' ? 'large' : 'medium';
}
