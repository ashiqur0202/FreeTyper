import { Flame } from 'lucide-react';
import { dailyStreak, STREAK_MIN_ACCURACY, type DailyStore } from './dailyChallenge';

function niceDate(key: string) {
  return new Date(`${key}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** The small status strip above the daily test. Rendered only after hydration (it reads localStorage). */
export default function DailyPanel({ dateKey, store }: { dateKey: string; store: DailyStore }) {
  const today = store[dateKey];
  const streak = dailyStreak(store, dateKey);
  const best = today && today.wpm > 0 ? today : null;
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-surface-border bg-surface-raised/40 px-3 py-2 text-xs">
      <p className="text-text-dim">
        <span className="text-text-bright">Daily challenge · {niceDate(dateKey)}</span>
        <span className="hidden sm:inline"> · new passage at 00:00 UTC</span>
      </p>
      <p className="flex items-center gap-3 text-text-dim">
        <span className="inline-flex items-center gap-1">
          <Flame className={`h-3.5 w-3.5 ${streak > 0 ? 'text-accent' : ''}`} />
          <span className="tabular-nums text-text-bright">{streak}</span> day streak
        </span>
        <span>
          {best ? (
            <>
              today&apos;s best <span className="tabular-nums text-accent">{best.wpm}</span> wpm
            </>
          ) : today ? (
            <>no clean run yet (needs {STREAK_MIN_ACCURACY}% accuracy)</>
          ) : (
            <>not done today</>
          )}
        </span>
      </p>
    </div>
  );
}
