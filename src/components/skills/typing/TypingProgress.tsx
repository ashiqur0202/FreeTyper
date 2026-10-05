'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { clearPairs, getPairStore, totalSamples, weakPairsOf, type PairScore } from './pairStats';
import {
  BarChart3,
  Flame,
  Trophy,
  Clock,
  Target,
  Trash2,
  ArrowRight,
  Keyboard,
  BookOpen,
  Timer,
} from 'lucide-react';
import { useTypingProgress } from './useTypingProgress';
import KeyboardHeatmap from './KeyboardHeatmap';

const achievementIcons: Record<string, string> = {
  Footprints: '👣',
  Rocket: '🚀',
  Zap: '⚡',
  Flame: '🔥',
  Trophy: '🏆',
  Sword: '⚔️',
  Target: '🎯',
  Crosshair: '🔎',
  Calendar: '📅',
  Crown: '👑',
  Repeat: '🔄',
  Award: '🎖️',
  Star: '⭐',
};

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function TypingProgress() {
  const { progress, getWeakKeys, getWpmHistory, getAccuracyHistory, resetProgress } =
    useTypingProgress();
  const [showReset, setShowReset] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [pairs, setPairs] = useState<PairScore[]>([]);
  const [pairSamples, setPairSamples] = useState(0);

  useEffect(() => {
    setMounted(true);
    const store = getPairStore();
    setPairs(weakPairsOf(store, 5));
    setPairSamples(totalSamples(store));
  }, []);

  const wpmHistory = getWpmHistory().slice(-30);
  const accHistory = getAccuracyHistory().slice(-30);
  const maxWpm = Math.max(...wpmHistory.map((w) => w.wpm), 1);
  const weakKeys = getWeakKeys();
  const totalSessions = progress.sessions.length;
  const unlockedCount = progress.achievements.filter((a) => a.unlockedAt).length;

  const avgWpm = useMemo(() => {
    if (wpmHistory.length === 0) return 0;
    return Math.round(wpmHistory.reduce((s, e) => s + e.wpm, 0) / wpmHistory.length);
  }, [wpmHistory]);

  const avgAcc = useMemo(() => {
    if (accHistory.length === 0) return 0;
    return Math.round(accHistory.reduce((s, e) => s + e.accuracy, 0) / accHistory.length);
  }, [accHistory]);

  const recentSessions = [...progress.sessions].slice(-8).reverse();

  const stats = [
    { label: 'Sessions', value: String(totalSessions), icon: BarChart3 },
    { label: 'Best WPM', value: String(progress.bestWpm || '—'), icon: Trophy },
    { label: 'Best Acc', value: progress.bestAccuracy ? `${progress.bestAccuracy}%` : '—', icon: Target },
    { label: 'Avg WPM', value: avgWpm ? String(avgWpm) : '—', icon: Timer },
    { label: 'Streak', value: `${progress.streak.current}d`, icon: Flame },
    { label: 'Time', value: formatTime(progress.totalTypingTime), icon: Clock },
  ];

  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-text-dim">
        Loading progress…
      </div>
    );
  }

  if (totalSessions === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-2 py-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-border bg-surface-raised text-accent">
          <BarChart3 className="h-6 w-6" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-text-bright">No sessions yet</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-text-dim">
          Progress stays private in this browser. Complete a speed test, lesson, or practice
          run and your WPM, accuracy, streaks, and weak keys will show up here.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-surface transition-opacity hover:opacity-90"
          >
            <Timer className="h-3.5 w-3.5" />
            speed test
          </Link>
          <Link
            href="/typing-lessons"
            className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-4 py-2 text-xs text-text-dim transition-colors hover:border-accent hover:text-accent"
          >
            <BookOpen className="h-3.5 w-3.5" />
            lessons
          </Link>
          <Link
            href="/typing-practice"
            className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border px-4 py-2 text-xs text-text-dim transition-colors hover:border-accent hover:text-accent"
          >
            practice
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-dim">local progress</p>
          <h2 className="mt-1 text-lg font-semibold text-text-bright">Your typing stats</h2>
          <p className="mt-1 text-xs text-text-dim">
            Stored in this browser only · best streak {progress.streak.best}d · {progress.wordsTyped}{' '}
            words typed
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            href="/"
            className="rounded-md border border-surface-border px-2.5 py-1 text-text-dim transition-colors hover:border-accent hover:text-accent"
          >
            retest
          </Link>
          <Link
            href="/typing-practice"
            className="rounded-md border border-surface-border px-2.5 py-1 text-text-dim transition-colors hover:border-accent hover:text-accent"
          >
            practice weak keys
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-surface-border bg-surface-raised/40 px-3 py-3"
          >
            <div className="flex items-center gap-1.5 text-accent">
              <Icon className="h-3.5 w-3.5" />
              <span className="text-[10px] uppercase tracking-wider text-text-dim">{label}</span>
            </div>
            <p className="mt-2 font-mono text-xl font-light tabular-nums text-text-bright">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* WPM chart */}
      {wpmHistory.length > 0 && (
        <div className="rounded-xl border border-surface-border bg-surface-raised/30 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-text-bright">
              WPM history
              <span className="ml-2 text-xs font-normal text-text-dim">
                last {wpmHistory.length} sessions
              </span>
            </h3>
            <p className="font-mono text-xs text-text-dim">
              avg <span className="text-accent">{avgWpm}</span>
              {avgAcc > 0 && (
                <>
                  {' '}
                  · acc <span className="text-correct">{avgAcc}%</span>
                </>
              )}
            </p>
          </div>
          <div className="mt-4 flex h-36 items-end gap-1">
            {wpmHistory.map((entry, i) => (
              <div key={`${entry.date}-${i}`} className="flex h-full flex-1 flex-col items-center justify-end">
                <div
                  className="w-full min-w-[4px] rounded-t bg-accent/80 transition-all hover:bg-accent"
                  style={{ height: `${Math.max(4, (entry.wpm / maxWpm) * 100)}%` }}
                  title={`${entry.wpm} WPM · ${new Date(entry.date).toLocaleDateString()}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-text-dim">
            <span>older</span>
            <span>newer</span>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weak keys */}
        <div className="rounded-xl border border-surface-border bg-surface-raised/30 p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-text-bright">Weakest keys</h3>
            <Link
              href="/typing-practice"
              className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
            >
              drill <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {weakKeys.length > 0 ? (
            <div className="mt-4 space-y-2.5">
              {weakKeys.map((k) => {
                const acc = Math.round((k.correctPresses / k.totalPresses) * 100);
                return (
                  <div key={k.key} className="flex items-center gap-3">
                    <kbd className="flex h-8 w-8 items-center justify-center rounded-md border border-surface-border bg-surface font-mono text-sm uppercase text-text-bright">
                      {k.key}
                    </kbd>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${acc}%`,
                          backgroundColor:
                            acc >= 90 ? '#6b7c3a' : acc >= 75 ? '#e2b714' : '#c44250',
                        }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-xs tabular-nums text-text-dim">
                      {acc}%
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-text-dim">
              Type more sessions to unlock weak-key analysis (needs 5+ presses per key).
            </p>
          )}
          <Link
            href="/keyboard-guide"
            className="mt-4 inline-flex items-center gap-1 text-[11px] text-text-dim hover:text-accent"
          >
            <Keyboard className="h-3 w-3" />
            open finger map
          </Link>
        </div>

        {/* Weakest letter pairs */}
        <div className="rounded-xl border border-surface-border bg-surface-raised/30 p-5" data-section="weak-pairs">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-text-bright">Weakest letter pairs</h3>
            <Link
              href="/typing-practice"
              className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
            >
              drill <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {pairs.length > 0 ? (
            <div className="mt-4 space-y-2.5">
              {pairs.map((p) => (
                <div key={p.pair} className="flex items-center gap-3">
                  <kbd className="flex h-8 min-w-[2.5rem] items-center justify-center rounded-md border border-surface-border bg-surface px-2 font-mono text-sm text-text-bright">
                    {p.pair}
                  </kbd>
                  <div className="min-w-0 flex-1 text-xs leading-snug text-text">
                    {p.relativeSpeed !== null && p.relativeSpeed > 1.15 && p.ms !== null ? (
                      <span>{p.ms} ms, {p.relativeSpeed.toFixed(1)}× your typical pair</span>
                    ) : (
                      <span className="text-text-dim">speed is typical for you</span>
                    )}
                    <span className="text-text-dim"> · </span>
                    <span className={p.errorRate >= 0.1 ? 'text-error' : 'text-text-dim'}>
                      {Math.round(p.errorRate * 100)}% errors
                    </span>
                  </div>
                  <span className="font-mono text-[11px] tabular-nums text-text-dim">{p.samples}×</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-text-dim">
              {pairSamples < 100
                ? `Type a bit more (${pairSamples} letter pairs recorded so far, about 100 needed) and the pairs you are slow or error-prone on will show up here.`
                : 'No letter pair stands out right now. That is a good sign.'}
            </p>
          )}
          <p className="mt-4 text-[11px] leading-relaxed text-text-dim">
            Pairs are two letters typed one after the other, like “th”. They are kept only in this browser.
          </p>
        </div>

        {/* Recent sessions */}
        <div className="rounded-xl border border-surface-border bg-surface-raised/30 p-5">
          <h3 className="text-sm font-medium text-text-bright">Recent sessions</h3>
          <div className="mt-3 divide-y divide-surface-border">
            {recentSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 py-2.5 text-xs"
              >
                <div className="min-w-0">
                  <p className="truncate text-text">
                    {s.mode}
                    {s.modeDetail ? (
                      <span className="text-text-dim"> · {s.modeDetail}</span>
                    ) : null}
                  </p>
                  <p className="text-[10px] text-text-dim">
                    {new Date(s.date).toLocaleString()} · {s.duration}s
                  </p>
                </div>
                <div className="shrink-0 text-right font-mono">
                  <p className="text-accent">{s.wpm} wpm</p>
                  <p className="text-text-dim">{s.accuracy}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-xl border border-surface-border bg-surface-raised/30 p-5">
        <KeyboardHeatmap />
      </div>

      {/* Achievements */}
      <div className="rounded-xl border border-surface-border bg-surface-raised/30 p-5">
        <h3 className="text-sm font-medium text-text-bright">
          Achievements
          <span className="ml-2 text-xs font-normal text-text-dim">
            {unlockedCount}/{progress.achievements.length}
          </span>
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {progress.achievements.map((a) => {
            const unlocked = !!a.unlockedAt;
            return (
              <div
                key={a.id}
                className={`rounded-lg border p-3 transition-all ${
                  unlocked
                    ? 'border-accent/30 bg-accent-bg'
                    : 'border-surface-border bg-surface/40 opacity-55'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg leading-none">{achievementIcons[a.icon] || '🏅'}</span>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold ${
                        unlocked ? 'text-accent' : 'text-text-dim'
                      }`}
                    >
                      {a.name}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-snug text-text-dim">{a.condition}</p>
                    {unlocked && a.unlockedAt && (
                      <p className="mt-1 text-[10px] text-text-dim/80">
                        {new Date(a.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <div className="flex justify-end pb-2">
        {!showReset ? (
          <button
            type="button"
            onClick={() => setShowReset(true)}
            className="inline-flex items-center gap-2 text-xs text-text-dim transition-colors hover:text-error"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Reset all progress
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-error/30 bg-error-bg px-3 py-2">
            <p className="text-xs text-error">Delete all local progress?</p>
            <button
              type="button"
              onClick={() => {
                resetProgress();
                clearPairs();
                setPairs([]);
                setPairSamples(0);
                setShowReset(false);
              }}
              className="rounded-md bg-error px-3 py-1 text-[11px] font-medium text-white hover:opacity-90"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setShowReset(false)}
              className="rounded-md border border-surface-border px-3 py-1 text-[11px] text-text-dim hover:text-text"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
