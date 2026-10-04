import { courseLessons, type CourseLesson } from './courseData';

/**
 * Progress through the typing course, kept in localStorage.
 *
 * A lesson counts as done when it was passed (accuracy at or above its pass
 * mark) or, after repeated misses, skipped on purpose. The next lesson unlocks
 * when the previous one is done.
 */

export interface CourseProgress {
  /** Ids of lessons passed. */
  completed: string[];
  /** Ids of lessons the learner chose to move past after missing the pass mark. */
  skipped: string[];
  /** Failed attempts since the last pass, per lesson id. */
  attempts: Record<string, number>;
}

export const PROGRESS_KEY = 'freetyper-course-progress';
/** The previous 7-lesson version stored its progress here. */
const OLD_PROGRESS_KEY = 'freetyper-lessons-progress';

export function emptyProgress(): CourseProgress {
  return { completed: [], skipped: [], attempts: {} };
}

export function isDone(p: CourseProgress, id: string): boolean {
  return p.completed.includes(id) || p.skipped.includes(id);
}

export function isUnlocked(p: CourseProgress, number: number): boolean {
  if (number <= 1) return true;
  const previous = courseLessons[number - 2];
  return previous ? isDone(p, previous.id) : false;
}

/** The first lesson not done yet, or the last lesson once everything is done. */
export function firstOpenLesson(p: CourseProgress): number {
  const open = courseLessons.find((l) => !isDone(p, l.id));
  return open ? open.number : courseLessons.length;
}

export function countDone(p: CourseProgress, lessons: CourseLesson[] = courseLessons): number {
  return lessons.filter((l) => isDone(p, l.id)).length;
}

export function recordResult(p: CourseProgress, lesson: CourseLesson, passed: boolean): CourseProgress {
  if (passed) {
    return {
      completed: p.completed.includes(lesson.id) ? p.completed : [...p.completed, lesson.id],
      skipped: p.skipped,
      attempts: { ...p.attempts, [lesson.id]: 0 },
    };
  }
  return { ...p, attempts: { ...p.attempts, [lesson.id]: (p.attempts[lesson.id] ?? 0) + 1 } };
}

export function skipLesson(p: CourseProgress, lesson: CourseLesson): CourseProgress {
  return {
    completed: p.completed,
    skipped: p.skipped.includes(lesson.id) ? p.skipped : [...p.skipped, lesson.id],
    attempts: { ...p.attempts, [lesson.id]: 0 },
  };
}

/**
 * The old course had 7 lessons (0 home row, 1 top row, 2 bottom row, 3 common
 * words, 4 sentences, 5 numbers and symbols, 6 speed). Anyone who finished one
 * of them keeps the matching part of the new course.
 */
const OLD_TO_NEW: [number, number][] = [
  [1, 5],
  [6, 10],
  [11, 15],
  [16, 16],
  [17, 22],
  [23, 28],
  [29, 34],
];

export function migrateOldProgress(old: { completed?: unknown }): CourseProgress {
  const progress = emptyProgress();
  const finished = Array.isArray(old.completed) ? (old.completed as unknown[]) : [];
  for (const index of finished) {
    if (typeof index !== 'number' || !OLD_TO_NEW[index]) continue;
    const [from, to] = OLD_TO_NEW[index];
    for (let n = from; n <= to; n++) {
      const id = courseLessons[n - 1].id;
      if (!progress.completed.includes(id)) progress.completed.push(id);
    }
  }
  return progress;
}

function isCourseProgress(value: unknown): value is CourseProgress {
  const v = value as CourseProgress;
  return Boolean(v) && Array.isArray(v.completed) && Array.isArray(v.skipped) && typeof v.attempts === 'object';
}

export function loadProgress(): CourseProgress {
  if (typeof window === 'undefined') return emptyProgress();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isCourseProgress(parsed)) return parsed;
    }
    const old = localStorage.getItem(OLD_PROGRESS_KEY);
    if (old) {
      const migrated = migrateOldProgress(JSON.parse(old) as { completed?: unknown });
      saveProgress(migrated);
      return migrated;
    }
  } catch {
    /* unreadable data: start fresh */
  }
  return emptyProgress();
}

export function saveProgress(p: CourseProgress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* storage full or unavailable */
  }
}
