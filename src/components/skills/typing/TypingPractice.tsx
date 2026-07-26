'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { RotateCcw, Shuffle } from 'lucide-react';
import { useTypingEngine } from './useTypingEngine';
import { useTypingProgress } from './useTypingProgress';
import { practiceTexts } from './typingData';
import type { TypingSession, Achievement } from './types';
import AchievementToast from './AchievementToast';
import LiveKeyboard from './LiveKeyboard';
import ResultCard from './ResultCard';

type Category = 'quotes' | 'news' | 'code' | 'fun' | 'weak';

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'quotes', label: 'quotes' },
  { id: 'news', label: 'news' },
  { id: 'code', label: 'code' },
  { id: 'fun', label: 'fun' },
  { id: 'weak', label: 'weak keys' },
];

export default function TypingPractice() {
  const [category, setCategory] = useState<Category>('quotes');
  const [text, setText] = useState('');
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

  const charsRef = useRef(chars);
  const currentIndexRef = useRef(currentIndex);
  charsRef.current = chars;
  currentIndexRef.current = currentIndex;

  useEffect(() => {
    if (isComplete) {
      const newA = checkAchievements();
      if (newA.length > 0) setToasts((t) => [...t, ...newA]);
    }
  }, [isComplete, checkAchievements]);

  const nextText = useCallback(() => {
    setResult(null);
    setScrollOffset(0);
    setLineHeight(0);
    setLastKeyFlash(null);
    setText(generateTextRef.current(categoryRef.current));
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const retryText = useCallback(() => {
    setResult(null);
    setScrollOffset(0);
    setLineHeight(0);
    setLastKeyFlash(null);
    restart();
    inputRef.current?.focus({ preventScroll: true });
  }, [restart]);

  const nextTextRef = useRef(nextText);
  const retryTextRef = useRef(retryText);
  nextTextRef.current = nextText;
  retryTextRef.current = retryText;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (isComplete) {
        if (e.key === 'Tab' || e.key === 'Enter') {
          e.preventDefault();
          nextTextRef.current();
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
  }, [handleInput, handleBackspace, isComplete]);

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

  const changeCategory = (cat: Category) => {
    if (isRunningRef.current || cat === category) return;
    setCategory(cat);
    setResult(null);
  };

  if (!mounted || !text) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <div className="flex flex-wrap items-center justify-center gap-1">
          {CATEGORIES.map((c) => (
            <span key={c.id} className="px-2 py-1 text-xs text-text-dim">
              {c.label}
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
          {/* Category pills */}
          <div className="mb-2 flex flex-wrap items-center justify-center gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => changeCategory(cat.id)}
                disabled={isRunning}
                className={`rounded-md px-2.5 py-1 text-xs transition-all ${
                  category === cat.id
                    ? 'bg-accent-bg text-accent'
                    : 'text-text-dim hover:bg-surface-raised hover:text-text'
                } ${isRunning ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Live stats */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-sm text-text-dim">
            <span className="tabular-nums text-correct">
              {isRunning ? wpm : '--'}
              <span className="text-text-dim"> wpm</span>
            </span>
            <span className="text-surface-border">·</span>
            <span className="tabular-nums text-correct">
              {isRunning ? accuracy : '--'}
              <span className="text-text-dim">%</span>
            </span>
            <span className="text-surface-border">·</span>
            <span className="text-[11px] tracking-wide text-text">{category}</span>
          </div>

          {/* Passage progress */}
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

          {/* Typing area — 3-line scroll */}
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
                  key={`${text.slice(0, 12)}-${i}`}
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

          <div className="mt-6 flex h-8 items-center justify-center gap-4">
            {!isRunning && !isComplete && (
              <p className="text-sm text-text-dim">start typing to begin</p>
            )}
            {isRunning && (
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

          <p className="mt-6 text-center text-[11px] text-text-dim/70">
            {category === 'weak'
              ? 'Drills words that hit your weakest keys from past sessions'
              : `Practice mode · ${category} passages · shuffle for a new text`}
          </p>
        </div>
      ) : (
        <ResultCard
          result={result}
          onNext={nextText}
          nextLabel="next text"
          nextHint="tab · next text"
          onRetry={retryText}
          retryLabel="retry"
        />
      )}
    </div>
  );
}
