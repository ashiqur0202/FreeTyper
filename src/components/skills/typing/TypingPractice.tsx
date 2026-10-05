'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { RotateCcw, Shuffle } from 'lucide-react';
import { useTypingEngine } from './useTypingEngine';
import { useTypingProgress } from './useTypingProgress';
import { withoutRun } from './runStats';
import { recordPair, getPairStore, weakPairsOf } from './pairStats';
import { generatePairDrill, generateKeyDrill } from './pairDrill';
import { scoreLetters, summarize, pickFocus, MIN_JUDGED_TO_ADAPT, type LetterScore, type LetterLevel } from './letterStats';
import LetterRow from './LetterRow';
import { COURSE_WORDS } from './courseWords';
import { practiceTexts } from './typingData';
import type { TypingSession, Achievement } from './types';
import AchievementToast from './AchievementToast';
import LiveKeyboard from './LiveKeyboard';
import { useKeySound } from './useKeySound';
import { trackEvent } from '@/lib/analytics';
import { INPUT_SENTINEL, handleMobileInput, resetMobileInput } from './mobileInput';
import PracticeFeedback, {
  coachNote,
  type PracticeLogEntry,
} from './PracticeFeedback';
import TypingPassage, { measureTypingLineHeight, typingWindowHeight } from './TypingPassage';

type Category = 'adaptive' | 'quotes' | 'news' | 'code' | 'fun';

type AdaptiveInfo = {
  kind: 'warmup' | 'auto' | 'pairs' | 'mixed' | 'manual';
  key?: string;
  reason?: 'weak' | 'new';
  level?: LetterLevel;
  items: string[];
};

function randomWords(count: number): string {
  return Array.from({ length: count }, () => COURSE_WORDS[Math.floor(Math.random() * COURSE_WORDS.length)]).join(' ');
}

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'adaptive', label: 'adaptive' },
  { id: 'quotes', label: 'quotes' },
  { id: 'news', label: 'news' },
  { id: 'code', label: 'code' },
  { id: 'fun', label: 'fun' },
];

const LOG_KEY = 'freetyper-practice-log';
const LOG_MAX = 5;

function loadPracticeLog(): PracticeLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PracticeLogEntry[];
    if (!Array.isArray(parsed)) return [];
    const trimmed = parsed.slice(0, LOG_MAX).map((entry, i, arr) => {
      if (entry.headline && entry.tone) return entry;
      return { ...entry, ...coachNote(entry, arr[i + 1], arr.slice(i + 1)) };
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

export default function TypingPractice() {
  const [category, setCategory] = useState<Category>('adaptive');
  const [text, setText] = useState('');
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<TypingSession | null>(null);
  const [log, setLog] = useState<PracticeLogEntry[]>([]);
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const [lastKeyFlash, setLastKeyFlash] = useState<{ key: string; correct: boolean } | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);
  const [weakFocus, setWeakFocus] = useState<AdaptiveInfo | null>(null);
  const [letterScores, setLetterScores] = useState<LetterScore[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const typingAreaRef = useRef<HTMLDivElement>(null);
  const firstCharRef = useRef<HTMLSpanElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);
  const isRunningRef = useRef(false);
  const categoryRef = useRef(category);
  categoryRef.current = category;

  const { progress, addSession, updateKeyStats, checkAchievements } = useTypingProgress();
  const focusKeyRef = useRef<string | null>(null);
  const keyStatsRef = useRef(progress.keyStats);
  useEffect(() => {
    keyStatsRef.current = progress.keyStats;
  }, [progress.keyStats]);

  const generateText = useCallback(
    (cat: Category) => {
      if (cat !== 'adaptive') {
        setWeakFocus(null);
      } else {
        const store = getPairStore();
        const weakPairs = weakPairsOf(store, 10).map((p) => p.pair);
        // A letter picked by hand in the row above.
        const picked = focusKeyRef.current;
        if (picked) {
          setWeakFocus({ kind: 'manual', key: picked, items: weakPairs.filter((p) => p[1] === picked) });
          return generateKeyDrill(picked, weakPairs).text;
        }
        const scores = scoreLetters(keyStatsRef.current, store);
        // Not enough data yet: common words that use every letter, so the data can build up.
        if (summarize(scores).judged < MIN_JUDGED_TO_ADAPT) {
          setWeakFocus({ kind: 'warmup', items: [] });
          return randomWords(40);
        }
        // The worst key that is not good yet, or the next key to introduce.
        const focus = pickFocus(scores);
        if (focus) {
          const drill = generateKeyDrill(focus.key, weakPairs);
          setWeakFocus({ kind: 'auto', key: focus.key, reason: focus.reason, level: focus.level, items: drill.pairs });
          return drill.text;
        }
        // Every key is good: your slowest pairs, or a general mix.
        if (weakPairs.length > 0) {
          const drill = generatePairDrill(weakPairs.slice(0, 5));
          setWeakFocus({ kind: 'pairs', items: drill.pairs });
          return drill.text;
        }
        setWeakFocus({ kind: 'mixed', items: [] });
        return randomWords(40);
      }
      const pool = practiceTexts.filter((p) => p.category === cat);
      if (pool.length === 0) return practiceTexts[0].text;
      return pool[Math.floor(Math.random() * pool.length)].text;
    },
    [],
  );

  // Keep the latest generator in a ref so effects do not re-run when it changes.
  const generateTextRef = useRef(generateText);
  useEffect(() => {
    generateTextRef.current = generateText;
  }, [generateText]);

  useEffect(() => {
    setMounted(true);
    setText(generateTextRef.current('adaptive'));
    setLog(loadPracticeLog());
  }, []);

  // Colour the letter row from the stored key and pair data, once on load and after each finished run.
  useEffect(() => {
    if (!mounted) return;
    setLetterScores(scoreLetters(keyStatsRef.current, getPairStore()));
  }, [mounted, result]);

  useEffect(() => {
    if (!mounted) return;
    setText(generateTextRef.current(category));
    setScrollOffset(0);
    setLineHeight(0);
    setLastKeyFlash(null);
  }, [category, mounted]);

  const handleComplete = useCallback(
    (session: TypingSession) => {
      const updated = {
        ...session,
        mode: 'practice' as const,
        modeDetail: categoryRef.current,
      };
      addSession(withoutRun(updated));
      trackEvent('practice_complete', {
        category: categoryRef.current,
        wpm: session.wpm,
        accuracy: session.accuracy,
      });
      setResult(updated);
      setLog((prev) => {
        const note = coachNote(updated, prev[0], prev);
        const entry: PracticeLogEntry = {
          ...updated,
          ...note,
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

  const textRef = useRef(text);
  textRef.current = text;

  const nextText = useCallback(() => {
    let next = generateTextRef.current(categoryRef.current);
    for (let i = 0; i < 8 && next === textRef.current; i++) {
      next = generateTextRef.current(categoryRef.current);
    }
    setScrollOffset(0);
    setLineHeight(0);
    setLastKeyFlash(null);
    setText(next);
    restart(next);
    isCompleteRef.current = false;
    inputRef.current?.focus({ preventScroll: true });
  }, [restart]);

  const nextTextRef = useRef(nextText);
  nextTextRef.current = nextText;
  const lastCompleteIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isComplete || !result) return;
    if (lastCompleteIdRef.current === result.id) return;
    lastCompleteIdRef.current = result.id;
    const newA = checkAchievements();
    if (newA.length > 0) setToasts((t) => [...t, ...newA]);
    nextTextRef.current();
  }, [isComplete, result, checkAchievements]);

  const retryText = useCallback(() => {
    setScrollOffset(0);
    setLineHeight(0);
    setLastKeyFlash(null);
    restart();
    inputRef.current?.focus({ preventScroll: true });
  }, [restart]);

  const retryTextRef = useRef(retryText);
  retryTextRef.current = retryText;

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

  // 3-line scroll
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

  const changeCategory = (cat: Category) => {
    if (isRunningRef.current) return;
    // Choosing a tab (including "weak keys") ends a letter drill and goes back to the automatic one.
    focusKeyRef.current = null;
    if (cat === category) {
      if (cat === 'adaptive') nextTextRef.current();
      return;
    }
    setCategory(cat);
    setResult(null);
  };

  /** Drill one letter picked in the row. */
  const pickKey = (key: string) => {
    if (isRunningRef.current) return;
    focusKeyRef.current = key;
    if (category !== 'adaptive') {
      setCategory('adaptive');
      setResult(null);
    } else {
      nextTextRef.current();
    }
  };

  if (!mounted || !text) {
    return (
      <div className="w-full">
        <div className="flex flex-wrap items-center gap-1">
          {CATEGORIES.map((c) => (
            <span key={c.id} className="px-2.5 py-1 text-xs text-text-dim">
              {c.label}
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
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => changeCategory(cat.id)}
                  disabled={isRunning}
                  className={`rounded-md px-2.5 py-1 text-xs transition-all ${
                    category === cat.id
                      ? 'bg-accent-bg font-medium text-text-bright'
                      : 'text-text hover:bg-surface-raised hover:text-text-bright'
                  } ${isRunning ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
                >
                  {cat.label}
                </button>
              ))}
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

          <LetterRow
            scores={letterScores}
            focusKey={category === 'adaptive' ? (weakFocus?.key ?? null) : null}
            manual={category === 'adaptive' && weakFocus?.kind === 'manual'}
            disabled={isRunning}
            onPick={pickKey}
            onBack={() => changeCategory('adaptive')}
          />

          {category === 'adaptive' && weakFocus && (
            <p
              className={weakFocus.kind === 'auto' || weakFocus.kind === 'manual' ? 'sr-only' : 'mb-3 text-xs leading-relaxed text-text-dim'}
              data-weak-focus={weakFocus.kind}
            >
              {weakFocus.kind === 'warmup' && <>Warming up: type a little so adaptive practice can learn your keys.</>}
              {weakFocus.kind === 'auto' && (
                <>
                  {weakFocus.reason === 'new' ? 'Next key to learn: ' : `Your ${weakFocus.level === 'bad' ? 'weakest' : weakFocus.level === 'weak' ? 'weak' : 'next'} key: `}
                  {weakFocus.key?.toUpperCase()}.
                  {weakFocus.items.length > 0 && <> Slow pairs: {weakFocus.items.join(', ')}.</>}
                </>
              )}
              {weakFocus.kind === 'manual' && <>Drilling the key {weakFocus.key?.toUpperCase()}.</>}
              {weakFocus.kind === 'pairs' && (
                <>
                  All keys good. Slowest pairs:{' '}
                  {weakFocus.items.map((p) => (
                    <kbd key={p} className="mr-1 rounded border border-surface-border bg-surface-raised px-1.5 py-0.5 font-mono text-[10px] text-accent">
                      {p}
                    </kbd>
                  ))}
                </>
              )}
              {weakFocus.kind === 'mixed' && <>All keys good. Keep going to find new weak spots.</>}
            </p>
          )}

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

          <div className="mt-4 flex h-8 items-center justify-center gap-4">
            {!isRunning ? (
              <p className="text-sm text-text-dim">start typing to begin</p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={nextText}
                  className="text-text-dim transition-colors hover:text-text"
                  title="New text"
                >
                  <Shuffle className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={retryText}
                  className="text-text-dim transition-colors hover:text-text"
                  title="Restart"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          <div className="mt-4 animate-fade-up">
            <LiveKeyboard
              nextChar={chars[currentIndex]?.char}
              lastKeyCorrect={lastKeyFlash}
              compact
            />
          </div>

          <PracticeFeedback
            log={log}
            currentCategory={category}
            onTryWeakKeys={() => changeCategory('adaptive')}
          />
        </div>
    </div>
  );
}
