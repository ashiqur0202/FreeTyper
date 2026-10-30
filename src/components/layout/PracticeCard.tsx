'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { Check, Flame } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { PROGRESS_UPDATED_EVENT } from '@/lib/progress-events';
import {
  nextGoal,
  readPracticeSummary,
  saveGoalMinutes,
  summaryCacheKey,
  type PracticeSummary,
} from '@/components/skills/typing/practiceSummary';

/**
 * "Your practice" card in the right sidebar: streak, minutes typed today against
 * a daily goal, and a shortcut to the next lesson. Everything comes from this
 * browser's saved progress, so it renders nothing on the server and on the first
 * client render (no hydration mismatch) and appears once the data is read.
 */

let cache: { key: string; summary: PracticeSummary } | null = null;

function getSnapshot(): PracticeSummary {
  const key = summaryCacheKey();
  if (!cache || cache.key !== key) cache = { key, summary: readPracticeSummary() };
  return cache.summary;
}

function getServerSnapshot(): PracticeSummary | null {
  return null;
}

function subscribe(onChange: () => void) {
  window.addEventListener(PROGRESS_UPDATED_EVENT, onChange);
  window.addEventListener('storage', onChange);
  window.addEventListener('focus', onChange);
  document.addEventListener('visibilitychange', onChange);
  return () => {
    window.removeEventListener(PROGRESS_UPDATED_EVENT, onChange);
    window.removeEventListener('storage', onChange);
    window.removeEventListener('focus', onChange);
    document.removeEventListener('visibilitychange', onChange);
  };
}

const linkClass =
  'block rounded-md bg-accent-bg px-3 py-2 text-sm text-accent transition-colors hover:bg-surface-raised';

export default function PracticeCard() {
  const pathname = usePathname();
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!s) return null;

  const isNew = s.sessions === 0 && s.lessonsDone === 0;
  // One decimal, so a 15 second test shows as 0.3 and not as nothing.
  const minutesToday = Number((s.todaySeconds / 60).toFixed(1));
  const goalDone = s.todaySeconds >= s.goalMinutes * 60;
  const percent = Math.min(100, Math.round((s.todaySeconds / 60 / s.goalMinutes) * 100));

  const changeGoal = () => {
    saveGoalMinutes(nextGoal(s.goalMinutes));
    window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT));
  };

  return (
    <div className="mx-4 mt-6 border-t border-surface-border pt-4" data-practice-card>
      <p className="text-[10px] uppercase tracking-widest text-text-dim">Your practice</p>

      {isNew ? (
        <>
          <p className="mt-2 text-[12px] leading-relaxed text-text">New here? Start with lesson 1.</p>
          <Link
            href="/typing-lessons"
            className={`${linkClass} mt-2`}
            onClick={() => trackEvent('continue_click', { target: 'start' })}
          >
            Start lesson 1
          </Link>
        </>
      ) : (
        <>
          <p className="mt-2 flex items-center gap-1.5 text-[12px] text-text" data-streak={s.streak}>
            <Flame size={14} className={s.streak > 0 ? 'text-accent' : 'text-text-dim'} aria-hidden="true" />
            {s.streak > 0 ? `${s.streak}-day streak` : 'No streak yet'}
          </p>
          {s.streakAtRisk && (
            <p className="mt-0.5 text-[11px] leading-snug text-text-dim">Practise today to keep it.</p>
          )}

          <div className="mt-3">
            <div className="flex items-baseline justify-between text-[12px] text-text">
              <span data-today-minutes={minutesToday}>
                {goalDone ? (
                  <span className="inline-flex items-center gap-1">
                    <Check size={13} className="text-accent" aria-hidden="true" />
                    Goal done
                  </span>
                ) : (
                  `${minutesToday} of ${s.goalMinutes} min today`
                )}
              </span>
              <button
                type="button"
                onClick={changeGoal}
                className="text-[11px] text-text-dim underline decoration-dotted underline-offset-2 hover:text-text"
                aria-label={`Daily goal ${s.goalMinutes} minutes. Click to change.`}
              >
                {s.goalMinutes} min
              </button>
            </div>
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-raised"
              role="progressbar"
              aria-label="Minutes typed today"
              aria-valuemin={0}
              aria-valuemax={s.goalMinutes}
              aria-valuenow={Math.min(minutesToday, s.goalMinutes)}
            >
              <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
            </div>
          </div>

          {s.nextLesson && pathname !== '/typing-lessons' && (
            <Link
              href="/typing-lessons"
              className={`${linkClass} mt-3`}
              onClick={() => trackEvent('continue_click', { target: 'lesson', lesson_number: s.nextLesson!.number })}
            >
              Continue lesson {s.nextLesson.number}
              <span className="mt-0.5 block text-[11px] text-text-dim">{s.nextLesson.title}</span>
            </Link>
          )}
          {!s.nextLesson && pathname !== '/typing-practice' && (
            <Link
              href="/typing-practice"
              className={`${linkClass} mt-3`}
              onClick={() => trackEvent('continue_click', { target: 'practice' })}
            >
              Keep going: practice
              <span className="mt-0.5 block text-[11px] text-text-dim">Course finished</span>
            </Link>
          )}
        </>
      )}
    </div>
  );
}
