'use client';

import type { ReactNode } from 'react';
import type { CoachTone } from './PracticeFeedback';

export type GameLogEntry = {
  id: string;
  date: number;
  game: 'falling' | 'attack';
  score: number;
  wpm: number;
  words: number;
  hits: number;
  misses: number;
  accuracy: number;
  duration: number;
  detail: string;
  headline: string;
  tip: string;
  tone: CoachTone;
  combo?: number;
};

const LOG_MAX = 5;

function pick(seed: string, options: string[]): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return options[h % options.length];
}

function timeAgo(ts: number) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 20) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function loadGameLog(key: string): GameLogEntry[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GameLogEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, LOG_MAX);
  } catch {
    return [];
  }
}

export function prependGameLog(key: string, entry: GameLogEntry, prev: GameLogEntry[]): GameLogEntry[] {
  const next = [entry, ...prev].slice(0, LOG_MAX);
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function fallingCoachNote(
  run: Omit<GameLogEntry, 'headline' | 'tip' | 'tone'>,
  prev?: GameLogEntry,
  history: GameLogEntry[] = [],
): { headline: string; tip: string; tone: CoachTone } {
  const id = run.id;
  const best = history.reduce((m, r) => Math.max(m, r.score), 0);

  if (run.words === 0) {
    return {
      headline: 'No clears',
      tip: 'Watch the lowest word. One complete word is better than three half-typed ones.',
      tone: 'warn',
    };
  }

  if (run.accuracy < 70) {
    return {
      headline: 'Too many drops',
      tip: pick(id, [
        'Ignore high words. Save whatever is closest to the floor.',
        'Slow the typing. Finish one word before jumping to another.',
      ]),
      tone: 'warn',
    };
  }

  if (history.length > 0 && run.score > best) {
    return {
      headline: 'New high',
      tip: `Best run at ${run.score}. Next time, start scanning the bottom of the field earlier.`,
      tone: 'best',
    };
  }

  if (prev && run.score >= prev.score + 80) {
    return {
      headline: 'Up from last',
      tip: `+${run.score - prev.score} vs the last run. Same focus — do not chase every word.`,
      tone: 'up',
    };
  }

  if (run.detail.toLowerCase().includes('tier 8') || run.detail.toLowerCase().includes('tier 9') || run.detail.toLowerCase().includes('tier 10')) {
    return {
      headline: 'Deep run',
      tip: 'Late tiers are about panic control. Keep the cursor in the box and type the lowest word only.',
      tone: 'best',
    };
  }

  return {
    headline: 'Solid run',
    tip: pick(id, [
      'Good clears. Next run, spend a second looking before you type.',
      'Keep this pace. Accuracy on falling words is choosing the right target.',
    ]),
    tone: 'steady',
  };
}

export function attackCoachNote(
  run: Omit<GameLogEntry, 'headline' | 'tip' | 'tone'>,
  prev?: GameLogEntry,
  history: GameLogEntry[] = [],
): { headline: string; tip: string; tone: CoachTone } {
  const id = run.id;
  const best = history.reduce((m, r) => Math.max(m, r.score), 0);

  if (run.accuracy < 70) {
    return {
      headline: 'Timer won',
      tip: pick(id, [
        'Start the word the instant it appears. Combo dies on hesitation.',
        'If the clock is under a second, skip the miss and reset on the next word.',
      ]),
      tone: 'warn',
    };
  }

  if (history.length > 0 && run.score > best) {
    return {
      headline: 'New high',
      tip: `Best at ${run.score}. Protect the combo — three hits in a row is worth more than one hard word.`,
      tone: 'best',
    };
  }

  if ((run.combo || 0) >= 8) {
    return {
      headline: `${run.combo} combo`,
      tip: 'That streak is the real score. Do not break it to rush a long word.',
      tone: 'best',
    };
  }

  if (prev && run.accuracy >= prev.accuracy + 5) {
    return {
      headline: 'Cleaner',
      tip: `Accuracy up ${run.accuracy - prev.accuracy}%. Combos will follow.`,
      tone: 'up',
    };
  }

  if (run.detail.toLowerCase().includes('8 round')) {
    return {
      headline: 'Full set',
      tip: 'You finished all 8 rounds. One more run with the same accuracy will raise the score.',
      tone: 'up',
    };
  }

  return {
    headline: 'Solid set',
    tip: pick(id, [
      'Good hits. Look at the next word while you finish the current one.',
      'Keep the combo alive. Multipliers beat raw speed here.',
    ]),
    tone: 'steady',
  };
}

const toneBorder: Record<CoachTone, string> = {
  best: 'border-l-accent bg-accent-bg',
  up: 'border-l-correct/60 bg-surface-raised/50',
  warn: 'border-l-error/50 bg-error-bg',
  focus: 'border-l-accent/40 bg-accent-bg',
  steady: 'border-l-surface-border bg-surface-raised/50',
};

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(max - min, 6);
  return (
    <div className="flex h-7 items-end gap-[3px]" aria-hidden>
      {values.map((v, i) => {
        const h = 22 + ((v - min) / span) * 78;
        const latest = i === values.length - 1;
        return (
          <div
            key={i}
            className={`w-1.5 rounded-sm ${latest ? 'bg-accent' : 'bg-surface-border'}`}
            style={{ height: `${h}%` }}
            title={String(v)}
          />
        );
      })}
    </div>
  );
}

interface GameFeedbackProps {
  log: GameLogEntry[];
  extraActions?: ReactNode;
}

export default function GameFeedback({ log, extraActions }: GameFeedbackProps) {
  if (log.length === 0) return null;

  const latest = log[0];
  const prev = log[1];
  const bestScore = Math.max(...log.map((r) => r.score));
  const avgScore = Math.round(log.reduce((s, r) => s + r.score, 0) / log.length);
  const spark = [...log].reverse().map((r) => r.score);
  const history = log.slice(1);
  const isBest = latest.score === bestScore && log.length > 1;
  const scoreDelta = prev ? latest.score - prev.score : 0;

  return (
    <div className="mt-10 w-full">
      <div className="mb-8 flex items-center gap-4" aria-hidden>
        <span className="h-px flex-1 bg-surface-border/80" />
        <span className="h-1 w-1 rounded-full bg-surface-border" />
        <span className="h-px flex-1 bg-surface-border/80" />
      </div>

      <article
        key={latest.id}
        className={`animate-fade-up rounded-xl border border-surface-border border-l-[3px] px-5 py-5 ${toneBorder[latest.tone]}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-dim">result</p>
          <p className="text-[11px] text-text-dim">
            {timeAgo(latest.date)}
            <span className="text-surface-border"> · </span>
            {latest.detail}
            {isBest && (
              <>
                <span className="text-surface-border"> · </span>
                <span className="text-accent">best</span>
              </>
            )}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-end gap-5">
            <div>
              <p className="font-mono text-5xl font-extralight leading-none tabular-nums text-accent">
                {latest.score}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-text-dim">score</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-light leading-none tabular-nums text-text-bright">
                {latest.wpm}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-text-dim">wpm</p>
            </div>
            <div>
              <p className="font-mono text-2xl font-light leading-none tabular-nums text-text-bright">
                {latest.accuracy}
                <span className="text-sm text-text-dim">%</span>
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-text-dim">accuracy</p>
            </div>
          </div>
          {prev && scoreDelta !== 0 && (
            <span className={`text-[11px] tabular-nums ${scoreDelta > 0 ? 'text-correct' : 'text-error'}`}>
              {scoreDelta > 0 ? '↑' : '↓'}
              {Math.abs(scoreDelta)} vs last
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p className="font-mono text-base tabular-nums text-correct">{latest.hits}</p>
            <p className="text-[10px] uppercase tracking-wider text-text-dim">cleared</p>
          </div>
          <div>
            <p className="font-mono text-base tabular-nums text-error">{latest.misses}</p>
            <p className="text-[10px] uppercase tracking-wider text-text-dim">misses</p>
          </div>
          <div>
            <p className="font-mono text-base tabular-nums text-text-bright">{latest.duration}s</p>
            <p className="text-[10px] uppercase tracking-wider text-text-dim">time</p>
          </div>
          <div>
            <p className="font-mono text-base tabular-nums text-text-bright">
              {latest.combo ?? latest.words}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-text-dim">
              {latest.combo != null ? 'best combo' : 'words'}
            </p>
          </div>
        </div>

        <h3 className="mt-4 text-sm font-medium text-text-bright">{latest.headline}</h3>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-text">{latest.tip}</p>

        {extraActions && <div className="mt-3 flex flex-wrap gap-2">{extraActions}</div>}

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-surface-border/70 pt-3">
          <Sparkline values={spark} />
          <p className="text-[11px] text-text-dim">
            <span className="tabular-nums text-text-bright">{bestScore}</span> best
            <span className="text-surface-border"> · </span>
            <span className="tabular-nums text-text-bright">{avgScore}</span> avg
          </p>
        </div>
      </article>

      {history.length > 0 && (
        <div className="mt-7">
          <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-text-dim">
            performances
          </p>
          <ul className="flex flex-col gap-1.5">
            {history.map((entry) => {
              const rowBest = entry.score === bestScore;
              return (
                <li
                  key={entry.id}
                  className="rounded-lg border border-surface-border/80 bg-surface-raised/30 px-3 py-2"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <div className="flex items-baseline gap-2 font-mono text-sm">
                      <span className="text-base font-light tabular-nums text-accent">{entry.score}</span>
                      <span className="text-[11px] text-text-dim">pts</span>
                      <span className="text-surface-border">·</span>
                      <span className="tabular-nums text-text-bright">{entry.wpm}</span>
                      <span className="text-[11px] text-text-dim">wpm</span>
                      <span className="text-surface-border">·</span>
                      <span className="tabular-nums text-text-bright">{entry.accuracy}%</span>
                      {rowBest && (
                        <span className="rounded-full bg-accent-bg px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-accent">
                          best
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-text-dim">
                      {timeAgo(entry.date)}
                      <span className="text-surface-border"> · </span>
                      {entry.detail}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-text-dim">
                    {entry.headline}. {entry.tip}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
