'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { Check, Lock, RotateCcw } from 'lucide-react';
import { useTypingEngine } from './useTypingEngine';
import { useTypingProgress } from './useTypingProgress';
import { lessons } from './typingData';
import type { TypingSession, Achievement } from './types';
import AchievementToast from './AchievementToast';
import LiveKeyboard from './LiveKeyboard';
import { useKeySound } from './useKeySound';
import { INPUT_SENTINEL, handleMobileInput, resetMobileInput } from './mobileInput';
import PracticeFeedback, {
  lessonCoachNote,
  type PracticeLogEntry,
} from './PracticeFeedback';
import TypingPassage, { measureTypingLineHeight, typingWindowHeight } from './TypingPassage';

const PROGRESS_KEY = 'freetyper-lessons-progress';
const LEGACY_KEY = 'freetyper-completed-lessons';
const LOG_KEY = 'freetyper-lessons-log';
const LOG_MAX = 5;

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

export default function TypingLessons() {
  const [activeLesson, setActiveLesson] = useState(0);
  const [progress, setProgress] = useState<LessonProgress>({ unlocked: [0], completed: [] });
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
    setLog(loadLessonLog());
  }, []);

  const handleComplete = useCallback((session: TypingSession) => {
    const idx = activeLessonRef.current;
    const current = lessons[idx];
    const updated = {
      ...session,
      mode: 'lesson' as const,
      modeDetail: current.name,
    };
    addSession(updated);
    setResult(updated);
    setLog((prev) => {
      const entry: PracticeLogEntry = {
        ...updated,
        ...lessonCoachNote(updated, prev[0], prev),
      };
      const next = [entry, ...prev].slice(0, LOG_MAX);
      try {
        localStorage.setItem(LOG_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });

    setProgress((prev) => {
      const completed = prev.completed.includes(idx) ? prev.completed : [...prev.completed, idx];
      const unlocked =
        idx < lessons.length - 1 && !prev.unlocked.includes(idx + 1)
          ? [...prev.unlocked, idx + 1]
          : prev.unlocked;
      const next = { unlocked, completed };
      progressRef.current = next;
      saveProgress(next);
      return next;
    });
  }, [addSession]);

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

  const retryLesson = useCallback(() => {
    resetView();
    restart();
    isCompleteRef.current = false;
    inputRef.current?.focus({ preventScroll: true });
  }, [resetView, restart]);

  const goToLesson = useCallback(
    (index: number) => {
      if (!progressRef.current.unlocked.includes(index) || isRunningRef.current) return;
      setActiveLesson(index);
      resetView();
      restart(lessons[index].text);
      isCompleteRef.current = false;
      inputRef.current?.focus({ preventScroll: true });
    },
    [resetView, restart],
  );

  const restartRef = useRef(restart);
  restartRef.current = restart;
  const lastCompleteIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isComplete || !result) return;
    if (lastCompleteIdRef.current === result.id) return;
    lastCompleteIdRef.current = result.id;
    const newAchievements = checkAchievements();
    if (newAchievements.length > 0) setToasts((t) => [...t, ...newAchievements]);

    const idx = activeLessonRef.current;
    resetView();
    if (idx < lessons.length - 1) {
      const next = lessons[idx + 1];
      setActiveLesson(idx + 1);
      restartRef.current(next.text);
    } else {
      restartRef.current();
    }
    isCompleteRef.current = false;
    inputRef.current?.focus({ preventScroll: true });
  }, [isComplete, result, checkAchievements, resetView]);

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

  const unlockedSet = new Set(progress.unlocked);
  const completedSet = new Set(progress.completed);

  if (!mounted) {
    return (
      <div className="w-full">
        <div className="flex flex-wrap items-center gap-1">
          {lessons.map((l) => (
            <span key={l.id} className="px-2.5 py-1 text-xs text-text-dim">
              {l.name}
            </span>
          ))}
        </div>
        <div className="h-20" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center">
      {toasts.map((a, i) => (
        <AchievementToast
          key={a.id + i}
          achievement={a}
          onClose={() => setToasts((t) => t.filter((_, j) => j !== i))}
        />
      ))}

      <div className="w-full">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="flex flex-wrap items-center gap-1">
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
                      ? 'bg-accent-bg font-medium text-text-bright'
                      : unlocked
                        ? 'text-text hover:bg-surface-raised hover:text-text-bright'
                        : 'cursor-not-allowed text-text-dim/40'
                  } ${isRunning ? 'cursor-not-allowed opacity-30' : ''}`}
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
          <div className="flex items-center gap-3 font-mono text-sm text-text">
            <span className="tabular-nums text-text-bright">
              {isRunning ? wpm : '--'}
              <span className="text-text"> wpm</span>
            </span>
            <span className="text-surface-border">·</span>
            <span className="tabular-nums text-text-bright">
              {isRunning ? accuracy : '--'}
              <span className="text-text">%</span>
            </span>
          </div>
        </div>

        <div className="h-0.5 w-full overflow-hidden rounded-full bg-surface-raised">
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
          className="relative mt-3 cursor-text overflow-hidden py-3"
          style={{ height: typingWindowHeight(lineHeight) }}
          onClick={() => inputRef.current?.focus({ preventScroll: true })}
        >
          <TypingPassage
            chars={chars}
            currentIndex={currentIndex}
            firstCharRef={firstCharRef}
            currentCharRef={currentCharRef}
            className="transition-transform duration-150 ease-out"
            style={{ transform: `translateY(-${scrollOffset}px)` }}
          />
        </div>

        <input
          ref={inputRef}
          className="sr-only"
          autoFocus
          defaultValue={INPUT_SENTINEL}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          onFocus={resetMobileInput}
          onInput={(e) => handleMobileInput(e, processChar, handleBackspace)}
        />

        <div className="mt-4 flex h-8 items-center justify-center">
          {!isRunning ? (
            <p className="text-sm text-text-dim">start typing to begin</p>
          ) : (
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

        <PracticeFeedback log={log} />
      </div>
    </div>
  );
}
