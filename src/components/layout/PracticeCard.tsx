'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Check, Flame, Link2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { PROGRESS_UPDATED_EVENT } from '@/lib/progress-events';
import ChallengeSendButton from '@/components/skills/typing/ChallengeSendButton';
import type { TextLevel } from '@/components/skills/typing/textGenerator';
import {
  nextGoal,
  readPracticeSummary,
  saveGoalMinutes,
  summaryCacheKey,
  type PracticeSummary,
} from '@/components/skills/typing/practiceSummary';

/**
 * The top of the right sidebar: the next step, today's streak and goal, the best speed test
 * with a "challenge a friend" button, and the keys that need work. Everything comes from this
 * browser's saved progress, so it renders nothing on the server and on the first client render
 * (no hydration mismatch) and appears once the data is read.
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

interface NextStep {
  title: string;
  sub: string;
  href: string;
  target: string;
  lessonNumber?: number;
}

/** The first step in this order that is not the page already open. */
function nextStepFor(s: PracticeSummary, pathname: string): NextStep | null {
  const goalDone = s.todaySeconds >= s.goalMinutes * 60;
  const steps: NextStep[] = [];
  if (s.sessions === 0 && s.lessonsDone === 0) {
    steps.push({ title: 'Start lesson 1', sub: 'New here? It takes a few minutes.', href: '/typing-lessons', target: 'start' });
  } else {
    if (!s.dailyDone) {
      steps.push({ title: "Take today's daily test", sub: '60 seconds, the same text for everyone.', href: '/daily-typing-challenge', target: 'daily' });
    }
    if (s.nextLesson && !goalDone) {
      steps.push({
        title: `Continue lesson ${s.nextLesson.number}`,
        sub: s.nextLesson.title,
        href: '/typing-lessons',
        target: 'lesson',
        lessonNumber: s.nextLesson.number,
      });
    }
    if (goalDone && s.speed) {
      steps.push({ title: 'Goal done. Beat your best?', sub: `Your best is ${s.speed.best} WPM. Try a 1 minute test.`, href: '/1-minute-typing-test', target: 'speed' });
    }
    if (s.nextLesson) {
      steps.push({
        title: `Continue lesson ${s.nextLesson.number}`,
        sub: s.nextLesson.title,
        href: '/typing-lessons',
        target: 'lesson',
        lessonNumber: s.nextLesson.number,
      });
    }
    steps.push({ title: 'Keep going: practice', sub: s.nextLesson ? 'Quotes, code and weak keys.' : 'Course finished.', href: '/typing-practice', target: 'practice' });
  }
  return steps.find((x) => x.href !== pathname) ?? null;
}

const labelClass = 'text-[10px] uppercase tracking-widest text-text-dim';
const blockClass = 'mx-4 mt-4 border-t border-surface-border pt-3';

function Ring({ percent, done }: { percent: number; done: boolean }) {
  const r = 21;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-[44px] flex-none">
      <svg width="44" height="44" viewBox="0 0 52 52" className="-rotate-90" aria-hidden="true">
        <circle cx="26" cy="26" r={r} fill="none" strokeWidth="5" style={{ stroke: 'var(--color-surface-raised)' }} />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - percent / 100)}
          style={{ stroke: 'var(--color-accent)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center font-mono text-[11px] text-text">
        {done ? <Check size={15} className="text-accent" aria-hidden="true" /> : `${percent}%`}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-2 flex items-center justify-between text-[12px]">
      <span className="text-text-dim">{label}</span>
      {children}
    </div>
  );
}

export default function PracticeCard() {
  const pathname = usePathname();
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const run = s?.challengeRun ?? null;

  // The link builder pulls in the text generator, so it loads only when there is a run to send.
  const [buildUrl, setBuildUrl] = useState<typeof import('@/components/skills/typing/challengeLink').buildChallengeUrl | null>(null);
  useEffect(() => {
    if (!run) return;
    let live = true;
    import('@/components/skills/typing/challengeLink').then((m) => {
      if (live) setBuildUrl(() => m.buildChallengeUrl);
    });
    return () => {
      live = false;
    };
  }, [run]);

  if (!s) return null;

  const isNew = s.sessions === 0 && s.lessonsDone === 0;
  // One decimal, so a 15 second test shows as 0.3 and not as nothing.
  const minutesToday = Number((s.todaySeconds / 60).toFixed(1));
  const goalDone = s.todaySeconds >= s.goalMinutes * 60;
  const percent = Math.min(100, Math.round((s.todaySeconds / 60 / s.goalMinutes) * 100));
  const step = nextStepFor(s, pathname);

  const changeGoal = () => {
    saveGoalMinutes(nextGoal(s.goalMinutes));
    window.dispatchEvent(new Event(PROGRESS_UPDATED_EVENT));
  };

  return (
    <div data-practice-card>
      {step && (
        <div className="mx-4 mt-1">
          <p className={labelClass}>{isNew ? 'Start here' : 'Next step'}</p>
          <Link
            href={step.href}
            data-next-step={step.target}
            className="mt-2 block rounded-lg border border-accent/50 bg-accent-bg px-3 py-2.5 transition-colors hover:border-accent"
            onClick={() =>
              trackEvent('continue_click', {
                target: step.target,
                ...(step.lessonNumber ? { lesson_number: step.lessonNumber } : {}),
              })
            }
          >
            <span className="block text-[13px] font-semibold leading-snug text-text-bright">{step.title}</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-text-dim">{step.sub}</span>
          </Link>
        </div>
      )}

      {!isNew && (
        <div className={blockClass}>
          <p className={labelClass}>Today</p>
          <div className="mt-2.5 flex items-center gap-2.5">
            <Ring percent={percent} done={goalDone} />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold text-text" data-streak={s.streak}>
                <Flame size={14} className={s.streak > 0 ? 'text-accent' : 'text-text-dim'} aria-hidden="true" />
                {s.streak > 0 ? `${s.streak}-day streak` : 'No streak yet'}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-text-dim" data-today-minutes={minutesToday}>
                {goalDone ? 'Goal done, ' : `${minutesToday} of `}
                <button
                  type="button"
                  onClick={changeGoal}
                  className="underline decoration-dotted underline-offset-2 hover:text-text"
                  aria-label={`Daily goal ${s.goalMinutes} minutes. Click to change.`}
                >
                  {s.goalMinutes}
                </button>
                {goalDone ? ' min goal' : ' min today'}
              </p>
            </div>
          </div>
          {s.streakAtRisk && <p className="mt-2 text-[11px] leading-snug text-text-dim">Practise today to keep it.</p>}
          <Row label="Daily test">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] ${s.dailyDone ? 'bg-surface-raised text-correct' : 'bg-accent-bg text-accent'}`}
              data-daily-done={s.dailyDone}
            >
              {s.dailyDone ? 'done' : 'not yet'}
            </span>
          </Row>
        </div>
      )}

      {s.speed && (
        <div className={blockClass} data-your-numbers>
          <p className={labelClass}>Your numbers</p>
          <p className="mt-2 flex items-baseline gap-1.5">
            <span className="font-mono text-[30px] leading-none text-accent">{s.speed.best}</span>
            <span className="text-[11px] text-text-dim">best WPM</span>
          </p>
          <p className="mt-1.5 text-[11px] leading-snug text-text-dim">
            <span className="font-semibold text-text">{s.speed.level}</span>
            {s.speed.next ? ` · +${s.speed.next.gap} to ${s.speed.next.name}` : ' · top level'}
            <br />
            Last run <span className="font-mono">{s.speed.last} WPM</span>
          </p>
          <div className="mt-2.5">
            {run && buildUrl ? (
              <ChallengeSendButton
                wide
                wpm={run.wpm}
                source="sidebar"
                hint={`Same text, ${run.wpm} WPM to beat`}
                buildUrl={() =>
                  buildUrl(window.location.origin, run.seed, run.wpm, run.accuracy, run.mode, run.seconds, run.level as TextLevel)
                }
              >
                Challenge a friend
              </ChallengeSendButton>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex w-full cursor-default items-center gap-2 rounded-lg border border-surface-border px-2.5 py-2 text-left text-[12px] text-text-dim"
              >
                <Link2 className="h-3.5 w-3.5 flex-none" />
                <span className="leading-snug">
                  Challenge a friend
                  <span className="block text-[10.5px]">{run ? 'Loading' : 'Needs one new speed test'}</span>
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {s.weakKeys.length > 0 && (
        <div className={blockClass} data-weak-keys>
          <p className={labelClass}>Weak keys</p>
          <ul className="mt-2 flex flex-wrap gap-1">
            {s.weakKeys.map((w) => (
              <li
                key={w.key}
                className="min-w-[26px] rounded-[5px] bg-surface-raised px-1.5 py-0.5 text-center font-mono text-[12px] text-text"
                title={`${w.misses} wrong presses`}
              >
                {w.key}
                <span className="ml-1 text-[10px] text-error">{w.misses}</span>
              </li>
            ))}
          </ul>
          {pathname !== '/typing-practice' && (
            <Link
              href="/typing-practice"
              className="mt-2 inline-block text-[12px] text-accent underline decoration-dotted underline-offset-2"
              onClick={() => trackEvent('continue_click', { target: 'weak_keys' })}
            >
              Practise these keys
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
