'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { TypingCharState, TypingSession, TypingEngineOptions } from './types';

export function useTypingEngine(options: TypingEngineOptions) {
  const { text, timed, onStart, onComplete, onKeyStats } = options;

  const initChars = useCallback((t: string): TypingCharState[] => {
    if (!t) return [];
    return t.split('').map((char, i) => ({
      char,
      status: i === 0 ? 'current' as const : 'pending' as const,
    }));
  }, []);

  const [chars, setChars] = useState<TypingCharState[]>(() => initChars(text));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timed ?? 0);
  const [elapsed, setElapsed] = useState(0);
  const [errors, setErrors] = useState<number[]>([]);

  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const correctCountRef = useRef(0);
  const incorrectCountRef = useRef(0);
  const isRunningRef = useRef(false);
  const isCompleteRef = useRef(false);
  const currentIndexRef = useRef(0);
  const timedRef = useRef(timed);
  const textRef = useRef(text);
  textRef.current = text;

  // Keep ref in sync when timed prop changes
  useEffect(() => {
    timedRef.current = timed ?? 0;
  }, [timed]);

  // Timer loop using rAF
  useEffect(() => {
    if (!isRunning || isComplete) return;

    const tick = (now: number) => {
      if (!isRunningRef.current || isCompleteRef.current) return;

      const elapsedSec = (now - startTimeRef.current) / 1000;
      setElapsed(elapsedSec);

      if (timedRef.current) {
        const remaining = Math.max(0, timedRef.current - elapsedSec);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          finishTest(elapsedSec);
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isComplete]);

  const finishTest = useCallback((durationSec: number) => {
    isRunningRef.current = false;
    isCompleteRef.current = true;
    setIsRunning(false);
    setIsComplete(true);

    const totalTyped = correctCountRef.current + incorrectCountRef.current;
    const minutes = durationSec / 60;
    const wpm = minutes > 0 ? Math.round((correctCountRef.current / 5) / minutes) : 0;
    const accuracy = totalTyped > 0 ? Math.round((correctCountRef.current / totalTyped) * 100) : 100;

    const session: TypingSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: Date.now(),
      wpm,
      accuracy,
      correctChars: correctCountRef.current,
      incorrectChars: incorrectCountRef.current,
      totalChars: totalTyped,
      duration: Math.round(durationSec),
      mode: 'practice',
    };

    onComplete?.(session);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onComplete]);

  const handleInput = useCallback((typedChar: string) => {
    if (isCompleteRef.current) return;

    const idx = currentIndexRef.current;
    if (idx >= chars.length) return;

    // Start on first input
    if (!isRunningRef.current) {
      isRunningRef.current = true;
      startTimeRef.current = performance.now();
      setIsRunning(true);
      onStart?.();
    }

    const expected = chars[idx].char;
    const isCorrect = typedChar === expected;

    setChars((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], status: isCorrect ? 'correct' : 'incorrect' };
      if (idx + 1 < next.length) {
        next[idx + 1] = { ...next[idx + 1], status: 'current' };
      }
      return next;
    });

    if (isCorrect) {
      correctCountRef.current++;
    } else {
      incorrectCountRef.current++;
      setErrors((prev) => [...prev, idx]);
    }

    onKeyStats?.(expected.toLowerCase(), isCorrect);

    const nextIdx = idx + 1;
    currentIndexRef.current = nextIdx;
    setCurrentIndex(nextIdx);

    // Check completion (untimed mode)
    if (nextIdx >= chars.length && !timedRef.current) {
      const elapsedSec = (performance.now() - startTimeRef.current) / 1000;
      finishTest(elapsedSec);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chars, onStart, onKeyStats, finishTest]);

  const handleBackspace = useCallback(() => {
    if (isCompleteRef.current) return;
    // Can't go back before the start
    const idx = currentIndexRef.current;
    if (idx <= 0) return;

    const prevIdx = idx - 1;

    // If the previous char was incorrect, undo the error count
    setChars((prev) => {
      const next = [...prev];
      // Revert the previous character back to current
      const prevStatus = next[prevIdx].status;
      next[prevIdx] = { ...next[prevIdx], status: 'current' };

      // If it was incorrect, remove the error
      if (prevStatus === 'incorrect') {
        incorrectCountRef.current = Math.max(0, incorrectCountRef.current - 1);
        setErrors((errs) => errs.filter((e) => e !== prevIdx));
      } else if (prevStatus === 'correct') {
        correctCountRef.current = Math.max(0, correctCountRef.current - 1);
      }

      // The current position becomes pending again (if it wasn't already current)
      if (idx < next.length && next[idx].status === 'current') {
        next[idx] = { ...next[idx], status: 'pending' };
      }

      return next;
    });

    currentIndexRef.current = prevIdx;
    setCurrentIndex(prevIdx);
  }, [chars]);

  const restart = useCallback((nextText?: string) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const t = nextText ?? textRef.current;
    if (nextText !== undefined) textRef.current = nextText;

    correctCountRef.current = 0;
    incorrectCountRef.current = 0;
    isRunningRef.current = false;
    isCompleteRef.current = false;
    currentIndexRef.current = 0;
    startTimeRef.current = 0;

    setChars(initChars(t));
    setCurrentIndex(0);
    setIsRunning(false);
    setIsComplete(false);
    setTimeLeft(timedRef.current);
    setElapsed(0);
    setErrors([]);
  }, [initChars]);

  // Reset when text changes
  useEffect(() => {
    restart();
  }, [text, restart]);

  const wpm = useMemo(() => {
    if (!isRunning && !isComplete) return 0;
    const minutes = elapsed / 60;
    return minutes > 0 ? Math.round((correctCountRef.current / 5) / minutes) : 0;
  }, [isRunning, isComplete, elapsed]);

  const accuracy = useMemo(() => {
    const total = correctCountRef.current + incorrectCountRef.current;
    return total > 0 ? Math.round((correctCountRef.current / total) * 100) : 100;
  }, [isRunning, isComplete, elapsed]);

  return {
    chars,
    currentIndex,
    wpm,
    accuracy,
    isRunning,
    isComplete,
    timeLeft,
    elapsed,
    errors,
    correctCount: correctCountRef.current,
    incorrectCount: incorrectCountRef.current,
    restart,
    handleInput,
    handleBackspace,
  };
}

import { useMemo } from 'react';
