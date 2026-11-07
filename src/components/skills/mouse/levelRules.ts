// Levels, pass marks and geometry for the Mouse practice ladder. No React, so Node can test it.
// Every pass mark here is FreeTyper's own suggestion, not a researched standard.

export type LevelId = 1 | 2 | 3 | 4;

export const LEVEL_ITEMS: Record<LevelId, string[]> = {
  1: ['move', 'click', 'double', 'right', 'drag', 'scroll', 'mixed'],
  2: ['small', 'precise', 'hold', 'select', 'find'],
  3: ['moving', 'steer', 'quick', 'menu', 'sort'],
  4: ['gauntlet', 'shrink', 'tiny'],
};

export const LEVEL_NAMES: Record<LevelId, { level: string; rank: string }> = {
  1: { level: 'Beginner', rank: 'Beginner' },
  2: { level: 'Comfortable', rank: 'Comfortable' },
  3: { level: 'Skilled', rank: 'Skilled' },
  4: { level: 'Mastery', rank: 'Master' },
};

export const LEVEL_IDS: LevelId[] = [1, 2, 3, 4];

/** Percent accuracy for the target drills, steering time inside the path, and score targets. */
export const PASS = { small: 80, steer: 85, tiny: 90, gauntlet: 15, shrink: 15 } as const;

export const GAUNTLET_SECONDS = 60;
export const SHRINK_SECONDS = 30;
export const SHRINK_START = 80;
export const SHRINK_STEP = 4;
export const SHRINK_MIN = 24;

export function isLevelPassed(level: LevelId, done: readonly string[]): boolean {
  return LEVEL_ITEMS[level].every((id) => done.includes(id));
}

export function isLevelUnlocked(level: LevelId, done: readonly string[]): boolean {
  return level === 1 || isLevelPassed((level - 1) as LevelId, done);
}

/** Highest level passed in order, as a rank name; null when Level 1 is not passed yet. */
export function rankOf(done: readonly string[]): string | null {
  let rank: string | null = null;
  for (const l of LEVEL_IDS) {
    if (!isLevelPassed(l, done)) break;
    rank = LEVEL_NAMES[l].rank;
  }
  return rank;
}

/** Index of the first unfinished drill in a level, or -1 when the level is complete. */
export function firstOpenIndex(level: LevelId, done: readonly string[]): number {
  return LEVEL_ITEMS[level].findIndex((id) => !done.includes(id));
}

export function meetsAccuracy(hits: number, misses: number, minPercent: number): boolean {
  const total = hits + misses;
  return total > 0 && (hits / total) * 100 >= minPercent;
}

export type Pt = { x: number; y: number };

export function distToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Percent (whole number) of points within halfWidth of the polyline; 0 when there are none. */
export function insideRatio(points: Pt[], poly: Pt[], halfWidth: number): number {
  if (!points.length) return 0;
  const inside = points.filter((p) =>
    poly.some((a, i) => i < poly.length - 1 && distToSegment(p.x, p.y, a.x, a.y, poly[i + 1].x, poly[i + 1].y) <= halfWidth),
  ).length;
  return Math.round((inside / points.length) * 100);
}

export function scalePath(unit: Pt[], w: number, h: number): Pt[] {
  return unit.map((p) => ({ x: p.x * w, y: p.y * h }));
}

export type Mover = { x: number; y: number; vx: number; vy: number };

function bounce(pos: number, vel: number, dt: number, max: number): { p: number; v: number } {
  if (max <= 0) return { p: 0, v: vel };
  const u = pos + vel * dt;
  const k = Math.floor(u / max);
  const r = u - k * max;
  const odd = ((k % 2) + 2) % 2 === 1;
  return odd ? { p: max - r, v: -vel } : { p: r, v: vel };
}

/** Advance a target by dt seconds inside w x h, reflecting off the walls (diameter d). */
export function stepTarget(t: Mover, dt: number, w: number, h: number, d: number): Mover {
  const x = bounce(t.x, t.vx, dt, w - d);
  const y = bounce(t.y, t.vy, dt, h - d);
  return { x: x.p, y: y.p, vx: x.v, vy: y.v };
}

export function shrinkDiameter(hits: number): number {
  return Math.max(SHRINK_MIN, SHRINK_START - SHRINK_STEP * hits);
}

export function gauntletScore(correct: number, wrong: number): number {
  return Math.max(0, correct - wrong);
}
