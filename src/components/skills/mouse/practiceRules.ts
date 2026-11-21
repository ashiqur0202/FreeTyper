// Rules for the Mouse practice page (MouseTrainer.tsx): the skills, how hard each level is, when the level
// moves, where on the screen a person has most trouble, and what is saved. No React and no DOM, so Node can
// test it. Every number here (30 s rounds, level steps, pass marks, the 10 minute goal) is FreeTyper's own
// suggestion, not a researched standard.

export type SkillId = 'click' | 'dbl' | 'scroll' | 'drag' | 'switch' | 'moving' | 'follow' | 'shrink';
export type PickId = SkillId | 'mixed';

export const SKILL_IDS: SkillId[] = ['click', 'dbl', 'scroll', 'drag', 'switch', 'moving', 'follow', 'shrink'];

/**
 * `needs` is the Mouse lessons level whose skills this one practises. A skill is "suggested" once the
 * person has passed the level before it (Level 1 skills are always suggested). Nothing is locked.
 */
export const SKILLS: Record<SkillId, { name: string; blurb: string; job: string; needs: 1 | 2 | 3 | 4 }> = {
  click: { name: 'Click', blurb: 'Click circles fast', job: 'Click each circle as fast as you can. A new one appears at once.', needs: 1 },
  dbl: { name: 'Double-click', blurb: 'Two quick clicks', job: 'Double-click each circle: two quick clicks in a row. One click alone does not count.', needs: 1 },
  scroll: { name: 'Scroll', blurb: 'Find an item in a list', job: 'Read the item name at the top, scroll the list to find it, then click it.', needs: 1 },
  drag: { name: 'Drag', blurb: 'Drop the ball in the ring', job: 'Drag the ball into the dashed ring and let go inside it.', needs: 2 },
  switch: { name: 'Switch', blurb: 'Click the glowing one', job: 'Click the glowing circle. Another one lights up straight away.', needs: 2 },
  moving: { name: 'Moving', blurb: 'Catch moving targets', job: 'Click each target while it moves. Catch it before it bounces away.', needs: 3 },
  follow: { name: 'Follow', blurb: 'Stay on a moving dot', job: 'Keep your pointer inside the moving dot for as long as you can.', needs: 3 },
  shrink: { name: 'Shrinking', blurb: 'Hit before it shrinks', job: 'Click each target before it shrinks away. The smaller it gets, the harder it is.', needs: 4 },
};

export const MIXED_JOB = 'One round of every suggested skill in turn, then round again.';

export const ROUND_SECONDS = 30;
export const BREAK_SECONDS = 6;
export const DAILY_GOAL_MINUTES = 10;
export const DAILY_MIX_ROUNDS = 10;
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 10;
/** Every skill starts at the easiest level and gets harder as the person does well. */
export const START_LEVEL = 1;

/** Hits needed in a round before a good accuracy moves the level up. Fewer are normal for slower skills. */
export const MIN_HITS: Record<Exclude<SkillId, 'follow'>, number> = { click: 8, dbl: 6, scroll: 4, drag: 6, switch: 8, moving: 8, shrink: 8 };
export const LEVEL_UP_ACCURACY = 90;
export const LEVEL_DOWN_BELOW = 65;

const clampLevel = (l: number) => Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, Math.round(l)));

/** Target diameter in px. Harder levels are smaller. */
export function sizeFor(skill: SkillId, level: number): number {
  const L = clampLevel(level);
  switch (skill) {
    case 'click': return Math.max(16, Math.round(66 - 5 * L));
    case 'dbl': return Math.max(22, Math.round(72 - 5.5 * L));
    case 'switch': return Math.max(20, Math.round(56 - 3.5 * L));
    case 'drag': return Math.max(18, Math.round(46 - 2.8 * L));
    case 'moving': return Math.max(20, Math.round(68 - 4.5 * L));
    case 'shrink': return 72;
    case 'follow': return Math.max(24, Math.round(80 - 5.5 * L));
    default: return 48;
  }
}

/** Pixels per second for the moving target and the dot to follow. */
export const movingSpeed = (level: number) => 60 + 20 * clampLevel(level);
export const followSpeed = (level: number) => 70 + 25 * clampLevel(level);
/** How long a shrinking target lasts before it vanishes, in ms. */
export const shrinkMs = (level: number) => Math.max(900, 2600 - 170 * clampLevel(level));
/** Rows in the Scroll list and the height of each row in px. */
export const scrollRows = (level: number) => 40 + 12 * clampLevel(level);
export const scrollRowPx = (level: number) => Math.max(24, Math.round(46 - 2.2 * clampLevel(level)));

export type RoundResult = { hits: number; misses: number; onSeconds: number; offSeconds: number };

/** Whole-percent accuracy, or null when nothing was tried. Follow counts time on the dot. */
export function accuracyOf(skill: SkillId, r: RoundResult): number | null {
  if (skill === 'follow') {
    const t = r.onSeconds + r.offSeconds;
    return t > 0 ? Math.round((r.onSeconds / t) * 100) : null;
  }
  const d = r.hits + r.misses;
  return d > 0 ? Math.round((r.hits / d) * 100) : null;
}

/** The number to compare between rounds of the same skill: hits, or percent on the dot for Follow. */
export function mainScore(skill: SkillId, r: RoundResult): number {
  return skill === 'follow' ? accuracyOf(skill, r) ?? 0 : r.hits;
}

export type LevelMove = { level: number; change: -1 | 0 | 1 };

/** Level up on high accuracy (and enough hits), down on low accuracy, otherwise stay. A round with nothing tried changes nothing. */
export function adjustLevel(skill: SkillId, level: number, r: RoundResult): LevelMove {
  const L = clampLevel(level);
  const acc = accuracyOf(skill, r);
  const enough = skill === 'follow' || r.hits >= MIN_HITS[skill];
  if (acc !== null && acc >= LEVEL_UP_ACCURACY && enough && L < MAX_LEVEL) return { level: L + 1, change: 1 };
  if (acc !== null && acc < LEVEL_DOWN_BELOW && L > MIN_LEVEL) return { level: L - 1, change: -1 };
  return { level: L, change: 0 };
}

/* ---------- where on the screen a person has most trouble ---------- */

export const ZONE_NAMES = ['top left', 'top', 'top right', 'left', 'middle', 'right', 'bottom left', 'bottom', 'bottom right'];
export type ZoneCount = { n: number; f: number };

export const freshZones = (): ZoneCount[] => Array.from({ length: 9 }, () => ({ n: 0, f: 0 }));

/** Which of the 3 x 3 squares of a w x h area the point is in (0 to 8, row by row). */
export function zoneOf(x: number, y: number, w: number, h: number): number {
  if (w <= 0 || h <= 0) return 4;
  const col = Math.max(0, Math.min(2, Math.floor((x / w) * 3)));
  const row = Math.max(0, Math.min(2, Math.floor((y / h) * 3)));
  return row * 3 + col;
}

export const ZONE_MIN_TRIES = 8;

/** Share of tries in a square that were missed or slow; null until there are enough tries. */
export function troubleRate(z: ZoneCount): number | null {
  return z.n >= ZONE_MIN_TRIES ? z.f / z.n : null;
}

/** The square with the highest trouble rate, when it is above `floor`; otherwise null. */
export function weakestZone(zones: ZoneCount[], floor = 0.05): { index: number; rate: number } | null {
  let best: { index: number; rate: number } | null = null;
  for (let index = 0; index < zones.length; index++) {
    const rate = troubleRate(zones[index]);
    if (rate !== null && (best === null || rate > best.rate)) best = { index, rate };
  }
  return best !== null && best.rate > floor ? best : null;
}

/** A hit counts as "slow" when it took 1.6 times the round's average so far (needs 3 earlier hits). */
export function isSlow(ms: number, earlier: number[]): boolean {
  if (earlier.length < 3) return false;
  const avg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  return ms > avg * 1.6;
}

/* ---------- suggestions and rotation ---------- */

/** Suggested skills: those that practise a level already passed, or Level 1 for a new visitor. */
export function suggestedSkills(levelsPassed: number): SkillId[] {
  const reach = Math.max(1, levelsPassed);
  return SKILL_IDS.filter((k) => SKILLS[k].needs <= reach);
}

export function mixAt(list: SkillId[], i: number): SkillId {
  return list[((i % list.length) + list.length) % list.length];
}

/* ---------- saved data ---------- */

export type RoundRecord = { skill: SkillId; level: number; main: number; acc: number | null; at: number };
export type PracticeStore = {
  levels: Record<SkillId, number>;
  /** The local day (YYYY-MM-DD) that `seconds` belongs to. */
  day: string;
  seconds: number;
  rounds: RoundRecord[];
};

export const STORE_KEY = 'freetyper-mouse-practice';
export const MAX_SAVED_ROUNDS = 12;

export function defaultStore(): PracticeStore {
  const levels = {} as Record<SkillId, number>;
  for (const k of SKILL_IDS) levels[k] = START_LEVEL;
  return { levels, day: '', seconds: 0, rounds: [] };
}

export function dayKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

const isSkill = (v: unknown): v is SkillId => typeof v === 'string' && (SKILL_IDS as string[]).includes(v);

/** Read what was saved. Anything missing or wrong falls back to the defaults; nothing throws. */
export function parseStore(raw: string | null): PracticeStore {
  const base = defaultStore();
  if (!raw) return base;
  try {
    const p = JSON.parse(raw) as Partial<PracticeStore> | null;
    if (!p || typeof p !== 'object') return base;
    for (const k of SKILL_IDS) {
      const v = (p.levels as Record<string, unknown> | undefined)?.[k];
      if (typeof v === 'number' && Number.isFinite(v)) base.levels[k] = clampLevel(v);
    }
    if (typeof p.day === 'string') base.day = p.day;
    if (typeof p.seconds === 'number' && Number.isFinite(p.seconds) && p.seconds >= 0) base.seconds = p.seconds;
    if (Array.isArray(p.rounds)) {
      base.rounds = p.rounds
        .filter((r): r is RoundRecord => !!r && isSkill((r as RoundRecord).skill) && typeof (r as RoundRecord).main === 'number')
        .map((r) => ({ skill: r.skill, level: clampLevel(Number(r.level) || START_LEVEL), main: r.main, acc: typeof r.acc === 'number' ? r.acc : null, at: Number(r.at) || 0 }))
        .slice(-MAX_SAVED_ROUNDS);
    }
    return base;
  } catch {
    return base;
  }
}

/** Minutes of practice for today: the saved seconds count only when they belong to today. */
export function minutesToday(store: PracticeStore, today: string): number {
  return store.day === today ? store.seconds / 60 : 0;
}

/** Add one finished round: set the skill's new level, add its seconds to today, keep the latest rounds. */
export function addRound(store: PracticeStore, rec: RoundRecord, newLevel: number, seconds: number, today: string): PracticeStore {
  const sameDay = store.day === today;
  return {
    levels: { ...store.levels, [rec.skill]: clampLevel(newLevel) },
    day: today,
    seconds: (sameDay ? store.seconds : 0) + Math.max(0, seconds),
    rounds: [...store.rounds, rec].slice(-MAX_SAVED_ROUNDS),
  };
}

/** The result line for a round compared with the last round of the same skill, or null if there is none. */
export function compareWithLast(rounds: RoundRecord[], skill: SkillId, main: number): { diff: number; unit: 'hits' | 'points' } | null {
  for (let i = rounds.length - 1; i >= 0; i--) {
    if (rounds[i].skill === skill) return { diff: main - rounds[i].main, unit: skill === 'follow' ? 'points' : 'hits' };
  }
  return null;
}
