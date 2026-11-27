import { courseLessons } from './courseData';
import { PROGRESS_KEY, countDone, emptyProgress, firstOpenLesson, loadProgress } from './courseProgress';
import { utcDateKey, type DailyStore } from './dailyStreak';
import { levelIndex, LEVELS, nextStep } from './levelLadder';
import { scoreLetters } from './letterStats';
import { getPairStore } from './pairStats';
import type { KeyStats } from './types';

/**
 * A small read-only summary of the visitor's saved progress for the sidebar
 * practice card: streak, minutes typed today, and the next lesson.
 *
 * It only reads what the tools already save in localStorage (nothing is sent
 * anywhere) and must only be used after hydration.
 */

const PROGRESS_STORAGE_KEY = 'freetyper-progress';
const GOAL_KEY = 'freetyper-daily-goal';
// Written by TypingSpeedTest.tsx and dailyChallenge.ts; only read here.
const SPEED_LOG_KEY = 'freetyper-speed-log';
const DAILY_STORE_KEY = 'freetyper-daily-challenge';

/** A key to drill: how many times it was typed wrong. */
export interface WeakKey {
  key: string;
  misses: number;
}

/** The run behind the sidebar's "challenge a friend" button: the newest speed test that kept its text seed. */
export interface ChallengeRun {
  seed: string;
  mode: 'standard' | 'words' | 'sentences' | 'quotes' | 'facts' | 'code' | 'mixed';
  /** How the text is built (1 or 2, see TEST_TEXT_VERSION): needed to rebuild the same text for a challenge link. */
  gen: 1 | 2;
  language: 'any' | 'js' | 'python' | 'sql' | 'css' | 'html';
  seconds: number;
  level: number;
  wpm: number;
  accuracy: number;
}

/** Best speed test so far, with FreeTyper's own level and the gap to the next one (see levelLadder.ts). */
export interface SpeedSummary {
  best: number;
  last: number;
  level: string;
  next: { name: string; gap: number } | null;
}

const MAX_WEAK_KEYS = 3;

export const GOAL_OPTIONS = [5, 10, 15, 20, 30, 60] as const;
export const DEFAULT_GOAL_MINUTES = 30;

export interface PracticeSummary {
  /** Sessions saved so far (all modes). */
  sessions: number;
  /** Consecutive local days with a session; 0 once a day was missed. */
  streak: number;
  /** True when the streak was last extended yesterday, so today still has to count. */
  streakAtRisk: boolean;
  /** Seconds typed today (local calendar day), from saved sessions. */
  todaySeconds: number;
  goalMinutes: number;
  lessonsDone: number;
  lessonsTotal: number;
  /** The next lesson to do, or null when the whole course is done. */
  nextLesson: { number: number; title: string } | null;
  /** Speed tests only (not lessons, practice or number row); null before the first one. */
  speed: SpeedSummary | null;
  /** True when today's daily test has a counted run (UTC day, as the daily test itself uses). */
  dailyDone: boolean;
  /** Up to three keys judged weak or weakest, worst first. */
  weakKeys: WeakKey[];
  /** The newest speed test that can be sent as a challenge, or null. */
  challengeRun: ChallengeRun | null;
}

export function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function readGoalMinutes(): number {
  try {
    const n = Number(localStorage.getItem(GOAL_KEY));
    return (GOAL_OPTIONS as readonly number[]).includes(n) ? n : DEFAULT_GOAL_MINUTES;
  } catch {
    return DEFAULT_GOAL_MINUTES;
  }
}

export function saveGoalMinutes(minutes: number) {
  try {
    localStorage.setItem(GOAL_KEY, String(minutes));
  } catch {
    /* storage unavailable */
  }
}

/** The next goal in the list, wrapping around (5, 10, 15, 20, 5, ...). */
export function nextGoal(current: number): number {
  const i = (GOAL_OPTIONS as readonly number[]).indexOf(current);
  return GOAL_OPTIONS[(i + 1) % GOAL_OPTIONS.length];
}

interface StoredSession {
  date?: unknown;
  duration?: unknown;
  wpm?: unknown;
  mode?: unknown;
  modeDetail?: unknown;
}

const isSpeedTest = (s: StoredSession) =>
  s.mode === 'speed-test' && !(typeof s.modeDetail === 'string' && s.modeDetail.startsWith('number row'));

function readChallengeRun(): ChallengeRun | null {
  try {
    const raw = localStorage.getItem(SPEED_LOG_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : null;
    if (!Array.isArray(list)) return null;
    // Newest first. An older run without a saved seed or text level cannot be rebuilt as the same text.
    for (const e of list) {
      const sh = e?.share;
      if (
        sh && typeof sh.seed === 'string' && typeof sh.seconds === 'number' && typeof sh.level === 'number' &&
        (sh.mode === 'standard' || sh.mode === 'words' || sh.mode === 'sentences' || sh.mode === 'code' || sh.mode === 'quotes' || sh.mode === 'facts' || sh.mode === 'mixed') &&
        typeof e.wpm === 'number' && typeof e.accuracy === 'number'
      ) {
        return { seed: sh.seed, mode: sh.mode, seconds: sh.seconds, level: sh.level, gen: sh.gen === 2 ? 2 : 1, language: ['js', 'python', 'sql', 'css', 'html'].includes(sh.language) ? sh.language : 'any', wpm: e.wpm, accuracy: e.accuracy };
      }
    }
  } catch {
    /* unreadable data: no challenge run */
  }
  return null;
}

function readDailyDone(now: Date): boolean {
  try {
    const raw = localStorage.getItem(DAILY_STORE_KEY);
    const store = raw ? (JSON.parse(raw) as DailyStore) : null;
    const day = store?.[utcDateKey(now)];
    return !!day && day.wpm > 0;
  } catch {
    return false;
  }
}

export function readPracticeSummary(now: Date = new Date()): PracticeSummary {
  const today = localDateStr(now);
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = localDateStr(yesterdayDate);

  let sessions = 0;
  let todaySeconds = 0;
  let streak = 0;
  let streakAtRisk = false;
  let bestSpeed = 0;
  let lastSpeed = 0;
  let lastSpeedDate = 0;
  let weakKeys: WeakKey[] = [];
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as {
        sessions?: StoredSession[];
        streak?: { current?: number; lastPracticeDate?: string };
        keyStats?: Record<string, KeyStats>;
      };
      const list = Array.isArray(data.sessions) ? data.sessions : [];
      sessions = list.length;
      for (const s of list) {
        if (typeof s.date !== 'number' || typeof s.duration !== 'number') continue;
        if (localDateStr(new Date(s.date)) === today) todaySeconds += s.duration;
        if (isSpeedTest(s) && typeof s.wpm === 'number') {
          bestSpeed = Math.max(bestSpeed, s.wpm);
          if (s.date >= lastSpeedDate) {
            lastSpeedDate = s.date;
            lastSpeed = s.wpm;
          }
        }
      }
      const keyStats = data.keyStats && typeof data.keyStats === 'object' ? data.keyStats : {};
      weakKeys = scoreLetters(keyStats, getPairStore())
        .filter((l) => l.level === 'weak' || l.level === 'bad')
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_WEAK_KEYS)
        .map((l) => ({ key: l.key, misses: keyStats[l.key]?.incorrectPresses ?? 0 }));
      const last = data.streak?.lastPracticeDate;
      const current = typeof data.streak?.current === 'number' ? data.streak.current : 0;
      if (last === today) streak = current;
      else if (last === yesterday) {
        streak = current;
        streakAtRisk = current > 0;
      }
    }
  } catch {
    /* unreadable data: treat as no history */
  }

  const course = (() => {
    try {
      return loadProgress();
    } catch {
      return emptyProgress();
    }
  })();
  const lessonsDone = countDone(course);
  const next = firstOpenLesson(course);
  const courseDone = lessonsDone >= courseLessons.length;
  const lesson = courseLessons[next - 1];

  return {
    sessions,
    streak,
    streakAtRisk,
    todaySeconds,
    goalMinutes: readGoalMinutes(),
    lessonsDone,
    lessonsTotal: courseLessons.length,
    nextLesson: courseDone || !lesson ? null : { number: lesson.number, title: lesson.title },
    speed:
      bestSpeed > 0
        ? { best: Math.round(bestSpeed), last: Math.round(lastSpeed), level: LEVELS[levelIndex(bestSpeed)].name, next: nextStep(bestSpeed) }
        : null,
    dailyDone: readDailyDone(now),
    weakKeys,
    challengeRun: readChallengeRun(),
  };
}

/** Raw stored strings plus today's date: when none of them change, the summary cannot change. */
export function summaryCacheKey(now: Date = new Date()): string {
  try {
    return [
      localDateStr(now),
      localStorage.getItem(PROGRESS_STORAGE_KEY)?.length ?? 0,
      localStorage.getItem(PROGRESS_STORAGE_KEY)?.slice(-80) ?? '',
      localStorage.getItem(PROGRESS_KEY) ?? '',
      localStorage.getItem(GOAL_KEY) ?? '',
      localStorage.getItem(SPEED_LOG_KEY)?.length ?? 0,
      localStorage.getItem(SPEED_LOG_KEY)?.slice(0, 60) ?? '',
      localStorage.getItem(DAILY_STORE_KEY) ?? '',
    ].join('|');
  } catch {
    return 'none';
  }
}
