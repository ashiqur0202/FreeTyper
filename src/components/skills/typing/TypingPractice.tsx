'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { RotateCcw, Shuffle } from 'lucide-react';
import { useTypingEngine } from './useTypingEngine';
import { useTypingProgress } from './useTypingProgress';
import { practiceTexts } from './typingData';
import type { TypingSession, Achievement } from './types';
import AchievementToast from './AchievementToast';
import LiveKeyboard from './LiveKeyboard';
import { useKeySound } from './useKeySound';
import { INPUT_SENTINEL, handleMobileInput, resetMobileInput } from './mobileInput';
import PracticeFeedback, {
  coachNote,
  type PracticeLogEntry,
} from './PracticeFeedback';
import TypingPassage, { measureTypingLineHeight, typingWindowHeight } from './TypingPassage';

type Category = 'quotes' | 'news' | 'code' | 'fun' | 'weak';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'quotes', label: 'quotes' },
  { id: 'news', label: 'news' },
  { id: 'code', label: 'code' },
  { id: 'fun', label: 'fun' },
  { id: 'weak', label: 'weak keys' },
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
  const [category, setCategory] = useState<Category>('quotes');
  const [text, setText] = useState('');
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
  const isRunningRef = useRef(false);
  const categoryRef = useRef(category);
  categoryRef.current = category;

  const { addSession, updateKeyStats, checkAchievements, getWeakKeys } = useTypingProgress();

  const generateText = useCallback(
    (cat: Category) => {
      if (cat === 'weak') {
        const weak = getWeakKeys();
        if (weak.length === 0) {
          const random = practiceTexts[Math.floor(Math.random() * practiceTexts.length)];
          return random.text;
        }
        const weakChars = weak.map((k) => k.key).join('');
        const commonWords = [
          'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with',
          'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
          'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up',
          'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
          'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
          'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
          'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
          'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'great', 'between',
          'need', 'large', 'under', 'never', 'same', 'last', 'long', 'world', 'still', 'own', 'find',
          'here', 'thing', 'many', 'right', 'begin', 'since', 'before', 'little', 'end', 'real', 'life',
        ];
        const focused = commonWords.filter((w) =>
          weakChars.split('').some((c) => w.includes(c)),
        );
        const pool = focused.length > 5 ? focused : commonWords;
        const words: string[] = [];
        for (let i = 0; i < 40; i++) {
          words.push(pool[Math.floor(Math.random() * pool.length)]);
        }
        return words.join(' ');
      }
      const pool = practiceTexts.filter((p) => p.category === cat);
      if (pool.length === 0) return practiceTexts[0].text;
      return pool[Math.floor(Math.random() * pool.length)].text;
    },
    [getWeakKeys],
  );

  // Avoid regenerating text on every keystroke when getWeakKeys identity changes.
  const generateTextRef = useRef(generateText);
  useEffect(() => {
    generateTextRef.current = generateText;
  }, [generateText]);

  useEffect(() => {
    setMounted(true);
    setText(generateTextRef.current('quotes'));
    setLog(loadPracticeLog());
  }, []);

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
      addSession(updated);
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
    onKeyStats: (key, correct) => updateKeyStats(key, correct),
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
    if (isRunningRef.current || cat === category) return;
    setCategory(cat);
    setResult(null);
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
            onTryWeakKeys={() => changeCategory('weak')}
          />
        </div>
    </div>
  );
}
