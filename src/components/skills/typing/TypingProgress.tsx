'use client';

import { useState } from 'react';
import { BarChart3, Flame, Trophy, Clock, Target, RotateCcw, Trash2 } from 'lucide-react';
import { useTypingProgress } from './useTypingProgress';
import KeyboardHeatmap from './KeyboardHeatmap';

const achievementIcons: Record<string, string> = {
  Footprints: '👣', Rocket: '🚀', Zap: '⚡', Flame: '🔥', Trophy: '🏆',
  Sword: '⚔️', Target: '🎯', Crosshair: '🔎', Calendar: '📅',
  Crown: '👑', Repeat: '🔄', Award: '🎖️', Star: '⭐',
};

export default function TypingProgress() {
  const { progress, getWeakKeys, getWpmHistory, resetProgress } = useTypingProgress();
  const [showReset, setShowReset] = useState(false);

  const wpmHistory = getWpmHistory().slice(-30);
  const maxWpm = Math.max(...wpmHistory.map((w) => w.wpm), 1);
  const weakKeys = getWeakKeys();
  const totalSessions = progress.sessions.length;
  const unlockedCount = progress.achievements.filter((a) => a.unlockedAt).length;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  return (
    <div className="space-y-6">
      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Sessions', value: totalSessions, icon: <BarChart3 className="h-4 w-4" /> },
          { label: 'Best WPM', value: progress.bestWpm, icon: <Trophy className="h-4 w-4" /> },
          { label: 'Best Accuracy', value: `${progress.bestAccuracy}%`, icon: <Target className="h-4 w-4" /> },
          { label: 'Current Streak', value: `${progress.streak.current}d`, icon: <Flame className="h-4 w-4" /> },
          { label: 'Best Streak', value: `${progress.streak.best}d`, icon: <Flame className="h-4 w-4" /> },
          { label: 'Time Typed', value: formatTime(progress.totalTypingTime), icon: <Clock className="h-4 w-4" /> },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <div className="flex items-center gap-2 text-amber-500">{stat.icon}<span className="text-xs text-gray-500">{stat.label}</span></div>
            <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* WPM History chart */}
      {wpmHistory.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="text-sm font-semibold text-gray-300">WPM History (Last {wpmHistory.length} sessions)</h3>
          <div className="mt-4 flex items-end gap-1 h-32">
            {wpmHistory.map((entry, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full rounded-t bg-amber-500/80 transition-all hover:bg-amber-400 min-w-[4px]"
                  style={{ height: `${(entry.wpm / maxWpm) * 100}%` }}
                  title={`${entry.wpm} WPM`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-600">
            <span>Oldest</span>
            <span>Latest</span>
          </div>
        </div>
      )}

      {/* Weak keys */}
      {weakKeys.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="text-sm font-semibold text-gray-300">Weakest Keys</h3>
          <div className="mt-3 space-y-2">
            {weakKeys.map((k) => {
              const acc = Math.round((k.correctPresses / k.totalPresses) * 100);
              return (
                <div key={k.key} className="flex items-center gap-3">
                  <kbd className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-600 bg-gray-800 text-sm font-mono uppercase text-white">
                    {k.key}
                  </kbd>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-gray-700">
                      <div
                        className={`h-2 rounded-full ${acc >= 90 ? 'bg-green-500' : acc >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${acc}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-400 w-12 text-right">{acc}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Heatmap */}
      <KeyboardHeatmap />

      {/* Achievements */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300">
            Achievements ({unlockedCount}/{progress.achievements.length})
          </h3>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {progress.achievements.map((a) => {
            const unlocked = !!a.unlockedAt;
            return (
              <div
                key={a.id}
                className={`rounded-lg border p-3 transition-all ${
                  unlocked
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-gray-800 bg-gray-900 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{achievementIcons[a.icon] || '🏅'}</span>
                  <div>
                    <p className={`text-xs font-semibold ${unlocked ? 'text-amber-400' : 'text-gray-500'}`}>
                      {a.name}
                    </p>
                    <p className="text-xs text-gray-500">{a.condition}</p>
                  </div>
                </div>
                {unlocked && a.unlockedAt && (
                  <p className="mt-1 text-xs text-gray-600">
                    {new Date(a.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <div className="flex justify-end">
        {!showReset ? (
          <button
            onClick={() => setShowReset(true)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" /> Reset Progress
          </button>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-2">
            <p className="text-sm text-red-400">Delete all progress?</p>
            <button
              onClick={() => { resetProgress(); setShowReset(false); }}
              className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowReset(false)}
              className="rounded bg-gray-800 px-3 py-1 text-xs text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
