import { COURSE_WORDS } from './courseWords';

/**
 * The engine behind Smart lessons: no fixed lesson list. Keys unlock one at a time by skill, and the
 * text of every round follows how the last rounds went. Pure functions plus load/save, so the UI
 * (SmartLessons.tsx) stays thin. If a rule here changes, update the Lessons guide in the same commit.
 *
 * All numbers below are starting guesses (see freetyper.md); nothing here is tested on real learners.
 */

type Rand = () => number;

export const SMART_KEY = 'freetyper-smart-progress';
/** Unlock order: home row first, then the keys that make the most real words. */
export const KEY_ORDER = 'fjdkslaeghiortunmcbwypvqxz';
export const START_KEYS = 6;
/** Speed target per key in ms (about 33 wpm). A fixed starting guess. */
export const TARGET_MS = 360;
export const ROUND_WORDS = 12;
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

/** 0 to 1: accuracy counts most, speed less. 0 for a key never typed. */
export function mastery(state: SmartState, k: string): number {
  const s = state.keys[k];
  if (!s || s.n === 0) return 0;
  return Math.pow(s.acc, 3) * (0.6 + 0.4 * Math.min(1, TARGET_MS / s.ms));
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

function pseudoWord(state: SmartState, keys: string[], target: number, rand: Rand): string {
  const vowels = keys.filter((k) => 'aeiou'.includes(k));
  const cons = keys.filter((k) => !'aeiou'.includes(k));
  const len = Math.max(3, Math.round(target + (rand() * 2 - 1)));
  let word = '';
  let useVowel = rand() < 0.4;
  for (let i = 0; i < len; i++) {
    const pool = useVowel && vowels.length ? vowels : cons.length ? cons : vowels;
    word += pickWeighted(pool, (k) => weightOf(state, k), rand);
    useVowel = !useVowel;
  }
  return word;
}

export interface RoundText {
  text: string;
  /** How many of the words are real words (the rest are made-up letter groups). */
  realWords: number;
}

/** The text for the next round: only open keys, weak keys more often, harder as difficulty rises. */
export function generateRoundText(state: SmartState, rand: Rand = Math.random): RoundText {
  const keys = openKeys(state);
  const open = new Set(keys);
  const target = 3 + state.difficulty * 0.45;
  const pool = COURSE_WORDS.filter((w) => [...w].every((c) => open.has(c)));
  const out: string[] = [];
  let prev = '';
  let realWords = 0;
  for (let i = 0; i < ROUND_WORDS; i++) {
    let w: string;
    if (pool.length >= 10 && rand() < 0.85) {
      w = pickWeighted(
        pool,
        (x) => {
          let s = 0;
          for (const c of x) s += weightOf(state, c);
          const d = x.length - target;
          const v = Math.pow(s / x.length, 1.5) * Math.exp(-(d * d) / 6);
          return x === prev ? v * 0.05 : v;
        },
        rand,
      );
      realWords++;
    } else {
      w = pseudoWord(state, keys, target, rand);
    }
    prev = w;
    if (state.difficulty >= 5 && rand() < (state.difficulty - 4) * 0.05) w = w.charAt(0).toUpperCase() + w.slice(1);
    if (state.difficulty >= 6 && i < ROUND_WORDS - 1 && rand() < (state.difficulty - 5) * 0.05) w += rand() < 0.5 ? ',' : '.';
    out.push(w);
  }
  out[out.length - 1] = out[out.length - 1].replace(/[,.]$/, '') + '.';
  return { text: out.join(' '), realWords };
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
      ? { n: cur.n + p.n, acc: cur.acc + (a - cur.acc) * 0.4, ms: cur.ms + (m - cur.ms) * 0.4 }
      : { n: p.n, acc: a, ms: m };
  }

  const avgMs = gapN ? gapSum / gapN : TARGET_MS;
  const ratio = TARGET_MS / avgMs;
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

  let unlocked = prev.unlocked;
  let unlockedKey: string | undefined;
  if (unlocked < KEY_ORDER.length) {
    const ready = openKeys(mid).every((k) => (keys[k]?.n ?? 0) >= SETTLED_PRESSES && mastery(mid, k) >= UNLOCK_SCORE);
    if (ready) {
      unlockedKey = KEY_ORDER[unlocked];
      unlocked++;
    }
  }

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
