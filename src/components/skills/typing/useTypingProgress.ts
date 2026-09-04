'use client';

import { useState, useCallback } from 'react';
import type { ProgressData, TypingSession, Achievement, KeyStats } from './types';

const STORAGE_KEY = 'freetyper-progress';

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-test', name: 'First Steps', description: 'Complete your first typing test', icon: 'Footprints', condition: 'Complete 1 session' },
  { id: 'speed-30', name: 'Getting Started', description: 'Reach 30 WPM', icon: 'Rocket', condition: '30 WPM' },
  { id: 'speed-50', name: 'Typist', description: 'Reach 50 WPM', icon: 'Zap', condition: '50 WPM' },
  { id: 'speed-70', name: 'Speed Demon', description: 'Reach 70 WPM', icon: 'Flame', condition: '70 WPM' },
  { id: 'speed-100', name: 'Blazing Fast', description: 'Reach 100 WPM', icon: 'Trophy', condition: '100 WPM' },
  { id: 'speed-120', name: 'Keyboard Warrior', description: 'Reach 120 WPM', icon: 'Sword', condition: '120 WPM' },
  { id: 'accuracy-95', name: 'Sharp Shooter', description: 'Achieve 95% accuracy', icon: 'Target', condition: '95% accuracy' },
  { id: 'accuracy-99', name: 'Perfect Aim', description: 'Achieve 99% accuracy', icon: 'Crosshair', condition: '99% accuracy' },
  { id: 'streak-3', name: 'Consistent', description: '3-day practice streak', icon: 'Calendar', condition: '3-day streak' },
  { id: 'streak-7', name: 'Dedicated', description: '7-day practice streak', icon: 'Flame', condition: '7-day streak' },
  { id: 'streak-30', name: 'Unstoppable', description: '30-day practice streak', icon: 'Crown', condition: '30-day streak' },
  { id: 'sessions-10', name: 'Regular', description: 'Complete 10 sessions', icon: 'Repeat', condition: '10 sessions' },
  { id: 'sessions-50', name: 'Committed', description: 'Complete 50 sessions', icon: 'Award', condition: '50 sessions' },
  { id: 'sessions-100', name: 'Typing Master', description: 'Complete 100 sessions', icon: 'Star', condition: '100 sessions' },
];

const defaultProgress = (): ProgressData => ({
  sessions: [],
  achievements: DEFAULT_ACHIEVEMENTS,
  keyStats: {},
  streak: { current: 0, best: 0, lastPracticeDate: '' },
  totalTypingTime: 0,
  wordsTyped: 0,
  bestWpm: 0,
  bestAccuracy: 0,
});

function loadProgress(): ProgressData {
  if (typeof window === 'undefined') return defaultProgress();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ProgressData;
      // Merge in any new achievements that weren't in stored data
      const existingIds = new Set(parsed.achievements.map((a) => a.id));
      const merged = [
        ...parsed.achievements,
        ...DEFAULT_ACHIEVEMENTS.filter((a) => !existingIds.has(a.id)),
      ];
      return { ...parsed, achievements: merged };
    }
  } catch {
    // Corrupted data, reset
  }
  return defaultProgress();
}

function saveProgress(data: ProgressData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function useTypingProgress() {
  const [progress, setProgress] = useState<ProgressData>(loadProgress);

  const updateProgress = useCallback((updater: (prev: ProgressData) => ProgressData) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  const addSession = useCallback((session: TypingSession) => {
    updateProgress((prev) => {
      const today = todayStr();
      const yesterday = yesterdayStr();

      // Update streak
      let streakCurrent = prev.streak.current;
      if (prev.streak.lastPracticeDate === yesterday) {
        streakCurrent += 1;
      } else if (prev.streak.lastPracticeDate !== today) {
        streakCurrent = 1;
      }
      const streakBest = Math.max(streakCurrent, prev.streak.best);

      return {
        ...prev,
        sessions: [...prev.sessions, session],
        bestWpm: session.mode === 'game' ? prev.bestWpm : Math.max(prev.bestWpm, session.wpm),
        bestAccuracy:
          session.mode === 'game' ? prev.bestAccuracy : Math.max(prev.bestAccuracy, session.accuracy),
        totalTypingTime: prev.totalTypingTime + session.duration,
        wordsTyped: prev.wordsTyped + Math.round(session.correctChars / 5),
        streak: {
          current: streakCurrent,
          best: streakBest,
          lastPracticeDate: today,
        },
      };
    });
  }, [updateProgress]);

  const updateKeyStats = useCallback((key: string, correct: boolean) => {
    updateProgress((prev) => {
      const existing = prev.keyStats[key];
      const stats: KeyStats = existing
        ? {
            ...existing,
            totalPresses: existing.totalPresses + 1,
            correctPresses: existing.correctPresses + (correct ? 1 : 0),
            incorrectPresses: existing.incorrectPresses + (correct ? 0 : 1),
            lastPracticed: Date.now(),
          }
        : {
            key,
            totalPresses: 1,
            correctPresses: correct ? 1 : 0,
            incorrectPresses: correct ? 0 : 1,
            averageTime: 0,
            lastPracticed: Date.now(),
          };

      return {
        ...prev,
        keyStats: { ...prev.keyStats, [key]: stats },
      };
    });
  }, [updateProgress]);

  const checkAchievements = useCallback((): Achievement[] => {
    const newlyUnlocked: Achievement[] = [];

    setProgress((prev) => {
      const updated = { ...prev, achievements: [...prev.achievements] };
      const totalSessions = updated.sessions.length;
      const bestWpm = updated.bestWpm;
      const bestAcc = updated.bestAccuracy;
      const streak = updated.streak.current;

      const checks: Record<string, boolean> = {
        'first-test': totalSessions >= 1,
        'speed-30': bestWpm >= 30,
        'speed-50': bestWpm >= 50,
        'speed-70': bestWpm >= 70,
        'speed-100': bestWpm >= 100,
        'speed-120': bestWpm >= 120,
        'accuracy-95': bestAcc >= 95,
        'accuracy-99': bestAcc >= 99,
        'streak-3': streak >= 3,
        'streak-7': streak >= 7,
        'streak-30': streak >= 30,
        'sessions-10': totalSessions >= 10,
        'sessions-50': totalSessions >= 50,
        'sessions-100': totalSessions >= 100,
      };

      for (let i = 0; i < updated.achievements.length; i++) {
        const a = updated.achievements[i];
        if (!a.unlockedAt && checks[a.id]) {
          updated.achievements[i] = { ...a, unlockedAt: Date.now() };
          newlyUnlocked.push(updated.achievements[i]);
        }
      }

      saveProgress(updated);
      return updated;
    });

    return newlyUnlocked;
  }, []);

  const getWeakKeys = useCallback((): KeyStats[] => {
    return Object.values(progress.keyStats)
      .filter((k) => k.totalPresses >= 5)
      .sort((a, b) => {
        const accA = a.correctPresses / a.totalPresses;
        const accB = b.correctPresses / b.totalPresses;
        return accA - accB;
      })
      .slice(0, 5);
  }, [progress.keyStats]);

  const getWpmHistory = useCallback((): { date: number; wpm: number }[] => {
    return progress.sessions.map((s) => ({ date: s.date, wpm: s.wpm }));
  }, [progress.sessions]);

  const getAccuracyHistory = useCallback((): { date: number; accuracy: number }[] => {
    return progress.sessions.map((s) => ({ date: s.date, accuracy: s.accuracy }));
  }, [progress.sessions]);

  const resetProgress = useCallback(() => {
    const fresh = defaultProgress();
    saveProgress(fresh);
    setProgress(fresh);
  }, []);

  return {
    progress,
    addSession,
    updateKeyStats,
    checkAchievements,
    getWeakKeys,
    getWpmHistory,
    getAccuracyHistory,
    resetProgress,
  };
}
