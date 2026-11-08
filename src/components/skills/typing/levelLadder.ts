import type { TypingSession } from './types';

// FreeTyper's own speed levels (net WPM). Not a standard.
export interface Level {
  key: 'beginner' | 'average' | 'skilled' | 'pro' | 'elite';
  name: string;
  min: number;
  threshold: string;
}

export const LEVELS: readonly Level[] = [
  { key: 'beginner', name: 'Beginner', min: 0, threshold: '<40' },
  { key: 'average', name: 'Average', min: 40, threshold: '40' },
  { key: 'skilled', name: 'Skilled', min: 60, threshold: '60' },
  { key: 'pro', name: 'Pro', min: 80, threshold: '80' },
  { key: 'elite', name: 'Elite', min: 100, threshold: '100+' },
];

/** The Elite band is drawn from 100 to this speed. */
export const ELITE_FILL_MAX = 130;
/** Earlier speed-test sessions used for the averages. */
export const AVG_WINDOW = 30;
/** Fewest earlier sessions needed before an average is shown. */
export const AVG_MIN = 3;

export function levelIndex(net: number): number {
  let index = 0;
  LEVELS.forEach((level, i) => {
    if (net >= level.min) index = i;
  });
  return index;
}

/** How far `net` reaches into band `i`: 0 below it, 1 above it. */
export function bandFill(net: number, i: number): number {
  const lo = LEVELS[i].min;
  const hi = LEVELS[i + 1]?.min ?? ELITE_FILL_MAX;
  return Math.max(0, Math.min(1, (net - lo) / (hi - lo)));
}

export function nextStep(net: number): { name: string; gap: number } | null {
  const next = LEVELS[levelIndex(net) + 1];
  return next ? { name: next.name, gap: Math.ceil(next.min - net) } : null;
}

export interface Averages {
  count: number;
  net: number;
  gross: number;
  errors: number;
}

/**
 * Averages over the last AVG_WINDOW speed-test sessions, not counting the
 * session `excludeId` (the run just finished). Sessions are stored oldest
 * first. Returns null under AVG_MIN usable sessions. `errors` is the average
 * error rate scaled to `duration` seconds (the finished run's length), so a
 * 15 s run is compared with a 15 s share of earlier longer tests.
 */
export function averages(sessions: TypingSession[], excludeId: string, duration: number): Averages | null {
  const usable = sessions
    .filter(
      (s) =>
        s.mode === 'speed-test' &&
        s.id !== excludeId &&
        Number.isFinite(s.wpm) &&
        Number.isFinite(s.totalChars) &&
        Number.isFinite(s.incorrectChars) &&
        Number.isFinite(s.duration) &&
        s.duration > 0,
    )
    .slice(-AVG_WINDOW);
  if (usable.length < AVG_MIN) return null;
  const mean = (values: number[]) => Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
  return {
    count: usable.length,
    net: mean(usable.map((s) => s.wpm)),
    gross: mean(usable.map((s) => s.totalChars / 5 / (s.duration / 60))),
    errors: Math.round((usable.reduce((sum, s) => sum + s.incorrectChars / s.duration, 0) / usable.length) * duration),
  };
}
