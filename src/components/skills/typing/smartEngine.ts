import { COURSE_WORDS } from './courseWords';

/**
 * The engine behind Smart lessons: no fixed lesson list. Keys unlock one at a time by skill, and the
 * text of every round follows how the last rounds went. Pure functions plus load/save, so the UI
 * (SmartLessons.tsx) stays thin. If a rule here changes, update the Lessons guide in the same commit.
 *
 * The Practice page (AdaptivePractice.tsx) uses the same keys and the same unlock rule, plus a session plan.
 *
 * All numbers below are starting guesses (see freetyper.md); nothing here is tested on real learners.
 */

type Rand = () => number;

export const SMART_KEY = 'freetyper-smart-progress';
/** Unlock order: home row first, then the keys that make the most real words. */
export const KEY_ORDER = 'fjdkslaeghiortunmcbwypvqxz';
export const START_KEYS = 6;
/** Speed target per key in ms (about 33 wpm), used only until the typist has data. After that the yardstick is their own median. */
export const TARGET_MS = 360;
export const ROUND_WORDS = 12;
/** Practice: a segment without a measured screen is about this many words; the screen sets the real length. */
export const SEGMENT_WORDS = 8;
export const SESSION_SEGMENTS = 4;
/** A key needs this many presses before it can count as learned. */
export const SETTLED_PRESSES = 6;
/** Every key in play needs this score (0 to 1) before the next key unlocks. */
export const UNLOCK_SCORE = 0.7;
export const MAX_DIFFICULTY = 10;
export const HISTORY_MAX = 30;
/** The daily goal shown on the Smart lessons page, in minutes. It does not follow the sidebar goal. */
export const SMART_GOAL_MINUTES = 30;

export interface KeyState {
  /** Presses so far. */
  n: number;
  /** Smoothed accuracy, 0 to 1. */
  acc: number;
  /** Smoothed time into the key in ms. */
  ms: number;
  /** The round or session number this key was last typed in (used to pick review keys). */
  last?: number;
}

export interface RoundSummary {
  accuracy: number;
  wpm: number;
  /** Difficulty change after this round: 1 harder, -1 easier, 0 held. */
  dir: -1 | 0 | 1;
  difficulty: number;
  keys: number;
  unlockedKey?: string;
}

export interface SmartState {
  version: 1;
  /** How many keys of KEY_ORDER are open. */
  unlocked: number;
  /** 1 (easiest) to MAX_DIFFICULTY. */
  difficulty: number;
  rounds: number;
  keys: Record<string, KeyState>;
  history: RoundSummary[];
}

export interface KeySample {
  key: string;
  correct: boolean;
  /** Ms since the previous keystroke; undefined at the start or after a Backspace. */
  gapMs?: number;
}

export const LEVELS = [
  { name: 'Beginner', from: START_KEYS },
  { name: 'Intermediate', from: 12 },
  { name: 'Advanced', from: 20 },
] as const;

export function levelIndex(unlocked: number): number {
  return unlocked >= LEVELS[2].from ? 2 : unlocked >= LEVELS[1].from ? 1 : 0;
}

export function emptyState(): SmartState {
  return { version: 1, unlocked: START_KEYS, difficulty: 2, rounds: 0, keys: {}, history: [] };
}

const keyOf = (state: SmartState, k: string): KeyState => state.keys[k] ?? { n: 0, acc: 1, ms: TARGET_MS * 2 };

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** The speed a key is judged against: 95% of the typist's own median time per key (TARGET_MS before there is data). */
export function yardstick(state: SmartState): number {
  const seen = KEY_ORDER.slice(0, state.unlocked)
    .split('')
    .map((k) => state.keys[k])
    .filter((k) => k && k.n > 0)
    .map((k) => k.ms);
  return seen.length ? median(seen) * 0.95 : TARGET_MS;
}

/** 0 to 1: accuracy counts most, speed less. 0 for a key never typed. */
export function mastery(state: SmartState, k: string): number {
  const s = state.keys[k];
  if (!s || s.n === 0) return 0;
  return Math.pow(s.acc, 3) * (0.6 + 0.4 * Math.min(1, yardstick(state) / s.ms));
}

export function openKeys(state: SmartState): string[] {
  return KEY_ORDER.slice(0, state.unlocked).split('');
}

export interface Focus {
  /** The newest key while it still has too few presses. */
  fresh: string[];
  /** Up to three open keys that score lowest. */
  weak: string[];
}

export function focusOf(state: SmartState): Focus {
  const newest = KEY_ORDER[state.unlocked - 1];
  const fresh = state.rounds > 0 && state.unlocked > START_KEYS && keyOf(state, newest).n < SETTLED_PRESSES ? [newest] : [];
  const weak = openKeys(state)
    .filter((k) => keyOf(state, k).n >= SETTLED_PRESSES && mastery(state, k) < 0.8)
    .sort((a, b) => mastery(state, a) - mastery(state, b))
    .slice(0, 3);
  return { fresh, weak };
}

function weightOf(state: SmartState, k: string): number {
  if (keyOf(state, k).n < SETTLED_PRESSES) return 4;
  return 1 + 5 * (1 - mastery(state, k));
}

function pickWeighted<T>(items: T[], weight: (x: T) => number, rand: Rand): T {
  let sum = 0;
  const ws = items.map((x) => {
    const w = weight(x);
    sum += w;
    return w;
  });
  let r = rand() * sum;
  for (let i = 0; i < items.length; i++) {
    r -= ws[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function pseudoWord(weight: (k: string) => number, keys: string[], target: number, rand: Rand): string {
  const vowels = keys.filter((k) => 'aeiou'.includes(k));
  const cons = keys.filter((k) => !'aeiou'.includes(k));
  const len = Math.max(3, Math.round(target + (rand() * 2 - 1)));
  let word = '';
  let useVowel = rand() < 0.4;
  for (let i = 0; i < len; i++) {
    const pool = useVowel && vowels.length ? vowels : cons.length ? cons : vowels;
    word += pickWeighted(pool, weight, rand);
    useVowel = !useVowel;
  }
  return word;
}

export interface RoundText {
  text: string;
  /** How many of the words are real words (the rest are made-up letter groups). */
  realWords: number;
}

function buildText(state: SmartState, weight: (k: string) => number, size: { words?: number; chars?: number }, rand: Rand): RoundText {
  const keys = openKeys(state);
  const open = new Set(keys);
  const target = 3 + state.difficulty * 0.45;
  const pool = COURSE_WORDS.filter((w) => [...w].every((c) => open.has(c)));
  const out: string[] = [];
  let prev = '';
  let realWords = 0;
  const maxWords = size.words ?? 80;
  const maxChars = size.chars ?? Infinity;
  let total = 0;
  for (let i = 0; i < maxWords && total < maxChars; i++) {
    let w: string;
    if (pool.length >= 10 && rand() < 0.85) {
      w = pickWeighted(
        pool,
        (x) => {
          let s = 0;
          for (const c of x) s += weight(c);
          const d = x.length - target;
          const v = Math.pow(s / x.length, 1.5) * Math.exp(-(d * d) / 6);
          return x === prev ? v * 0.05 : v;
        },
        rand,
      );
      realWords++;
    } else {
      w = pseudoWord(weight, keys, target, rand);
    }
    prev = w;
    if (state.difficulty >= 5 && rand() < (state.difficulty - 4) * 0.05) w = w.charAt(0).toUpperCase() + w.slice(1);
    if (state.difficulty >= 6 && rand() < (state.difficulty - 5) * 0.05) w += rand() < 0.5 ? ',' : '.';
    out.push(w);
    total += w.length + 1;
  }
  out[out.length - 1] = out[out.length - 1].replace(/[,.]$/, '') + '.';
  return { text: out.join(' '), realWords };
}

/** The text for the next Smart lessons round: only open keys, weak keys more often, harder as difficulty rises. */
export function generateRoundText(state: SmartState, rand: Rand = Math.random): RoundText {
  return buildText(state, (k) => weightOf(state, k), { words: ROUND_WORDS }, rand);
}

/** How many lines of text a Practice segment fills: Beginner 1, Intermediate 2, Advanced 3. */
export function segmentLines(state: SmartState): number {
  return levelIndex(state.unlocked) + 1;
}

/**
 * One Practice segment, weighted by the session plan (focus 5, almost there 2.5, review 2, the rest 1).
 * It runs until it holds about `targetChars` letters, which the screen turns into whole lines (see segmentLines).
 */
export function generatePracticeSegment(state: SmartState, plan: PracticePlan, targetChars: number = SEGMENT_WORDS * 6, rand: Rand = Math.random): RoundText {
  const weight = (k: string) =>
    plan.fresh.includes(k) ? 4 : plan.focus.includes(k) ? 5 : plan.almost.includes(k) ? 2.5 : plan.review.includes(k) ? 2 : 1;
  return buildText(state, weight, { chars: targetChars }, rand);
}

/** Opens the next key when every open key has enough presses and a good enough score. */
export function tryUnlock(state: SmartState): { unlocked: number; key?: string } {
  if (state.unlocked >= KEY_ORDER.length) return { unlocked: state.unlocked };
  const ready = openKeys(state).every((k) => keyOf(state, k).n >= SETTLED_PRESSES && mastery(state, k) >= UNLOCK_SCORE);
  return ready ? { unlocked: state.unlocked + 1, key: KEY_ORDER[state.unlocked] } : { unlocked: state.unlocked };
}

export interface RoundOutcome {
  state: SmartState;
  summary: RoundSummary;
  /** One plain sentence about why the next round looks the way it does. */
  reasons: string[];
}

/** Fold a finished round into the state: update the keys, move difficulty, maybe unlock a key. */
export function applyRound(prev: SmartState, samples: KeySample[], accuracy: number, wpm: number): RoundOutcome {
  const keys: Record<string, KeyState> = { ...prev.keys };
  const per: Record<string, { n: number; ok: number; ts: number; tn: number }> = {};
  let gapSum = 0;
  let gapN = 0;
  for (const s of samples) {
    const k = s.key.toLowerCase();
    if (s.correct && s.gapMs) {
      gapSum += s.gapMs;
      gapN++;
    }
    if (!KEY_ORDER.includes(k)) continue;
    const p = per[k] ?? (per[k] = { n: 0, ok: 0, ts: 0, tn: 0 });
    p.n++;
    if (s.correct) p.ok++;
    if (s.correct && s.gapMs) {
      p.ts += s.gapMs;
      p.tn++;
    }
  }
  for (const [k, p] of Object.entries(per)) {
    const cur = keys[k];
    const a = p.ok / p.n;
    const m = p.tn ? p.ts / p.tn : cur?.ms ?? TARGET_MS * 2;
    keys[k] = cur && cur.n > 0
      ? { n: cur.n + p.n, acc: cur.acc + (a - cur.acc) * 0.4, ms: cur.ms + (m - cur.ms) * 0.4, last: prev.rounds + 1 }
      : { n: p.n, acc: a, ms: m, last: prev.rounds + 1 };
  }

  const avgMs = gapN ? gapSum / gapN : TARGET_MS;
  const ratio = yardstick({ ...prev, keys }) / avgMs;
  let difficulty = prev.difficulty;
  let dir: -1 | 0 | 1 = 0;
  let sentence: string;
  const acc = Math.round(accuracy);
  const mid: SmartState = { ...prev, keys };
  const f0 = focusOf({ ...mid, rounds: prev.rounds + 1 });
  const aim = f0.weak.concat(f0.fresh).slice(0, 3).join(', ').toUpperCase();
  if ((accuracy >= 95 && ratio >= 0.8) || (accuracy >= 97.5 && ratio >= 0.6)) {
    if (difficulty < MAX_DIFFICULTY) {
      difficulty++;
      dir = 1;
      sentence = `Accuracy ${acc}% at ${wpm} wpm. Next text is a step harder: ${
        difficulty >= 6 ? 'punctuation, capitals and longer words.' : difficulty >= 5 ? 'capitals and longer words.' : 'longer words.'
      }`;
    } else {
      sentence = `Accuracy ${acc}%. You are at the top setting, so it holds.`;
    }
  } else if (accuracy < 88) {
    if (difficulty > 1) {
      difficulty--;
      dir = -1;
    }
    sentence = `Accuracy ${acc}% is under 88%. ${dir ? 'Next text is a step easier' : 'Already at the easiest text'}${aim ? `, with more of ${aim}.` : '.'}`;
  } else if (accuracy < 95) {
    sentence = `Accuracy ${acc}%. Difficulty holds until you reach about 95%.`;
  } else {
    sentence = `Accurate (${acc}%), but speed is under the target. Difficulty holds. Speed comes with repeats.`;
  }

  const opened = tryUnlock(mid);
  const unlocked = opened.unlocked;
  const unlockedKey = opened.key;

  const summary: RoundSummary = { accuracy, wpm, dir, difficulty, keys: unlocked, unlockedKey };
  const state: SmartState = {
    version: 1,
    unlocked,
    difficulty,
    rounds: prev.rounds + 1,
    keys,
    history: [...prev.history, summary].slice(-HISTORY_MAX),
  };
  const reasons = [sentence];
  if (unlockedKey) reasons.push(`New key unlocked: ${unlockedKey.toUpperCase()}. Every key in play was typed ${SETTLED_PRESSES}+ times and scored ${UNLOCK_SCORE} or more.`);
  return { state, summary, reasons };
}

// ---- Practice: a session plan that is recalculated after every segment ------------------------

export interface PracticePlan {
  /** Up to three keys to fix: new keys first, then the lowest scores (a key picked by hand goes first). */
  focus: string[];
  /** Keys that score 0.65 to 0.8. */
  almost: string[];
  /** Strong keys that have not been typed for the longest, so they do not slip. */
  review: string[];
  /** Open keys with fewer than SETTLED_PRESSES presses. */
  fresh: string[];
}

export function planOf(state: SmartState, pinned?: string | null): PracticePlan {
  const keys = openKeys(state);
  const fresh = keys.filter((k) => keyOf(state, k).n < SETTLED_PRESSES);
  const ranked = keys
    .filter((k) => keyOf(state, k).n >= SETTLED_PRESSES)
    .sort((a, b) => mastery(state, a) - mastery(state, b));
  let focus = fresh.concat(ranked.filter((k) => mastery(state, k) < 0.8));
  if (pinned && keys.includes(pinned)) focus = [pinned, ...focus.filter((k) => k !== pinned)];
  focus = focus.slice(0, 3);
  const almost = ranked.filter((k) => !focus.includes(k) && mastery(state, k) >= 0.65 && mastery(state, k) < 0.8).slice(0, 2);
  const review = ranked
    .filter((k) => !focus.includes(k) && mastery(state, k) >= 0.8)
    .sort((a, b) => (keyOf(state, a).last ?? 0) - (keyOf(state, b).last ?? 0))
    .slice(0, 2);
  return { focus, almost, review, fresh };
}

export interface SegmentOutcome {
  state: SmartState;
  /** Difficulty change after this segment: 1 harder, -1 easier, 0 held. */
  dir: -1 | 0 | 1;
  /** Plain sentences about what changed in the plan and the difficulty. */
  reasons: string[];
}

/**
 * Fold one finished Practice segment into the state. Difficulty moves by at most one step away from where
 * the session started. Keys never unlock here, only at the end of the session (see finishSession).
 */
export function applySegment(
  prev: SmartState,
  samples: KeySample[],
  accuracy: number,
  wpm: number,
  sessionDifficulty: number,
  pinned?: string | null,
): SegmentOutcome {
  const before = planOf(prev, pinned);
  const scoreBefore: Record<string, number> = {};
  for (const k of openKeys(prev)) scoreBefore[k] = mastery(prev, k);

  const keys: Record<string, KeyState> = { ...prev.keys };
  const per: Record<string, { n: number; ok: number; ts: number; tn: number }> = {};
  let gapSum = 0;
  let gapN = 0;
  for (const smp of samples) {
    const k = smp.key.toLowerCase();
    if (smp.correct && smp.gapMs) {
      gapSum += smp.gapMs;
      gapN++;
    }
    if (!KEY_ORDER.includes(k)) continue;
    const p = per[k] ?? (per[k] = { n: 0, ok: 0, ts: 0, tn: 0 });
    p.n++;
    if (smp.correct) p.ok++;
    if (smp.correct && smp.gapMs) {
      p.ts += smp.gapMs;
      p.tn++;
    }
  }
  for (const [k, p] of Object.entries(per)) {
    const cur = keys[k];
    const a = p.ok / p.n;
    const m = p.tn ? p.ts / p.tn : cur?.ms ?? TARGET_MS * 2;
    keys[k] = cur && cur.n > 0
      ? { n: cur.n + p.n, acc: cur.acc + (a - cur.acc) * 0.35, ms: cur.ms + (m - cur.ms) * 0.35, last: prev.rounds + 1 }
      : { n: p.n, acc: a, ms: m, last: prev.rounds + 1 };
  }

  const ratio = yardstick({ ...prev, keys }) / (gapN ? gapSum / gapN : TARGET_MS);
  let difficulty = prev.difficulty;
  let dir: -1 | 0 | 1 = 0;
  if ((accuracy >= 95 && ratio >= 0.85) || (accuracy >= 97.5 && ratio >= 0.6)) {
    if (difficulty < MAX_DIFFICULTY && difficulty < sessionDifficulty + 1) {
      difficulty++;
      dir = 1;
    }
  } else if (accuracy < 88) {
    if (difficulty > 1 && difficulty > sessionDifficulty - 1) {
      difficulty--;
      dir = -1;
    }
  }

  const state: SmartState = { ...prev, keys, difficulty };
  const after = planOf(state, pinned);
  const acc = Math.round(accuracy);
  const reasons: string[] = [];
  for (const k of before.focus) {
    if (!after.focus.includes(k) && keyOf(prev, k).n >= SETTLED_PRESSES) {
      reasons.push(`${k.toUpperCase()} leaves the focus list: score ${scoreBefore[k].toFixed(2)} to ${mastery(state, k).toFixed(2)}.`);
    }
  }
  for (const k of after.focus) {
    if (!before.focus.includes(k)) {
      reasons.push(`${k.toUpperCase()} joins the focus list (${keyOf(state, k).n < SETTLED_PRESSES ? 'new key' : 'score ' + mastery(state, k).toFixed(2)}).`);
    }
  }
  if (dir > 0) {
    reasons.push(`Accuracy ${acc}%: difficulty ${prev.difficulty} to ${difficulty} (${difficulty >= 7 ? 'punctuation and capitals' : difficulty >= 6 ? 'capitals' : 'longer words'}).`);
  } else if (dir < 0) {
    reasons.push(`Accuracy ${acc}% is under 88%: difficulty ${prev.difficulty} to ${difficulty}, shorter words.`);
  }
  if (reasons.length === 0) reasons.push(`${acc}% at ${wpm} wpm. The plan stays the same.`);
  return { state, dir, reasons };
}

export interface SessionOutcome {
  state: SmartState;
  unlockedKey?: string;
  /** One or two sentences for under the text: what got better, the next focus, a new key. */
  note: string;
}

/** The end of a Practice session: maybe open the next key, count the session and write the summary sentence. */
export function finishSession(state: SmartState, startScores: Record<string, number>, pinned?: string | null): SessionOutcome {
  const opened = tryUnlock(state);
  const next: SmartState = { ...state, unlocked: opened.unlocked, rounds: state.rounds + 1 };
  const plan = planOf(next, pinned);
  const improved = openKeys(state)
    .filter((k) => startScores[k] !== undefined && mastery(state, k) - startScores[k] >= 0.04)
    .sort((a, b) => mastery(state, b) - startScores[b] - (mastery(state, a) - startScores[a]))
    .slice(0, 2);
  const slipped = openKeys(state).find((k) => startScores[k] !== undefined && mastery(state, k) - startScores[k] <= -0.04);
  let note = '';
  if (opened.key) note += `New key unlocked: ${opened.key.toUpperCase()}. Every key you had is good, so the next one opens. `;
  if (improved.length) note += `Better: ${improved.map((k) => k.toUpperCase()).join(', ')}. `;
  note += plan.focus.length
    ? `Next session focuses on ${plan.focus.map((k) => k.toUpperCase()).join(', ')}.`
    : 'Every key is good. Next session is review plus harder text.';
  if (slipped) note += ` Watch ${slipped.toUpperCase()}, it slipped.`;
  return { state: next, unlockedKey: opened.key, note };
}

// ---- storage -----------------------------------------------------------------------------------

function isKeyState(v: unknown): v is KeyState {
  const k = v as KeyState;
  return !!k && Number.isFinite(k.n) && Number.isFinite(k.acc) && Number.isFinite(k.ms);
}

export function loadState(): SmartState {
  try {
    const raw = localStorage.getItem(SMART_KEY);
    if (!raw) return emptyState();
    const p = JSON.parse(raw) as Partial<SmartState>;
    if (p.version !== 1 || !Number.isFinite(p.unlocked) || !Number.isFinite(p.difficulty)) return emptyState();
    const keys: Record<string, KeyState> = {};
    for (const [k, v] of Object.entries(p.keys ?? {})) if (KEY_ORDER.includes(k) && isKeyState(v)) keys[k] = v;
    return {
      version: 1,
      unlocked: Math.min(KEY_ORDER.length, Math.max(START_KEYS, Math.round(p.unlocked as number))),
      difficulty: Math.min(MAX_DIFFICULTY, Math.max(1, Math.round(p.difficulty as number))),
      rounds: Number.isFinite(p.rounds) ? (p.rounds as number) : 0,
      keys,
      history: Array.isArray(p.history) ? (p.history as RoundSummary[]).slice(-HISTORY_MAX) : [],
    };
  } catch {
    return emptyState();
  }
}

export function saveState(state: SmartState) {
  try {
    localStorage.setItem(SMART_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: progress simply is not kept */
  }
}
