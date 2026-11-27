'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback, type ReactNode } from 'react';
import { Check, Lock, RotateCcw, SkipForward } from 'lucide-react';
import { useTypingEngine } from './useTypingEngine';
import { useTypingProgress } from './useTypingProgress';
import { withoutRun } from './runStats';
import { recordPair } from './pairStats';
import {
  courseLessons,
  STAGES,
  MAX_FAILED_TRIES,
  minAccuracyFor,
  type StageId,
} from './courseData';
import { generateLessonText } from './lessonText';
import {
  countDone,
  emptyProgress,
  firstOpenLesson,
  isDone,
  isUnlocked,
  loadProgress,
  recordResult,
  saveProgress,
  skipLesson,
  type CourseProgress,
} from './courseProgress';
import type { TypingSession, Achievement } from './types';
import AchievementToast from './AchievementToast';
import LiveKeyboard from './LiveKeyboard';
import { useKeySound } from './useKeySound';
import { trackEvent } from '@/lib/analytics';
import { INPUT_SENTINEL, handleMobileInput, resetMobileInput } from './mobileInput';
import PracticeFeedback, {
  lessonCoachNote,
  type PracticeLogEntry,
} from './PracticeFeedback';
import TypingPassage, { measureTypingLineHeight, typingWindowHeight } from './TypingPassage';
import PracticeStrip from './PracticeStrip';

const LOG_KEY = 'freetyper-lessons-log';
const LOG_MAX = 5;

/** What the learner is told after an attempt. */
type Status =
  | { kind: 'passed'; lesson: number; accuracy: number; nextTitle?: string }
  | { kind: 'failed'; lesson: number; accuracy: number; needed: number; attempt: number };

function loadLessonLog(): PracticeLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PracticeLogEntry[];
    if (!Array.isArray(parsed)) return [];
    const trimmed = parsed.slice(0, LOG_MAX).map((entry, i, arr) => {
      if (entry.headline && entry.tone) return entry;
      return { ...entry, ...lessonCoachNote(entry, arr[i + 1], arr.slice(i + 1)) };
    });
    if (parsed.length > LOG_MAX) {
      try {
        localStorage.setItem(LOG_KEY, JSON.stringify(trimmed));
      } catch {
        /* ignore */
      }
    }
    return trimmed;
  } catch {
    return [];
  }
}

export default function TypingLessons({ tabs }: { tabs: ReactNode }) {
  const [activeNumber, setActiveNumber] = useState(1);
  const [viewStage, setViewStage] = useState<StageId>('home');
  const [text, setText] = useState('');
  const [progress, setProgress] = useState<CourseProgress>(emptyProgress);
  const [status, setStatus] = useState<Status | null>(null);
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<TypingSession | null>(null);
  const [log, setLog] = useState<PracticeLogEntry[]>([]);
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const [lastKeyFlash, setLastKeyFlash] = useState<{ key: string; correct: boolean } | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const typingAreaRef = useRef<HTMLDivElement>(null);
  const firstCharRef = useRef<HTMLSpanElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);
  const activeNumberRef = useRef(activeNumber);
  const progressRef = useRef(progress);
  const isRunningRef = useRef(false);
  const outcomeRef = useRef<{ passed: boolean; lesson: number } | null>(null);
  activeNumberRef.current = activeNumber;
  progressRef.current = progress;

  const { addSession, updateKeyStats, checkAchievements } = useTypingProgress();
  const lesson = courseLessons[activeNumber - 1];

  const stageLessons = (stage: StageId) => courseLessons.filter((l) => l.stage === stage);

  useEffect(() => {
    setMounted(true);
    const saved = loadProgress();
    setProgress(saved);
    progressRef.current = saved;
    setLog(loadLessonLog());
    const first = firstOpenLesson(saved);
    const startLesson = courseLessons[first - 1];
    setActiveNumber(first);
    setViewStage(startLesson.stage);
    setText(generateLessonText(startLesson));
  }, []);

  const handleComplete = useCallback(
    (session: TypingSession) => {
      const current = courseLessons[activeNumberRef.current - 1];
      const stageLabel = STAGES.find((s) => s.id === current.stage)?.label ?? '';
      const needed = minAccuracyFor(current);
      const passed = session.accuracy >= needed;
      const updated = {
        ...session,
        mode: 'lesson' as const,
        modeDetail: `${stageLabel} · ${current.title}`,
      };
      addSession(withoutRun(updated));

      const failedBefore = progressRef.current.attempts[current.id] ?? 0;
      const nextProgress = recordResult(progressRef.current, current, passed);
      progressRef.current = nextProgress;
      setProgress(nextProgress);
      saveProgress(nextProgress);
      outcomeRef.current = { passed, lesson: current.number };

      const attempt = failedBefore + 1;
      trackEvent('lesson_attempt', {
        lesson_number: current.number,
        passed,
        wpm: session.wpm,
        accuracy: session.accuracy,
        attempt,
      });
      if (passed) {
        trackEvent('lesson_complete', {
          lesson_number: current.number,
          lesson: current.title,
          wpm: session.wpm,
          accuracy: session.accuracy,
        });
        setStatus({
          kind: 'passed',
          lesson: current.number,
          accuracy: session.accuracy,
          nextTitle: courseLessons[current.number]?.title,
        });
      } else {
        setStatus({ kind: 'failed', lesson: current.number, accuracy: session.accuracy, needed, attempt });
      }

      setResult(updated);
      setLog((prev) => {
        const entry: PracticeLogEntry = {
          ...updated,
          ...lessonCoachNote(updated, prev[0], prev),
          passed,
        };
        const next = [entry, ...prev].slice(0, LOG_MAX);
        try {
          localStorage.setItem(LOG_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [addSession],
  );

  const {
    chars,
    currentIndex,
    wpm,
    accuracy,
    isRunning,
    isComplete,
    restart,
    handleInput,
    handleBackspace,
  } = useTypingEngine({
    text,
    onStart: () => {
      const current = courseLessons[activeNumberRef.current - 1];
      // attempt counts the same way as in lesson_attempt, so a start pairs with its attempt.
      trackEvent('lesson_start', { lesson_number: current.number, attempt: (progressRef.current.attempts[current.id] ?? 0) + 1 });
    },
    onComplete: handleComplete,
    onKeyStats: (key, correct, ctx) => {
      updateKeyStats(key, correct);
      recordPair(ctx.prev, key, correct, ctx.gapMs);
    },
  });

  isRunningRef.current = isRunning;
  const isCompleteRef = useRef(false);
  isCompleteRef.current = isComplete;

  const charsRef = useRef(chars);
  const currentIndexRef = useRef(currentIndex);
  charsRef.current = chars;
  currentIndexRef.current = currentIndex;

  const resetView = useCallback(() => {
    setScrollOffset(0);
    setLineHeight(0);
    setLastKeyFlash(null);
  }, []);

  /** Start (or restart) a lesson with fresh text. */
  const startLesson = useCallback(
    (number: number) => {
      const target = courseLessons[number - 1];
      if (!target) return;
      const next = generateLessonText(target);
      setActiveNumber(number);
      setViewStage(target.stage);
      resetView();
      setText(next);
      restart(next);
      isCompleteRef.current = false;
      inputRef.current?.focus({ preventScroll: true });
    },
    [resetView, restart],
  );

  const retryLesson = useCallback(() => {
    startLesson(activeNumberRef.current);
  }, [startLesson]);

  const goToLesson = useCallback(
    (number: number) => {
      if (!isUnlocked(progressRef.current, number) || isRunningRef.current) return;
      setStatus(null);
      startLesson(number);
    },
    [startLesson],
  );

  const moveOnAnyway = useCallback(() => {
    const current = courseLessons[activeNumberRef.current - 1];
    const next = courseLessons[current.number];
    if (!next || isRunningRef.current) return;
    const updated = skipLesson(progressRef.current, current);
    progressRef.current = updated;
    setProgress(updated);
    saveProgress(updated);
    trackEvent('lesson_skip', { lesson_number: current.number });
    setStatus(null);
    startLesson(next.number);
  }, [startLesson]);

  const startLessonRef = useRef(startLesson);
  startLessonRef.current = startLesson;
  const lastCompleteIdRef = useRef<string | null>(null);

  // After a finished attempt: go on to the next lesson if it was passed, otherwise try again with new text.
  useEffect(() => {
    if (!isComplete || !result) return;
    if (lastCompleteIdRef.current === result.id) return;
    lastCompleteIdRef.current = result.id;
    const newAchievements = checkAchievements();
    if (newAchievements.length > 0) setToasts((t) => [...t, ...newAchievements]);

    const outcome = outcomeRef.current;
    const number = outcome?.lesson ?? activeNumberRef.current;
    const hasNext = number < courseLessons.length;
    startLessonRef.current(outcome?.passed && hasNext ? number + 1 : number);
  }, [isComplete, result, checkAchievements]);

  // One path for every typed character: keyboard events and touch/IME input both use it.
  const playKeySound = useKeySound();
  const processChar = useCallback(
    (ch: string) => {
      const expectedChar = charsRef.current[currentIndexRef.current]?.char;
      handleInput(ch);
      const correct = ch === expectedChar;
      setLastKeyFlash({ key: ch, correct });
      playKeySound(correct);
    },
    [handleInput, playKeySound],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (isCompleteRef.current) {
        e.preventDefault();
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        return;
      }

      if (e.key.length === 1) {
        e.preventDefault();
        processChar(e.key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [processChar, handleBackspace]);

  useLayoutEffect(() => {
    if (typingAreaRef.current && typingAreaRef.current.scrollTop !== 0) {
      typingAreaRef.current.scrollTop = 0;
    }

    if (!currentCharRef.current || !chars.length || !firstCharRef.current) {
      setScrollOffset(0);
      return;
    }

    const currentTop = currentCharRef.current.offsetTop;
    const baseTop = firstCharRef.current.offsetTop;

    if (currentTop === baseTop) {
      setScrollOffset(0);
      return;
    }

    let lh = lineHeight;
    if (lh === 0) {
      const container = typingAreaRef.current?.querySelector('.typing-text');
      if (!container) return;
      lh = measureTypingLineHeight(container as HTMLElement);
      if (lh === 0) return;
      setLineHeight(lh);
    }

    const currentLine = Math.round((currentTop - baseTop) / lh);
    if (currentLine >= 2) {
      setScrollOffset((currentLine - 1) * lh);
    } else {
      setScrollOffset(0);
    }
  }, [currentIndex, lineHeight, chars.length]);

  if (!mounted) {
    return (
      <div className="w-full">
        {tabs}
        <div className="h-48" aria-hidden="true" />
      </div>
    );
  }

  const doneCount = countDone(progress);
  const nextLesson = courseLessons[lesson.number];
  const failedTries = progress.attempts[lesson.id] ?? 0;
  const canMoveOn = Boolean(nextLesson) && failedTries >= MAX_FAILED_TRIES && !isDone(progress, lesson.id);

  return (
    <div className="flex w-full flex-col items-center">
      {toasts.map((a, i) => (
        <AchievementToast
          key={a.id + i}
          achievement={a}
          onClose={() => setToasts((t) => t.filter((_, j) => j !== i))}
        />
      ))}

      <div className="w-full @container">
        {/* The course box: tabs and live speed in the strip, then stages, lessons and the lesson itself */}
        <section className="mb-3 overflow-hidden rounded-2xl border border-surface-border bg-surface" aria-label="Lesson tabs, stages and the current lesson">
          <PracticeStrip tabs={tabs} isRunning={isRunning} wpm={wpm} accuracy={accuracy} />

          <div className="flex flex-wrap items-center gap-1 border-b border-surface-border px-3 py-1.5" role="tablist" aria-label="Course stages">
            {STAGES.map((s) => {
              const inStage = stageLessons(s.id);
              const done = countDone(progress, inStage);
              const isView = viewStage === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={isView}
                  onClick={() => setViewStage(s.id)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                    isView ? 'border-accent bg-accent-bg text-accent' : 'border-surface-border text-text hover:text-text-bright'
                  }`}
                >
                  {s.label} <span className="ml-0.5 tabular-nums text-text-dim">{done}/{inStage.length}</span>
                </button>
              );
            })}
          </div>

          {/* The lesson: new keys as keycaps, title and tip, and the lessons of this stage as a stepper */}
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 px-3.5 py-2.5">
            {lesson.newKeys.length > 0 && (
              <div className="flex flex-none gap-1" aria-label="New keys in this lesson">
                {lesson.newKeys.map((k) => (
                  <kbd key={k} className="grid h-[38px] w-[38px] place-items-center rounded-lg border border-accent bg-accent-bg font-mono text-lg font-bold uppercase text-accent">
                    {k}
                  </kbd>
                ))}
              </div>
            )}
            <div className="min-w-0 flex-[1_1_16rem]">
              <h2 className="flex flex-wrap items-baseline gap-x-2.5 text-base font-semibold text-text-bright">
                {lesson.title}
                <span className="text-xs font-normal text-text-dim">
                  Lesson {lesson.number} of {courseLessons.length} · {STAGES.find((st) => st.id === lesson.stage)?.label} · {doneCount} of {courseLessons.length} passed
                </span>
              </h2>
              <p className="mt-0.5 max-w-3xl text-[0.8rem] leading-snug text-text">{lesson.tip}</p>
            </div>
            <ol className="flex flex-none flex-wrap items-center gap-1" aria-label="Lessons in this stage">
              {stageLessons(viewStage).map((l, i) => {
                const unlocked = isUnlocked(progress, l.number);
                const done = progress.completed.includes(l.id);
                const skipped = progress.skipped.includes(l.id);
                const isActive = l.number === activeNumber;
                return (
                  <li key={l.id} className="flex items-center gap-1">
                    {i > 0 && <span className={`h-0.5 w-3 rounded-sm ${done || isActive ? 'bg-accent' : 'bg-surface-raised'}`} aria-hidden="true" />}
                    <button
                      type="button"
                      onClick={() => goToLesson(l.number)}
                      disabled={!unlocked || isRunning}
                      aria-current={isActive ? 'step' : undefined}
                      aria-label={`Lesson ${l.number}: ${l.title}${done ? ', passed' : skipped ? ', skipped' : unlocked ? '' : ', locked'}`}
                      title={unlocked ? `${l.number}. ${l.title}` : 'Finish the previous lesson to unlock'}
                      className={`grid h-[26px] w-[26px] place-items-center rounded-full border text-xs tabular-nums transition-colors ${
                        isActive
                          ? 'border-accent bg-accent font-bold text-surface'
                          : done
                            ? 'border-accent bg-accent-bg text-accent'
                            : unlocked
                              ? 'border-surface-border text-text hover:text-text-bright'
                              : 'cursor-not-allowed border-surface-border text-text-dim/40'
                      } ${isRunning && !isActive ? 'cursor-not-allowed opacity-30' : ''}`}
                    >
                      {done && !isActive ? <Check className="h-3 w-3" /> : skipped && !isActive ? <SkipForward className="h-3 w-3" /> : !unlocked ? <Lock className="h-3 w-3" /> : l.number}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
          {/* Where you are in all the lessons */}
          <div className="grid gap-0.5 px-3.5 pb-2" style={{ gridTemplateColumns: `repeat(${courseLessons.length}, minmax(0, 1fr))` }} aria-hidden="true">
            {courseLessons.map((l) => (
              <span
                key={l.id}
                className={`h-1 rounded-sm ${
                  l.number === activeNumber ? 'bg-accent outline outline-1 outline-offset-1 outline-accent' : progress.completed.includes(l.id) ? 'bg-accent' : 'bg-surface-raised'
                }`}
              />
            ))}
          </div>
        </section>

        <div
          ref={typingAreaRef}
          className="relative my-5 cursor-text overflow-hidden"
          style={{ height: typingWindowHeight(lineHeight) - 24 }}
          onClick={() => inputRef.current?.focus({ preventScroll: true })}
        >
          <TypingPassage
            chars={chars}
            currentIndex={currentIndex}
            firstCharRef={firstCharRef}
            currentCharRef={currentCharRef}
            className="typing-justify transition-transform duration-150 ease-out"
            style={{ transform: `translateY(-${scrollOffset}px)` }}
          />
        </div>

        <input
          ref={inputRef}
          className="sr-only"
          aria-label="Type the text shown on screen here"
          autoFocus
          defaultValue={INPUT_SENTINEL}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          onFocus={resetMobileInput}
          onInput={(e) => handleMobileInput(e, processChar, handleBackspace)}
        />

        <div className="mt-4 flex min-h-8 flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center">
          {isRunning ? (
            <button
              type="button"
              onClick={retryLesson}
              className="text-text-dim transition-colors hover:text-text"
              title="Restart lesson"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          ) : status ? (
            <>
              <p
                role="status"
                data-lesson-status={status.kind}
                className={`text-sm ${status.kind === 'passed' ? 'text-correct' : 'text-text'}`}
              >
                {status.kind === 'passed'
                  ? `Lesson ${status.lesson} passed with ${status.accuracy}% accuracy.${
                      status.nextTitle ? ` Next: ${status.nextTitle}.` : ' That was the last lesson — repeat any lesson whenever you like.'
                    }`
                  : `Lesson ${status.lesson} needs ${status.needed}% accuracy. You got ${status.accuracy}%. Try again with new text (miss ${status.attempt} of ${MAX_FAILED_TRIES}).`}
              </p>
              {status.kind === 'failed' && canMoveOn && (
                <button
                  type="button"
                  onClick={moveOnAnyway}
                  className="inline-flex items-center gap-1 rounded-md border border-surface-border px-2.5 py-1 text-xs text-text-dim transition-colors hover:border-accent/40 hover:text-accent"
                >
                  <SkipForward className="h-3 w-3" />
                  move on anyway
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-text-dim">
              start typing to begin · {minAccuracyFor(lesson)}% accuracy passes this lesson
            </p>
          )}
        </div>

        <div className="mt-4 animate-fade-up">
          <LiveKeyboard
            nextChar={chars[currentIndex]?.char}
            lastKeyCorrect={lastKeyFlash}
            compact
          />
        </div>

        <PracticeFeedback log={log} collapsible />
      </div>
    </div>
  );
}
