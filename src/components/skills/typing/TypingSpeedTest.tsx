'use client';

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { RotateCcw, Settings2, X, Maximize, Minimize, Share2, Check, PenTool } from 'lucide-react';
import { useTypingEngine } from './useTypingEngine';
import { useTypingProgress } from './useTypingProgress';
import { practiceTexts } from './typingData';
import { wordPools } from './gameData';
import type { TypingSession, Achievement } from './types';
import AchievementToast from './AchievementToast';
import LiveKeyboard from './LiveKeyboard';
import PracticeFeedback, {
  speedTestCoachNote,
  type PracticeLogEntry,
} from './PracticeFeedback';
import TypingPassage, { measureTypingLineHeight, typingWindowHeight } from './TypingPassage';

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
  // Enough text for a 30-minute run at high WPM; timer still ends the test.
  if (mode === 'words') {
    const pool = [...wordPools.easy, ...wordPools.medium];
    const out: string[] = [];
    while (out.length < 2000) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      out.push(...shuffled);
    }
    return out.slice(0, 2000).join(' ');
  }
  if (mode === 'code') {
    const codeTexts = practiceTexts.filter((p) => p.category === 'code');
    const chunks: string[] = [];
    while (chunks.join(' ').split(/\s+/).length < 800) {
      chunks.push(...[...codeTexts].sort(() => Math.random() - 0.5).map((p) => p.text));
      if (codeTexts.length === 0) break;
    }
    return chunks.join(' ');
  }
  const proseTexts = practiceTexts.filter((p) => p.category !== 'code');
  const chunks: string[] = [];
  while (chunks.join(' ').split(/\s+/).length < 1500) {
    chunks.push(...[...proseTexts].sort(() => Math.random() - 0.5).map((p) => p.text));
    if (proseTexts.length === 0) break;
  }
  return chunks.join(' ');
}

const LOG_KEY = 'freetyper-speed-log';
const LOG_MAX = 5;

function loadSpeedLog(): PracticeLogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PracticeLogEntry[];
    if (!Array.isArray(parsed)) return [];
    const trimmed = parsed.slice(0, LOG_MAX).map((entry, i, arr) => {
      if (entry.headline && entry.tone) return entry;
      return { ...entry, ...speedTestCoachNote(entry, arr[i + 1], arr.slice(i + 1)) };
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

export default function TypingSpeedTest() {
  const [duration, setDuration] = useState(60);
  const [text, setText] = useState('');
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<TypingSession | null>(null);
  const [log, setLog] = useState<PracticeLogEntry[]>([]);
  const [copied, setCopied] = useState(false);
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
  const settingsRef = useRef({ duration, textMode, customDuration });
  settingsRef.current = { duration, textMode, customDuration };

  const handleComplete = useCallback((session: TypingSession) => {
    const { duration: dur, textMode: mode, customDuration: custom } = settingsRef.current;
    const secs = custom ?? dur;
    const updated = {
      ...session,
      mode: 'speed-test' as const,
      modeDetail: `${mode} · ${secs}s`,
    };
    addSession(updated);
    setResult(updated);
    setLog((prev) => {
      const entry: PracticeLogEntry = {
        ...updated,
        ...speedTestCoachNote(updated, prev[0], prev),
      };
      const next = [entry, ...prev].slice(0, LOG_MAX);
      try {
        localStorage.setItem(LOG_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [addSession]);

  const { chars, currentIndex, wpm, accuracy, isRunning, isComplete, timeLeft, restart, handleInput, handleBackspace } =
    useTypingEngine({
      text,
      timed: duration,
      onComplete: handleComplete,
      onKeyStats: (key, correct) => updateKeyStats(key, correct),
    });

  const isCompleteRef = useRef(false);
  isCompleteRef.current = isComplete;
  const isRunningRef = useRef(false);
  isRunningRef.current = isRunning;
  const charsRef = useRef(chars);
  const currentIndexRef = useRef(currentIndex);
  charsRef.current = chars;
  currentIndexRef.current = currentIndex;
  const showCommandPaletteRef = useRef(showCommandPalette);
  showCommandPaletteRef.current = showCommandPalette;
  const focusModeRef = useRef(focusMode);
  focusModeRef.current = focusMode;

  useEffect(() => {
    setMounted(true);
    setText(generateTestText('sentences'));
    setLog(loadSpeedLog());
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showCommandPaletteRef.current) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setShowCommandPalette(false);
          setCommandInput('');
        }
        return;
      }

      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (isCompleteRef.current) {
        e.preventDefault();
        return;
      }

      if (e.key === 'Escape' && !isRunningRef.current && focusModeRef.current) {
        e.preventDefault();
        setFocusMode(false);
        return;
      }

      if (e.key === '/' && !isRunningRef.current) {
        e.preventDefault();
        setShowCommandPalette(true);
        setTimeout(() => commandRef.current?.focus(), 50);
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
  }, [handleInput, handleBackspace]);

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
      const container = typingAreaRef.current?.querySelector('.typing-text');
      if (!container) return;
      lh = measureTypingLineHeight(container as HTMLElement);
      if (lh === 0) return;
      setLineHeight(lh);
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
    if (dur !== undefined && DURATION_OPTIONS.some((o) => o.seconds === dur)) {
      setCustomDuration(null);
    }
    setResult(null);
    setScrollOffset(0);
    setLineHeight(0);
    setLastKeyFlash(null);
    const next = generateTestText(textMode);
    setText(next);
    restart(next);
    isCompleteRef.current = false;
    setShowCustomInput(false);
    inputRef.current?.focus({ preventScroll: true });
  }, [duration, textMode, restart]);

  const startNewTestRef = useRef(startNewTest);
  startNewTestRef.current = startNewTest;
  const lastCompleteIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isComplete || !result) return;
    if (lastCompleteIdRef.current === result.id) return;
    lastCompleteIdRef.current = result.id;
    const newA = checkAchievements();
    if (newA.length > 0) setToasts((t) => [...t, ...newA]);
    startNewTestRef.current();
  }, [isComplete, result, checkAchievements]);

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

  const shareLatest = async () => {
    const run = log[0];
    if (!run) return;
    const text = `${run.wpm} WPM · ${run.accuracy}% accuracy — FreeTyper`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!mounted || !text) {
    return (
      <div className="w-full">
        <div className="flex flex-wrap items-center gap-1">
          {DURATION_OPTIONS.map((d) => (
            <span key={d.seconds} className="px-2 py-1 text-xs text-text-dim">
              {d.label}
            </span>
          ))}
        </div>
        <div className="h-20" />
      </div>
    );
  }

  const testContent = (
    <>
      {toasts.map((a, i) => (
        <AchievementToast key={a.id + i} achievement={a} onClose={() => setToasts((t) => t.filter((_, j) => j !== i))} />
      ))}

      <div className="w-full">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex flex-wrap items-center gap-1">
              {DURATION_OPTIONS.map((d) => (
                <button
                  key={d.seconds}
                  onClick={() => { !isRunning && startNewTest(d.seconds); }}
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
              <span className="mx-1 hidden h-3 w-px bg-surface-border sm:block" />
              {TEXT_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    if (isRunning) return;
                    setTextMode(m.id);
                    const next = generateTestText(m.id);
                    setText(next);
                    restart(next);
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
              <button
                onClick={() => setFocusMode(!focusMode)}
                className="flex items-center justify-center rounded-md p-1.5 text-text-dim transition-all hover:bg-surface-raised hover:text-text"
                title={focusMode ? 'Exit focus mode (Esc)' : 'Focus mode'}
              >
                {focusMode ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="flex items-center gap-3 font-mono text-sm text-text">
              <span className={`tabular-nums ${isLowTime && isRunning ? 'text-error' : 'text-text-bright'}`}>
                {seconds}
              </span>
              <span className="text-surface-border">·</span>
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
              className={`h-full rounded-full transition-all duration-300 ease-linear ${
                isLowTime ? 'bg-error' : 'bg-accent'
              } ${isRunning && !isLowTime ? 'progress-glow' : ''}`}
              style={{ width: `${progress}%` }}
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

          <input ref={inputRef} className="sr-only" autoFocus />

          <div className="mt-4 flex h-8 items-center justify-center">
            {!isRunning ? (
              <p className="text-sm text-text-dim">start typing to begin</p>
            ) : (
              <button
                type="button"
                onClick={() => restart()}
                className="text-text-dim transition-colors hover:text-text"
                title="Restart"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
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
            extraActions={
              <>
                <Link
                  href="/typing-practice"
                  className="inline-flex items-center gap-1 rounded-md border border-surface-border px-2.5 py-1 text-[11px] text-text-dim transition-colors hover:border-accent/40 hover:text-accent"
                >
                  <PenTool className="h-3 w-3" />
                  practice
                </Link>
                <button
                  type="button"
                  onClick={shareLatest}
                  className="inline-flex items-center gap-1 rounded-md border border-surface-border px-2.5 py-1 text-[11px] text-text-dim transition-colors hover:border-accent/40 hover:text-accent"
                >
                  {copied ? <Check className="h-3 w-3 text-accent" /> : <Share2 className="h-3 w-3" />}
                  {copied ? 'copied' : 'share'}
                </button>
              </>
            }
          />
        </div>

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
