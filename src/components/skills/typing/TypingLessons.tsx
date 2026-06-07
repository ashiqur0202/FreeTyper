'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GraduationCap, CheckCircle, Lock, RotateCcw, ChevronRight } from 'lucide-react';
import { useTypingEngine } from './useTypingEngine';
import { useTypingProgress } from './useTypingProgress';
import { lessons, keyboardRows, getKeyFinger, getKeyColor, homeRowKeys } from './typingData';
import type { TypingSession, Achievement } from './types';
import AchievementToast from './AchievementToast';

export default function TypingLessons() {
  const [activeLesson, setActiveLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem('freetyper-completed-lessons');
      return stored ? new Set(JSON.parse(stored)) : new Set([0]);
    } catch { return new Set([0]); }
  });
  const [result, setResult] = useState<TypingSession | null>(null);
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { addSession, updateKeyStats, checkAchievements } = useTypingProgress();
  const lesson = lessons[activeLesson];

  const handleComplete = useCallback((session: TypingSession) => {
    const updated = { ...session, mode: 'lesson' as const, modeDetail: `Lesson ${lesson.id}` };
    addSession(updated);
    setResult(updated);

    // Unlock next lesson
    if (activeLesson < lessons.length - 1) {
      const next = new Set(completedLessons);
      next.add(activeLesson + 1);
      setCompletedLessons(next);
      localStorage.setItem('freetyper-completed-lessons', JSON.stringify([...next]));
    }
  }, [activeLesson, completedLessons, addSession, lesson.id]);

  const { chars, currentIndex, wpm, accuracy, isRunning, isComplete, restart, handleInput } =
    useTypingEngine({
      text: lesson.text,
      onComplete: handleComplete,
      onKeyStats: (key, correct) => updateKeyStats(key, correct),
    });

  useEffect(() => {
    if (isComplete) {
      const newAchievements = checkAchievements();
      if (newAchievements.length > 0) setToasts((t) => [...t, ...newAchievements]);
    }
  }, [isComplete, checkAchievements]);

  // Capture keyboard input
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isComplete || e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === 'Tab') return;
      if (e.key.length === 1) {
        e.preventDefault();
        handleInput(e.key);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleInput, isComplete]);

  // Active keys for keyboard highlight
  const activeKeys = new Set<string>();
  if (currentIndex < chars.length) {
    const nextChar = chars[currentIndex]?.char.toLowerCase();
    if (nextChar) activeKeys.add(nextChar);
  }
  // Lesson keys
  const lessonKeySet = new Set(lesson.keys.map((k) => k.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {toasts.map((a, i) => (
        <AchievementToast key={a.id + i} achievement={a} onClose={() => setToasts((t) => t.filter((_, j) => j !== i))} />
      ))}

      {/* Lesson selector */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {lessons.map((l, i) => {
          const unlocked = completedLessons.has(i);
          const isActive = i === activeLesson;
          const done = completedLessons.has(i) && i < activeLesson;
          return (
            <button
              key={l.id}
              onClick={() => unlocked && !isRunning && setActiveLesson(i)}
              disabled={!unlocked || isRunning}
              className={`rounded-xl border p-3 text-left transition-all ${
                isActive
                  ? 'border-amber-500 bg-amber-500/10'
                  : unlocked
                  ? 'border-gray-700 bg-gray-900 hover:border-gray-600 hover:bg-gray-800'
                  : 'border-gray-800 bg-gray-900/50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                {done ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : unlocked ? (
                  <GraduationCap className="h-4 w-4 text-amber-500" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-600" />
                )}
                <span className={`text-sm font-medium ${isActive ? 'text-amber-400' : unlocked ? 'text-gray-200' : 'text-gray-600'}`}>
                  {l.name}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">{l.description}</p>
            </button>
          );
        })}
      </div>

      {/* Stats bar */}
      <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-gray-500">WPM</span>
            <p className="text-lg font-bold text-amber-400">{wpm}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Accuracy</span>
            <p className="text-lg font-bold text-white">{accuracy}%</p>
          </div>
        </div>
        <button onClick={restart} className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Typing area */}
      {!result ? (
        <div
          className="rounded-xl border border-gray-800 bg-gray-900 p-6 cursor-text min-h-[160px]"
          onClick={() => inputRef.current?.focus()}
        >
          <p className="font-mono text-lg leading-relaxed tracking-wide">
            {chars.map((c, i) => (
              <span key={i} className={`char ${c.status}`}>
                {c.char}
              </span>
            ))}
          </p>
          <input ref={inputRef} className="sr-only" autoFocus />
        </div>
      ) : (
        /* Results */
        <div className="rounded-xl border border-amber-500/30 bg-gray-900 p-8 text-center">
          <h3 className="text-2xl font-bold text-white">Lesson Complete!</h3>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div>
              <p className="text-3xl font-bold text-amber-400">{result.wpm}</p>
              <p className="text-sm text-gray-400">WPM</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{result.accuracy}%</p>
              <p className="text-sm text-gray-400">Accuracy</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-300">{result.duration}s</p>
              <p className="text-sm text-gray-400">Time</p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => { setResult(null); restart(); }}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
            >
              Retry
            </button>
            {activeLesson < lessons.length - 1 && (
              <button
                onClick={() => { setResult(null); setActiveLesson(activeLesson + 1); }}
                className="flex items-center gap-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
              >
                Next Lesson <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Keyboard visual */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
        <div className="space-y-1.5">
          {keyboardRows.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1">
              {row.map((key) => {
                const isActive = activeKeys.has(key);
                const isLessonKey = lessonKeySet.has(key) || lesson.keys[0] === 'all';
                const isHome = homeRowKeys.has(key);
                const color = getKeyColor(key);
                return (
                  <div
                    key={key}
                    className={`key h-9 w-9 text-xs ${isActive ? 'active' : ''} ${isHome ? 'home-row' : ''}`}
                    style={isLessonKey && !isActive ? { borderColor: color, color } : undefined}
                  >
                    {key}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="flex justify-center">
            <div className="key h-9 w-72">space</div>
          </div>
        </div>
      </div>
    </div>
  );
}
