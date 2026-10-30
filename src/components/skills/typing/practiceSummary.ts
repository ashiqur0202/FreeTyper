import { courseLessons } from './courseData';
import { PROGRESS_KEY, countDone, emptyProgress, firstOpenLesson, loadProgress } from './courseProgress';

/**
 * A small read-only summary of the visitor's saved progress for the sidebar
 * practice card: streak, minutes typed today, and the next lesson.
 *
 * It only reads what the tools already save in localStorage (nothing is sent
 * anywhere) and must only be used after hydration.
 */

const PROGRESS_STORAGE_KEY = 'freetyper-progress';
const GOAL_KEY = 'freetyper-daily-goal';

export const GOAL_OPTIONS = [5, 10, 15, 20] as const;
export const DEFAULT_GOAL_MINUTES = 10;

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
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as {
        sessions?: StoredSession[];
        streak?: { current?: number; lastPracticeDate?: string };
      };
      const list = Array.isArray(data.sessions) ? data.sessions : [];
      sessions = list.length;
      for (const s of list) {
        if (typeof s.date !== 'number' || typeof s.duration !== 'number') continue;
        if (localDateStr(new Date(s.date)) === today) todaySeconds += s.duration;
      }
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
    ].join('|');
  } catch {
    return 'none';
  }
}
