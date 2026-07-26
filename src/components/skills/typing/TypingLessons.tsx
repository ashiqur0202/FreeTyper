'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Check, Lock, RotateCcw } from 'lucide-react';
import { useTypingEngine } from './useTypingEngine';
import { useTypingProgress } from './useTypingProgress';
import { lessons } from './typingData';
import type { TypingSession, Achievement } from './types';
import AchievementToast from './AchievementToast';
import LiveKeyboard from './LiveKeyboard';
import ResultCard from './ResultCard';

const PROGRESS_KEY = 'freetyper-lessons-progress';
const LEGACY_KEY = 'freetyper-completed-lessons';

interface LessonProgress {
  unlocked: number[];
  completed: number[];
}

function loadProgress(): LessonProgress {
  if (typeof window === 'undefined') {
    return { unlocked: [0], completed: [] };
  }
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as LessonProgress;
      return {
        unlocked: parsed.unlocked?.length ? parsed.unlocked : [0],
        completed: parsed.completed ?? [],
      };
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const unlocked = JSON.parse(legacy) as number[];
      return { unlocked: unlocked.length ? unlocked : [0], completed: [] };
    }
  } catch {
    /* ignore */
  }
  return { unlocked: [0], completed: [] };
}

function saveProgress(progress: LessonProgress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export default function TypingLessons() {
  const [activeLesson, setActiveLesson] = useState(0);
  const [progress, setProgress] = useState<LessonProgress>({ unlocked: [0], completed: [] });
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<TypingSession | null>(null);
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const [lastKeyFlash, setLastKeyFlash] = useState<{ key: string; correct: boolean } | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const typingAreaRef = useRef<HTMLDivElement>(null);
  const firstCharRef = useRef<HTMLSpanElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);
  const activeLessonRef = useRef(activeLesson);
  const progressRef = useRef(progress);
  const isRunningRef = useRef(false);
  activeLessonRef.current = activeLesson;
  progressRef.current = progress;

  const { addSession, updateKeyStats, checkAchievements } = useTypingProgress();
  const lesson = lessons[activeLesson];

  useEffect(() => {
    setMounted(true);
    setProgress(loadProgress());
  }, []);

  const handleComplete = useCallback(
    (session: TypingSession) => {
      const updated = {
        ...session,
        mode: 'lesson' as const,
        modeDetail: `Lesson ${lesson.id}: ${lesson.name}`,
      };
      addSession(updated);
      setResult(updated);

      setProgress((prev) => {
        const completed = prev.completed.includes(activeLesson)
          ? prev.completed
          : [...prev.completed, activeLesson];
        const unlocked =
          activeLesson < lessons.length - 1 && !prev.unlocked.includes(activeLesson + 1)
            ? [...prev.unlocked, activeLesson + 1]
            : prev.unlocked;
        const next = { unlocked, completed };
        saveProgress(next);
        return next;
      });
    },
    [activeLesson, addSession, lesson.id, lesson.name],
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
    text: lesson.text,
    onComplete: handleComplete,
    onKeyStats: (key, correct) => updateKeyStats(key, correct),
  });

  isRunningRef.current = isRunning;

  const charsRef = useRef(chars);
  const currentIndexRef = useRef(currentIndex);
  charsRef.current = chars;
  currentIndexRef.current = currentIndex;

  const resetView = useCallback(() => {
    setResult(null);
    setScrollOffset(0);
    setLineHeight(0);
    setLastKeyFlash(null);
  }, []);

  const retryLesson = useCallback(() => {
    resetView();
    restart();
    inputRef.current?.focus({ preventScroll: true });
  }, [resetView, restart]);

  const goToLesson = useCallback(
    (index: number) => {
      if (!progressRef.current.unlocked.includes(index) || isRunningRef.current) return;
      setActiveLesson(index);
      resetView();
    },
    [resetView],
  );

  useEffect(() => {
    if (isComplete) {
      const newAchievements = checkAchievements();
      if (newAchievements.length > 0) setToasts((t) => [...t, ...newAchievements]);
    }
  }, [isComplete, checkAchievements]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (isComplete) {
        if (e.key === 'Tab' || e.key === 'Enter') {
          e.preventDefault();
          const idx = activeLessonRef.current;
          const unlocked = progressRef.current.unlocked;
          if (idx < lessons.length - 1 && unlocked.includes(idx + 1)) {
            goToLesson(idx + 1);
          } else {
            retryLesson();
          }
        }
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
        const expectedChar = charsRef.current[currentIndexRef.current]?.char;
        handleInput(e.key);
        setLastKeyFlash({
          key: e.key === ' ' ? ' ' : e.key.toLowerCase(),
          correct: e.key === expectedChar,
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleInput, handleBackspace, isComplete, goToLesson, retryLesson]);

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
      const spans = container.children;
      for (let i = 1; i < spans.length; i++) {
        const prevTop = (spans[i - 1] as HTMLElement).offsetTop;
        const currTop = (spans[i] as HTMLElement).offsetTop;
        if (currTop > prevTop) {
          lh = currTop - prevTop;
          setLineHeight(lh);
          break;
        }
      }
      if (lh === 0) return;
    }

    const currentLine = Math.round((currentTop - baseTop) / lh);
    if (currentLine >= 2) {
      setScrollOffset((currentLine - 1) * lh);
    } else {
      setScrollOffset(0);
    }
  }, [currentIndex, lineHeight, chars.length]);

  const unlockedSet = new Set(progress.unlocked);
  const completedSet = new Set(progress.completed);
  const hasNext = activeLesson < lessons.length - 1 && unlockedSet.has(activeLesson + 1);

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="flex flex-wrap items-center justify-center gap-1">
          {lessons.map((l) => (
            <span key={l.id} className="px-2 py-1 text-xs text-text-dim">
              {l.name}
            </span>
          ))}
        </div>
        <div className="h-20" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
      {toasts.map((a, i) => (
        <AchievementToast
          key={a.id + i}
          achievement={a}
          onClose={() => setToasts((t) => t.filter((_, j) => j !== i))}
        />
      ))}

      {!result ? (
        <div className="w-full">
          <div className="mb-2 flex flex-wrap items-center justify-center gap-1">
            {lessons.map((l, i) => {
              const unlocked = unlockedSet.has(i);
              const done = completedSet.has(i);
              const isActive = i === activeLesson;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => goToLesson(i)}
                  disabled={!unlocked || isRunning}
                  title={unlocked ? l.description : 'Complete the previous lesson to unlock'}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs transition-all ${
                    isActive
                      ? 'bg-accent-bg text-accent'
                      : unlocked
                        ? 'text-text-dim hover:bg-surface-raised hover:text-text'
                        : 'cursor-not-allowed text-text-dim/40'
                  } ${isRunning ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  {done ? (
                    <Check className="h-3 w-3 text-accent" />
                  ) : !unlocked ? (
                    <Lock className="h-3 w-3" />
                  ) : null}
                  <span>
                    {i + 1}. {l.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-sm text-text-dim">
            <span className="text-text-bright">{lesson.name}</span>
            <span className="text-surface-border">·</span>
            <span className="tabular-nums text-correct">
              {isRunning ? wpm : '--'}
              <span className="text-text-dim"> wpm</span>
            </span>
            <span className="text-surface-border">·</span>
            <span className="tabular-nums text-correct">
              {isRunning ? accuracy : '--'}
              <span className="text-text-dim">%</span>
            </span>
            {lesson.keys[0] !== 'all' && (
              <>
                <span className="text-surface-border">·</span>
                <span className="text-[11px] tracking-wide">
                  keys: <span className="text-text">{lesson.keys.join(' ').toUpperCase()}</span>
                </span>
              </>
            )}
          </div>

          <div className="mx-auto mt-3 h-0.5 w-full max-w-2xl overflow-hidden rounded-full bg-surface-raised">
            <div
              className={`h-full rounded-full bg-accent transition-all duration-150 ${
                isRunning ? 'progress-glow' : ''
              }`}
              style={{
                width: chars.length
                  ? `${Math.min(100, (currentIndex / chars.length) * 100)}%`
                  : '0%',
              }}
            />
          </div>

          <div
            ref={typingAreaRef}
            className="relative mx-auto mt-4 max-w-3xl cursor-text overflow-hidden py-3"
            style={{ height: lineHeight > 0 ? lineHeight * 3 + 24 : 112 }}
            onClick={() => inputRef.current?.focus({ preventScroll: true })}
          >
            <div
              className="typing-text text-lg leading-relaxed tracking-wide transition-transform duration-150 ease-out"
              style={{ transform: `translateY(-${scrollOffset}px)` }}
            >
              {chars.map((c, i) => (
                <span
                  key={i}
                  ref={(el) => {
                    if (i === 0) firstCharRef.current = el;
                    if (i === currentIndex) currentCharRef.current = el;
                  }}
                  className={`char ${c.status}`}
                >
                  {c.char}
                </span>
              ))}
            </div>
          </div>

          <input ref={inputRef} className="sr-only" autoFocus />

          <div className="mt-6 flex h-8 items-center justify-center">
            {!isRunning && !isComplete && (
              <p className="text-sm text-text-dim">start typing to begin</p>
            )}
            {isRunning && (
              <button
                type="button"
                onClick={retryLesson}
                className="text-text-dim transition-colors hover:text-text"
                title="Restart lesson"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="mt-4 animate-fade-up">
            <LiveKeyboard
              nextChar={chars[currentIndex]?.char}
              lastKeyCorrect={lastKeyFlash}
              focusKeys={lesson.keys}
              compact
            />
          </div>

          <p className="mt-6 text-center text-[11px] text-text-dim/70">{lesson.description}</p>
        </div>
      ) : (
        <ResultCard
          result={result}
          onNext={() => (hasNext ? goToLesson(activeLesson + 1) : retryLesson())}
          nextLabel={hasNext ? 'next lesson' : 'retry lesson'}
          nextHint={hasNext ? 'tab · next lesson' : 'tab · retry'}
          onRetry={hasNext ? retryLesson : undefined}
          retryLabel="retry"
        />
      )}
    </div>
  );
}
