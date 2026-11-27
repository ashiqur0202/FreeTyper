'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { countDone, loadProgress } from './courseProgress';

const TypingLessons = dynamic(() => import('./TypingLessons'));
const SmartLessons = dynamic(() => import('./SmartLessons'));

type Mode = 'smart' | 'course';
const MODE_KEY = 'freetyper-lessons-mode';

/**
 * The Lessons page: Smart lessons (keys unlock by skill, text follows how you do) beside the fixed
 * 34-lesson Course. The choice is remembered in this browser. Someone who already has Course
 * progress and has not chosen yet lands on the Course, everyone else on Smart lessons.
 */
export default function LessonsHub() {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    let chosen: Mode | null = null;
    try {
      const saved = localStorage.getItem(MODE_KEY);
      if (saved === 'smart' || saved === 'course') chosen = saved;
    } catch {
      /* storage blocked: fall through to the default */
    }
    if (!chosen) {
      let hasCourse = false;
      try {
        hasCourse = countDone(loadProgress()) > 0;
      } catch {
        /* no progress yet */
      }
      chosen = hasCourse ? 'course' : 'smart';
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads localStorage, so it must run after hydration
    setMode(chosen);
  }, []);

  const choose = (m: Mode) => {
    setMode(m);
    try {
      localStorage.setItem(MODE_KEY, m);
    } catch {
      /* ignore */
    }
  };

  const tab = (m: Mode, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === m}
      onClick={() => choose(m)}
      className={`rounded-md px-2.5 py-1 text-sm transition-all ${
        mode === m ? 'bg-accent-bg font-medium text-text-bright' : 'text-text hover:bg-surface hover:text-text-bright'
      }`}
    >
      {label}
    </button>
  );

  // The two modes are the tabs in the strip at the top of each lessons box.
  const tabs = (
    <div role="tablist" aria-label="Lesson mode" className="flex flex-wrap items-center gap-1">
      {tab('smart', 'Smart lessons')}
      {tab('course', 'Course · 34 lessons')}
    </div>
  );

  return (
    <div className="w-full">
      {mode === 'smart' && <SmartLessons tabs={tabs} />}
      {mode === 'course' && <TypingLessons tabs={tabs} />}
      {mode === null && <div className="h-48" aria-hidden="true" />}
    </div>
  );
}
