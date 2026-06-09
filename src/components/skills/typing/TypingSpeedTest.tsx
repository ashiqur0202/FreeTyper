'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { RotateCcw, Settings2, X, Maximize, Minimize } from 'lucide-react';
import { useTypingEngine } from './useTypingEngine';
import { useTypingProgress } from './useTypingProgress';
import { practiceTexts } from './typingData';
import { wordPools } from './gameData';
import type { TypingSession, Achievement } from './types';
import AchievementToast from './AchievementToast';
import LiveKeyboard from './LiveKeyboard';
import ResultCard from './ResultCard';

type TextMode = 'words' | 'sentences' | 'code';

const TEXT_MODES: { id: TextMode; label: string }[] = [
  { id: 'words', label: 'words' },
  { id: 'sentences', label: 'sentences' },
  { id: 'code', label: 'code' },
];

interface DurationOption {
  seconds: number;
  label: string;
}

const DURATION_OPTIONS: DurationOption[] = [
  { seconds: 15, label: '15s' },
  { seconds: 30, label: '30s' },
  { seconds: 60, label: '1m' },
  { seconds: 120, label: '2m' },
  { seconds: 180, label: '3m' },
  { seconds: 300, label: '5m' },
  { seconds: 600, label: '10m' },
  { seconds: 900, label: '15m' },
  { seconds: 1800, label: '30m' },
];

function generateTestText(mode: TextMode): string {
  if (mode === 'words') {
    const allWords = [...wordPools.easy, ...wordPools.medium];
    const shuffled = allWords.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 60).join(' ');
  }
  if (mode === 'code') {
    const codeTexts = practiceTexts.filter((p) => p.category === 'code');
    const shuffled = [...codeTexts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2).map((p) => p.text).join(' ');
  }
  // sentences — mix quotes, news, fun
  const proseTexts = practiceTexts.filter((p) => p.category !== 'code');
  const shuffled = [...proseTexts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((p) => p.text).join(' ');
}

export default function TypingSpeedTest() {
  const [duration, setDuration] = useState(60);
  const [text, setText] = useState('');
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<TypingSession | null>(null);
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const [customDuration, setCustomDuration] = useState<number | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [textMode, setTextMode] = useState<TextMode>('sentences');
  const [focusMode, setFocusMode] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [lastKeyFlash, setLastKeyFlash] = useState<{ key: string; correct: boolean } | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [lineHeight, setLineHeight] = useState(0);
  const firstCharRef = useRef<HTMLSpanElement>(null);
  const commandRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  const typingAreaRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);

  const { addSession, updateKeyStats, checkAchievements } = useTypingProgress();

  const handleComplete = useCallback((session: TypingSession) => {
    const updated = { ...session, mode: 'speed-test' as const, modeDetail: `${duration}s` };
    addSession(updated);
    setResult(updated);
  }, [addSession, duration]);

  const { chars, currentIndex, wpm, accuracy, isRunning, isComplete, timeLeft, restart, handleInput, handleBackspace } =
    useTypingEngine({
      text,
      timed: duration,
      onComplete: handleComplete,
      onKeyStats: (key, correct) => updateKeyStats(key, correct),
    });

  useEffect(() => {
    setMounted(true);
    setText(generateTestText('sentences'));
  }, []);

  useEffect(() => {
    if (isComplete) {
      const newA = checkAchievements();
      if (newA.length > 0) setToasts((t) => [...t, ...newA]);
    }
  }, [isComplete, checkAchievements]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Command palette
      if (showCommandPalette) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setShowCommandPalette(false);
          setCommandInput('');
        }
        return; // let the input handle typing
      }

      if (e.ctrlKey || e.altKey || e.metaKey) return;

      // Shortcuts that only work when test is COMPLETE (showing results)
      if (isComplete) {
        if (e.key === 'Tab') {
          e.preventDefault();
          startNewTest();
          return;
        }
        if (e.key === '/' || e.key === 'Escape') {
          e.preventDefault();
          startNewTest();
          return;
        }
        return; // don't capture any other keys after test completes
      }

      // Escape to exit focus mode (only when NOT typing)
      if (e.key === 'Escape' && !isRunning && focusMode) {
        e.preventDefault();
        setFocusMode(false);
        return;
      }

      // `/` to open command palette (only when idle — not started yet)
      if (e.key === '/' && !isRunning) {
        e.preventDefault();
        setShowCommandPalette(true);
        setTimeout(() => commandRef.current?.focus(), 50);
        return;
      }

      // During typing — backspace to correct
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      // During typing — only pass through printable characters
      if (e.key.length === 1) {
        e.preventDefault();
        const expectedChar = chars[currentIndex]?.char;
        handleInput(e.key);
        // Flash the key on the live keyboard
        setLastKeyFlash({
          key: e.key === ' ' ? ' ' : e.key.toLowerCase(),
          correct: e.key === expectedChar,
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleInput, isComplete]);

  // Line-tracking scroll: recalculate from DOM on every index change (idempotent)
  useLayoutEffect(() => {
    // Prevent any browser-initiated scrolling on the container
    if (typingAreaRef.current && typingAreaRef.current.scrollTop !== 0) {
      typingAreaRef.current.scrollTop = 0;
    }

    if (!currentCharRef.current || !chars.length) {
      setScrollOffset(0);
      return;
    }

    const currentTop = currentCharRef.current.offsetTop;

    // Need baseline from char[0]
    if (!firstCharRef.current) {
      setScrollOffset(0);
      return;
    }
    const baseTop = firstCharRef.current.offsetTop;

    // Still on the first line — no scroll needed
    if (currentTop === baseTop) {
      setScrollOffset(0);
      return;
    }

    // Measure line height if not yet known
    let lh = lineHeight;
    if (lh === 0) {
      // Scan DOM for the first pair of chars on different lines
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
      if (lh === 0) return; // couldn't measure yet
    }

    // Which line is cursor on? (0-based, relative to baseline)
    const currentLine = Math.round((currentTop - baseTop) / lh);

    // Keep current line as 2nd visible line, show 3 total
    if (currentLine >= 2) {
      setScrollOffset((currentLine - 1) * lh);
    } else {
      setScrollOffset(0);
    }
  }, [currentIndex, lineHeight, chars.length]);

  const startNewTest = useCallback((dur?: number) => {
    const d = dur ?? duration;
    setDuration(d);
    setCustomDuration(null);
    setResult(null);
    setScrollOffset(0);
    setLineHeight(0);
    // Generate new text to trigger engine reset with updated duration
    setText(generateTestText(textMode));
    setShowCustomInput(false);
  }, [duration, textMode]);

  const applyCustomDuration = () => {
    const val = parseInt(customValue);
    if (val && val > 0 && val <= 120) {
      const secs = val * 60; // input is in minutes
      setCustomDuration(secs);
      startNewTest(secs);
    }
  };

  const activeDuration = customDuration ?? duration;

  // Command palette handler
  const executeCommand = useCallback((cmd: string) => {
    const c = cmd.trim().toLowerCase();
    setShowCommandPalette(false);
    setCommandInput('');

    // Time commands
    const timeMatch = c.match(/^(?:time|t)\s+(\d+)(s|m)?/);
    if (timeMatch) {
      const val = parseInt(timeMatch[1]);
      const unit = timeMatch[2] || 's';
      const secs = unit === 'm' ? val * 60 : val;
      setCustomDuration(secs);
      startNewTest(secs);
      return;
    }

    switch (c) {
      case 'restart':
      case 'r':
        startNewTest();
        break;
      case 'focus':
      case 'f':
        setFocusMode((prev) => !prev);
        break;
      case 'words':
      case 'w':
        setTextMode('words');
        setResult(null);
        setText(generateTestText('words'));
        restart();
        break;
      case 'sentences':
      case 's':
        setTextMode('sentences');
        setResult(null);
        setText(generateTestText('sentences'));
        restart();
        break;
      case 'code':
      case 'c':
        setTextMode('code');
        setResult(null);
        setText(generateTestText('code'));
        restart();
        break;
    }
  }, [startNewTest, restart]);

  const seconds = Math.ceil(timeLeft || activeDuration);
  const progress = isRunning ? ((activeDuration - (timeLeft || 0)) / activeDuration) * 100 : 0;
  const isLowTime = isRunning && timeLeft < 10 && timeLeft < activeDuration * 0.1;

  if (!mounted || !text) {
    return (
      <div className="flex flex-col items-center gap-8">
        <div className="flex flex-wrap items-center justify-center gap-1">
          {DURATION_OPTIONS.map((d) => (
            <span key={d.seconds} className="px-2 py-1 text-xs text-text-dim">
              {d.label}
            </span>
          ))}
          <span className="px-2 py-1 text-xs text-text-dim">custom</span>
        </div>
        <div className="h-20" />
      </div>
    );
  }

  // Content to render
  const testContent = (
    <>
      {toasts.map((a, i) => (
        <AchievementToast key={a.id + i} achievement={a} onClose={() => setToasts((t) => t.filter((_, j) => j !== i))} />
      ))}

      {!result ? (
        <div className="w-full">
          {/* Config bar — durations left, modes right */}
          <div className="mb-4">
            <div className="flex flex-wrap items-center justify-between gap-y-2">
              {/* Duration pills */}
              <div className="flex flex-wrap items-center gap-1">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d.seconds}
                    onClick={() => { setCustomDuration(null); !isRunning && startNewTest(d.seconds); }}
                    disabled={isRunning}
                    className={`rounded-md px-2 py-1 text-xs transition-all ${
                      activeDuration === d.seconds && !customDuration
                        ? 'bg-accent-bg text-accent'
                        : 'text-text-dim hover:bg-surface-raised hover:text-text'
                    } ${isRunning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {d.label}
                  </button>
                ))}

                {/* Custom icon button */}
                <button
                  onClick={() => !isRunning && setShowCustomInput(!showCustomInput)}
                  disabled={isRunning}
                  className={`flex items-center justify-center rounded-md p-1.5 transition-all ${
                    customDuration
                      ? 'bg-accent-bg text-accent'
                      : 'text-text-dim hover:bg-surface-raised hover:text-text'
                  } ${isRunning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                  title="Custom time"
                >
                  <Settings2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Text mode pills + fullscreen */}
              <div className="flex items-center gap-1">
                {TEXT_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (isRunning) return;
                      setTextMode(m.id);
                      setResult(null);
                      setText(generateTestText(m.id));
                      restart();
                    }}
                    disabled={isRunning}
                    className={`rounded-md px-2 py-1 text-xs transition-all ${
                      textMode === m.id
                        ? 'bg-accent-bg text-accent'
                        : 'text-text-dim hover:bg-surface-raised hover:text-text'
                    } ${isRunning ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {m.label}
                  </button>
                ))}

                {/* Fullscreen toggle */}
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className="flex items-center justify-center rounded-md p-1.5 text-text-dim transition-all hover:bg-surface-raised hover:text-text"
                  title={focusMode ? 'Exit focus mode (Esc)' : 'Focus mode'}
                >
                  {focusMode ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Timer / live stats — always same structure to prevent layout shift */}
            <div className="mt-2 flex items-center gap-4 font-mono text-sm text-text-dim">
              <span className={`tabular-nums ${isLowTime && isRunning ? 'text-error' : 'text-text-bright'}`}>
                {seconds}
              </span>
              <span className="text-surface-border">·</span>
              <span className="tabular-nums text-correct">
                {isRunning ? wpm : '--'}<span className="text-text-dim"> wpm</span>
              </span>
              <span className="text-surface-border">·</span>
              <span className="tabular-nums text-correct">
                {isRunning ? accuracy : '--'}<span className="text-text-dim">%</span>
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-surface-raised">
              <div
                className={`h-full rounded-full transition-all duration-300 ease-linear ${
                  isLowTime ? 'bg-error' : 'bg-accent'
                } ${isRunning && !isLowTime ? 'progress-glow' : ''}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Typing area — 3-line scrolling window */}
          <div
            ref={typingAreaRef}
            className="cursor-text overflow-hidden relative py-3"
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

          {/* Hidden input outside scroll container — prevents browser scroll-on-focus */}
          <input ref={inputRef} className="sr-only" autoFocus />

          {/* Bottom area — always same height to prevent shift */}
          <div className="mt-6 flex h-8 items-center justify-center">
            {!isRunning && !isComplete && (
              <p className="text-sm text-text-dim">start typing to begin</p>
            )}
            {isRunning && (
              <button onClick={restart} className="text-text-dim transition-colors hover:text-text" title="Restart (Tab after test)">
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Live keyboard visualizer */}
          <div className="mt-4 animate-fade-up">
            <LiveKeyboard
              nextChar={chars[currentIndex]?.char}
              lastKeyCorrect={lastKeyFlash}
              compact
            />
          </div>
        </div>
      ) : (
        /* Results screen — new shareable card */
        <ResultCard result={result} onNext={() => startNewTest()} />
      )}

      {/* Command palette */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center pt-[20vh]">
          <div className="absolute inset-0 bg-black/60" onClick={() => { setShowCommandPalette(false); setCommandInput(''); }} />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-surface-border bg-surface shadow-2xl">
            <div className="flex items-center gap-2 border-b border-surface-border px-4 py-3">
              <span className="text-text-dim">›</span>
              <input
                ref={commandRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') executeCommand(commandInput);
                  if (e.key === 'Escape') { setShowCommandPalette(false); setCommandInput(''); }
                }}
                placeholder="type a command..."
                className="flex-1 bg-transparent text-sm text-text focus:outline-none"
                autoFocus
              />
            </div>
            <div className="px-4 py-3">
              <p className="mb-2 text-[10px] uppercase tracking-widest text-text-dim">commands</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-dim">restart</span>
                  <span className="font-mono text-surface-border">r</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-dim">focus mode</span>
                  <span className="font-mono text-surface-border">f</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-dim">words</span>
                  <span className="font-mono text-surface-border">w</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-dim">sentences</span>
                  <span className="font-mono text-surface-border">s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-dim">code</span>
                  <span className="font-mono text-surface-border">c</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-dim">set time</span>
                  <span className="font-mono text-surface-border">t 60s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom time modal */}
      {showCustomInput && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCustomInput(false)} />
          <div className="relative z-10 w-full max-w-xs rounded-xl border border-surface-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-border px-5 py-3">
              <span className="text-sm font-medium text-text">Custom Time</span>
              <button
                onClick={() => setShowCustomInput(false)}
                className="rounded-md p-1 text-text-dim transition-colors hover:bg-surface-raised hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4">
              <label className="mb-2 block text-xs text-text-dim">Duration in minutes (1–120)</label>
              <input
                ref={customInputRef}
                type="number"
                min="1"
                max="120"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyCustomDuration()}
                placeholder="e.g. 45"
                className="w-full rounded-md border border-surface-border bg-surface-raised px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
                autoFocus
              />
              <button
                onClick={applyCustomDuration}
                className="mt-3 w-full rounded-lg bg-accent py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90"
              >
                start test
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Focus mode: fullscreen overlay hiding sidebars
  if (focusMode) {
    return (
      <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-surface">
        <div className="w-full max-w-5xl px-12">
          {testContent}
        </div>
        <p className="absolute bottom-4 text-[10px] text-surface-border">
          press Esc to exit focus mode
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0">
      {testContent}
    </div>
  );
}
