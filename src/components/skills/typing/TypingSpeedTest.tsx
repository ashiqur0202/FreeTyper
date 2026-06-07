'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import { useTypingEngine } from './useTypingEngine';
import { useTypingProgress } from './useTypingProgress';
import { practiceTexts } from './typingData';
import type { TypingSession, Achievement } from './types';
import AchievementToast from './AchievementToast';

const DURATIONS = [15, 30, 60, 120];
const DURATION_LABELS = ['15', '30', '60', '120'];

function getPercentile(wpm: number): string {
  if (wpm >= 100) return 'top 5%';
  if (wpm >= 80) return 'fast';
  if (wpm >= 70) return 'above avg';
  if (wpm >= 50) return 'average';
  if (wpm >= 30) return 'below avg';
  return 'beginner';
}

function generateTestText(): string {
  const shuffled = [...practiceTexts].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((p) => p.text).join(' ');
}

export default function TypingSpeedTest() {
  const [duration, setDuration] = useState(60);
  const [text, setText] = useState('');
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<TypingSession | null>(null);
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { addSession, updateKeyStats, checkAchievements } = useTypingProgress();

  const handleComplete = useCallback((session: TypingSession) => {
    const updated = { ...session, mode: 'speed-test' as const, modeDetail: `${duration}s` };
    addSession(updated);
    setResult(updated);
  }, [addSession, duration]);

  const { chars, wpm, accuracy, isRunning, isComplete, timeLeft, restart, handleInput } =
    useTypingEngine({
      text,
      timed: duration,
      onComplete: handleComplete,
      onKeyStats: (key, correct) => updateKeyStats(key, correct),
    });

  useEffect(() => {
    setMounted(true);
    setText(generateTestText());
  }, []);

  useEffect(() => {
    if (isComplete) {
      const newA = checkAchievements();
      if (newA.length > 0) setToasts((t) => [...t, ...newA]);
    }
  }, [isComplete, checkAchievements]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isComplete || e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === 'Tab') return;
      if (e.key.length === 1) { e.preventDefault(); handleInput(e.key); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleInput, isComplete]);

  const startNewTest = (dur?: number) => {
    const d = dur ?? duration;
    setDuration(d);
    setResult(null);
    setText(generateTestText());
    restart();
  };

  const share = async () => {
    if (!result) return;
    const txt = `${result.wpm} wpm · ${result.accuracy}% accuracy — freetyper.com`;
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  const seconds = Math.ceil(timeLeft || duration);

  if (!mounted || !text) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1">
            {DURATIONS.map((d, i) => (
              <span key={d} className="px-2.5 py-1 text-xs rounded" style={{ color: '#7a7a7a' }}>
                {DURATION_LABELS[i]}
              </span>
            ))}
          </div>
        </div>
        <div className="h-20" />
      </div>
    );
  }

  return (
    <div>
      {toasts.map((a, i) => (
        <AchievementToast key={a.id + i} achievement={a} onClose={() => setToasts((t) => t.filter((_, j) => j !== i))} />
      ))}

      {!result ? (
        <div>
          {/* Config bar — duration pills + timer */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-1">
              {DURATIONS.map((d, i) => (
                <button
                  key={d}
                  onClick={() => !isRunning && startNewTest(d)}
                  disabled={isRunning}
                  className="px-2.5 py-1 text-xs rounded transition-colors"
                  style={{
                    color: duration === d ? '#e2b714' : '#7a7a7a',
                    background: duration === d ? '#e2b71412' : 'transparent',
                    opacity: isRunning ? 0.3 : 1,
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                  }}
                >
                  {DURATION_LABELS[i]}
                </button>
              ))}
            </div>

            {/* Timer or live stats */}
            <div className="flex items-center gap-4 font-mono text-sm" style={{ color: '#7a7a7a' }}>
              {!isRunning && !isComplete ? (
                <span className="tabular-nums">{seconds}s</span>
              ) : isRunning ? (
                <>
                  <span className="tabular-nums">{seconds}</span>
                  <span>·</span>
                  <span className="tabular-nums" style={{ color: '#8a8a6e' }}>{wpm}<span style={{ color: '#7a7a7a' }}> wpm</span></span>
                  <span>·</span>
                  <span className="tabular-nums" style={{ color: '#8a8a6e' }}>{accuracy}<span style={{ color: '#7a7a7a' }}>%</span></span>
                </>
              ) : null}
            </div>
          </div>

          {/* Typing area */}
          <div
            className="cursor-text py-2"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="typing-text text-xl leading-relaxed tracking-wide">
              {chars.map((c, i) => (
                <span key={i} className={`char ${c.status}`}>{c.char}</span>
              ))}
            </div>
            <input ref={inputRef} className="sr-only" autoFocus />
          </div>

          {!isRunning && !isComplete && (
            <p className="mt-6 text-center text-xs" style={{ color: '#7a7a7a' }}>
              start typing to begin
            </p>
          )}

          {isRunning && (
            <div className="mt-4 flex justify-center">
              <button onClick={restart} className="transition-colors" style={{ color: '#7a7a7a' }}>
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results — quiet and centered */
        <div className="py-8">
          <div className="text-center">
            <p className="font-mono text-6xl font-light tabular-nums" style={{ color: '#e2b714' }}>{result.wpm}</p>
            <p className="mt-1 text-xs" style={{ color: '#7a7a7a' }}>words per minute</p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 font-mono text-sm">
            <div className="text-center">
              <p className="tabular-nums" style={{ color: '#d4d4c8' }}>{result.accuracy}%</p>
              <p className="text-xs" style={{ color: '#7a7a7a' }}>accuracy</p>
            </div>
            <div style={{ color: '#4a4a4c' }}>|</div>
            <div className="text-center">
              <p className="tabular-nums" style={{ color: '#d4d4c8' }}>{result.correctChars}</p>
              <p className="text-xs" style={{ color: '#7a7a7a' }}>correct</p>
            </div>
            <div style={{ color: '#4a4a4c' }}>|</div>
            <div className="text-center">
              <p className="tabular-nums" style={{ color: '#c44250' }}>{result.incorrectChars}</p>
              <p className="text-xs" style={{ color: '#7a7a7a' }}>errors</p>
            </div>
            <div style={{ color: '#4a4a4c' }}>|</div>
            <div className="text-center">
              <p className="tabular-nums" style={{ color: '#8a8a6e' }}>{getPercentile(result.wpm)}</p>
              <p className="text-xs" style={{ color: '#7a7a7a' }}>percentile</p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => startNewTest()}
              className="px-4 py-1.5 text-xs rounded transition-colors"
              style={{ color: '#e2b714', border: '1px solid #e2b71430' }}
            >
              next test
            </button>
            <button
              onClick={share}
              className="px-4 py-1.5 text-xs rounded transition-colors"
              style={{ color: '#7a7a7a', border: '1px solid #4a4a4c' }}
            >
              {copied ? 'copied' : 'share'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
