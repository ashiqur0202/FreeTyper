'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { TypingSession } from './types';

export type CoachTone = 'best' | 'up' | 'warn' | 'focus' | 'steady';

export type PracticeLogEntry = TypingSession & {
  tip: string;
  headline?: string;
  tone?: CoachTone;
};

function pick(seed: string, options: string[]): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return options[h % options.length];
}

function categoryLabel(detail?: string) {
  if (detail === 'weak') return 'weak keys';
  return detail || 'practice';
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

function rankLabel(wpm: number) {
  if (wpm >= 100) return 'elite';
  if (wpm >= 80) return 'pro';
  if (wpm >= 60) return 'skilled';
  if (wpm >= 40) return 'average';
  return 'beginner';
}

function percentileLabel(wpm: number) {
  if (wpm >= 100) return 'top 5%';
  if (wpm >= 80) return 'fast';
  if (wpm >= 70) return 'above average';
  if (wpm >= 50) return 'average';
  if (wpm >= 30) return 'below average';
  return 'beginner';
}

function wpmBarPercent(wpm: number) {
  return Math.min(100, (wpm / 120) * 100);
}

function grossWpm(run: TypingSession) {
  const minutes = run.duration / 60;
  return minutes > 0 ? Math.round(run.totalChars / 5 / minutes) : 0;
}

export function coachNote(
  run: TypingSession,
  prev?: PracticeLogEntry,
  history: PracticeLogEntry[] = [],
): { headline: string; tip: string; tone: CoachTone } {
  const id = run.id;
  const bestWpm = history.reduce((m, r) => Math.max(m, r.wpm), 0);
  let cleanStreak = run.accuracy >= 95 ? 1 : 0;
  if (cleanStreak) {
    for (const r of history) {
      if (r.accuracy >= 95) cleanStreak += 1;
      else break;
    }
  }

  if (run.accuracy < 88) {
    return {
      headline: 'Slow down',
      tip: pick(id, [
        'Drop the pace. Look one word ahead and only type what you see.',
        'Too many misses. Finish the word, then reset — don\'t fight the keyboard.',
        'Accuracy first. Lose 10 WPM until this sits above 95%.',
      ]),
      tone: 'warn',
    };
  }

  if (run.accuracy < 95) {
    return {
      headline: 'Almost clean',
      tip: pick(id, [
        'Hold 95% before chasing WPM. The next few runs should feel easy.',
        'Close. Relax the hands and keep this same pace.',
        'Clean beats fast. One careful run now saves ten sloppy ones later.',
      ]),
      tone: 'warn',
    };
  }

  if (history.length > 0 && run.wpm > bestWpm && run.accuracy >= 95) {
    return {
      headline: 'New best',
      tip: `Best so far at ${run.wpm} WPM. Lock it in with two more clean runs — don't sprint.`,
      tone: 'best',
    };
  }

  if (run.incorrectChars === 0 && run.totalChars >= 40) {
    return {
      headline: 'Clean sheet',
      tip: pick(id, [
        'Zero misses. Add a little speed without breaking this.',
        'Perfect accuracy. Nudge the cadence on the next passage.',
      ]),
      tone: 'best',
    };
  }

  if (prev && run.wpm >= prev.wpm + 4 && run.accuracy >= prev.accuracy) {
    return {
      headline: 'Faster, still clean',
      tip: `Up ${run.wpm - prev.wpm} WPM and accuracy held. That's real progress — keep the same focus.`,
      tone: 'up',
    };
  }

  if (prev && run.accuracy >= prev.accuracy + 3) {
    return {
      headline: 'Cleaner',
      tip: `Accuracy up ${run.accuracy - prev.accuracy}%. That's the gain that lasts.`,
      tone: 'up',
    };
  }

  if (prev && run.wpm + 5 <= prev.wpm && run.accuracy > prev.accuracy) {
    return {
      headline: 'Right trade',
      tip: 'Slower but cleaner. Stay here until 95% feels automatic, then add speed.',
      tone: 'focus',
    };
  }

  if (cleanStreak >= 3) {
    return {
      headline: `${cleanStreak} clean runs`,
      tip: 'The floor is solid. You can add a little speed now without getting sloppy.',
      tone: 'up',
    };
  }

  if (run.modeDetail === 'code') {
    return {
      headline: 'Code set',
      tip: 'Symbols count. Pause on punctuation instead of rushing past it.',
      tone: 'focus',
    };
  }

  if (run.modeDetail === 'weak') {
    return {
      headline: 'Weak-key work',
      tip: 'Stay accurate even if WPM drops. This is the drill that raises your floor.',
      tone: 'focus',
    };
  }

  if (run.duration < 15) {
    return {
      headline: 'Short run',
      tip: 'A longer passage tells you more. Finish the next one without peeking at the clock.',
      tone: 'steady',
    };
  }

  if (run.accuracy >= 98 && run.wpm >= 70) {
    return {
      headline: 'Job-test shape',
      tip: 'This is the standard. Two more like this — don\'t get sloppy.',
      tone: 'best',
    };
  }

  if (run.accuracy >= 95 && run.wpm < 40) {
    return {
      headline: 'Clean foundation',
      tip: 'Accuracy is there. Shorten the pause between words on the next one.',
      tone: 'steady',
    };
  }

  if (run.accuracy >= 95 && run.wpm < 60) {
    return {
      headline: 'Solid set',
      tip: pick(id, [
        'Clean. Try a slightly faster cadence — same accuracy, a bit less hesitation.',
        'Good rhythm. Keep looking one word ahead and let the hands follow.',
      ]),
      tone: 'steady',
    };
  }

  if (run.wpm >= 80) {
    return {
      headline: 'Fast',
      tip: 'Only count it if accuracy stays high. One careful run beats three rushed ones.',
      tone: 'focus',
    };
  }

  return {
    headline: 'Good set',
    tip: pick(id, [
      'Same focus on the next passage. Don\'t change anything that is working.',
      'Keep this pace. Consistency beats a lucky fast run.',
    ]),
    tone: 'steady',
  };
}

export function lessonCoachNote(
  run: TypingSession,
  prev?: PracticeLogEntry,
  history: PracticeLogEntry[] = [],
): { headline: string; tip: string; tone: CoachTone } {
  const id = run.id;
  const name = (run.modeDetail || '').toLowerCase();
  const bestWpm = history.reduce((m, r) => Math.max(m, r.wpm), 0);

  if (run.accuracy < 88) {
    return {
      headline: 'Stay on this lesson',
      tip: pick(id, [
        'Too many misses. Repeat this one slowly with your eyes on the text, not the keys.',
        'Accuracy first. The next lesson will feel worse if this is not automatic.',
      ]),
      tone: 'warn',
    };
  }

  if (run.accuracy < 95) {
    return {
      headline: 'Almost there',
      tip: pick(id, [
        'One more clean pass. New keys on a messy foundation make everything harder.',
        'Close. Slow the pace until 95% feels easy, then move on.',
      ]),
      tone: 'warn',
    };
  }

  if (history.length > 0 && run.wpm > bestWpm && run.accuracy >= 95) {
    return {
      headline: 'New best',
      tip: `Best so far at ${run.wpm} WPM. Keep this accuracy on the next lesson.`,
      tone: 'best',
    };
  }

  if (run.incorrectChars === 0 && run.totalChars >= 40) {
    return {
      headline: 'Clean sheet',
      tip: 'Zero misses. That is the standard for adding new keys.',
      tone: 'best',
    };
  }

  if (prev && run.wpm >= prev.wpm + 4 && run.accuracy >= prev.accuracy) {
    return {
      headline: 'Faster, still clean',
      tip: `Up ${run.wpm - prev.wpm} WPM and accuracy held. Ready for the next layer.`,
      tone: 'up',
    };
  }

  if (name.includes('home')) {
    return {
      headline: 'Home row',
      tip: 'This is the floor. Repeat until returning to A S D F J K L ; feels boring.',
      tone: 'focus',
    };
  }

  if (name.includes('top row')) {
    return {
      headline: 'Top row',
      tip: 'Stretch one finger, press, return home. Do not slide the whole hand up.',
      tone: 'focus',
    };
  }

  if (name.includes('bottom')) {
    return {
      headline: 'Bottom row',
      tip: 'Reach down and return. Watch commas and periods — they break rhythm if you peek.',
      tone: 'focus',
    };
  }

  if (name.includes('common')) {
    return {
      headline: 'Common words',
      tip: 'These words are most of English. Smooth them out and everything else gets faster.',
      tone: 'steady',
    };
  }

  if (name.includes('sentence')) {
    return {
      headline: 'Sentences',
      tip: 'Hold the same accuracy across punctuation and spaces. Do not sprint the easy words.',
      tone: 'steady',
    };
  }

  if (name.includes('number') || name.includes('symbol')) {
    return {
      headline: 'Numbers & symbols',
      tip: 'Pause on digits and punctuation. A clean reach beats a rushed miss.',
      tone: 'focus',
    };
  }

  if (name.includes('speed')) {
    return {
      headline: 'Speed building',
      tip: 'Full keyboard. Take this same focus into practice mode next.',
      tone: 'best',
    };
  }

  return {
    headline: 'Lesson complete',
    tip: 'Next lesson is unlocked. Same accuracy standard — do not get sloppy because it is new.',
    tone: 'steady',
  };
}

export function speedTestCoachNote(
  run: TypingSession,
  prev?: PracticeLogEntry,
  history: PracticeLogEntry[] = [],
): { headline: string; tip: string; tone: CoachTone } {
  const id = run.id;
  const bestWpm = history.reduce((m, r) => Math.max(m, r.wpm), 0);
  const timed = run.duration < 20;

  if (run.accuracy < 88) {
    return {
      headline: 'Not a real score',
      tip: pick(id, [
        'Too many misses. This WPM does not count until accuracy is back above 95%.',
        'Slow down. A clean 50 is more useful than a messy 80.',
      ]),
      tone: 'warn',
    };
  }

  if (run.accuracy < 95) {
    return {
      headline: 'Hold accuracy',
      tip: 'Get to 95% before chasing WPM. Job tests and real work both punish sloppy speed.',
      tone: 'warn',
    };
  }

  if (history.length > 0 && run.wpm > bestWpm && run.accuracy >= 95) {
    return {
      headline: 'New best',
      tip: `Best so far at ${run.wpm} WPM. Repeat the same duration once more to confirm it.`,
      tone: 'best',
    };
  }

  if (run.incorrectChars === 0 && run.totalChars >= 40) {
    return {
      headline: 'Clean sheet',
      tip: 'Zero misses. You can add a little speed on the next timed run.',
      tone: 'best',
    };
  }

  if (prev && run.wpm >= prev.wpm + 4 && run.accuracy >= prev.accuracy) {
    return {
      headline: 'Faster, still clean',
      tip: `Up ${run.wpm - prev.wpm} WPM and accuracy held. That is a real gain.`,
      tone: 'up',
    };
  }

  if (prev && run.accuracy >= prev.accuracy + 3) {
    return {
      headline: 'Cleaner',
      tip: `Accuracy up ${run.accuracy - prev.accuracy}%. That will raise your net WPM more than raw speed.`,
      tone: 'up',
    };
  }

  if (timed && run.accuracy >= 95) {
    return {
      headline: 'Short test',
      tip: '15s runs bounce around. A 60s test is the score to trust.',
      tone: 'steady',
    };
  }

  if (run.accuracy >= 98 && run.wpm >= 70) {
    return {
      headline: 'Job-test shape',
      tip: 'This is the standard. One more 60s run like this and you can trust the number.',
      tone: 'best',
    };
  }

  if ((run.modeDetail || '').includes('code')) {
    return {
      headline: 'Code test',
      tip: 'Symbols count. Pause on punctuation instead of rushing the line.',
      tone: 'focus',
    };
  }

  if (run.accuracy >= 95 && run.wpm < 40) {
    return {
      headline: 'Clean foundation',
      tip: 'Accuracy is there. Shorten the pause between words on the next timed run.',
      tone: 'steady',
    };
  }

  return {
    headline: 'Solid test',
    tip: pick(id, [
      'Same focus on the next run. Do not change anything that is working.',
      'Good score. A second test at the same duration tells you if it sticks.',
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
            title={`${v} wpm`}
          />
        );
      })}
    </div>
  );
}

function Delta({ label, value }: { label: string; value: number }) {
  if (value === 0) {
    return (
      <span className="text-[11px] text-text-dim">
        {label} even
      </span>
    );
  }
  const up = value > 0;
  return (
    <span className={`text-[11px] tabular-nums ${up ? 'text-correct' : 'text-error'}`}>
      {up ? '↑' : '↓'}
      {Math.abs(value)} {label}
    </span>
  );
}

interface PracticeFeedbackProps {
  log: PracticeLogEntry[];
  currentCategory?: string;
  onTryWeakKeys?: () => void;
  extraActions?: ReactNode;
}

export default function PracticeFeedback({
  log,
  currentCategory,
  onTryWeakKeys,
  extraActions,
}: PracticeFeedbackProps) {
  if (log.length === 0) return null;

  const latest = log[0];
  const prev = log[1];
  const tone = latest.tone ?? 'steady';
  const headline = latest.headline ?? 'Last run';
  const bestWpm = Math.max(...log.map((r) => r.wpm));
  const avgWpm = Math.round(log.reduce((s, r) => s + r.wpm, 0) / log.length);
  const cleanCount = log.filter((r) => r.accuracy >= 95).length;
  const spark = [...log].reverse().map((r) => r.wpm);
  const history = log.slice(1);
  const showWeakCta =
    log.length >= 3 && latest.accuracy >= 95 && currentCategory !== 'weak' && !!onTryWeakKeys;
  const showGuideCta = latest.accuracy < 95;
  const isBest = latest.wpm === bestWpm && log.length > 1;
  const detailed = latest.mode === 'speed-test';
  const gross = detailed ? grossWpm(latest) : 0;
  const words = detailed ? Math.max(0, Math.round(latest.correctChars / 5)) : 0;

  return (
    <div className="mt-10 w-full">
      <div className="mb-8 flex items-center gap-4" aria-hidden>
        <span className="h-px flex-1 bg-surface-border/80" />
        <span className="h-1 w-1 rounded-full bg-surface-border" />
        <span className="h-px flex-1 bg-surface-border/80" />
      </div>

      <article
        key={latest.id}
        className={`animate-fade-up rounded-xl border border-surface-border border-l-[3px] ${
          detailed ? 'px-5 py-5' : 'px-4 py-3.5'
        } ${toneBorder[tone]}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-text-dim">
            {detailed ? 'result' : 'guide'}
          </p>
          <p className="text-[11px] text-text-dim">
            {timeAgo(latest.date)}
            <span className="text-surface-border"> · </span>
            {categoryLabel(latest.modeDetail)}
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
              <p className={`font-mono font-extralight leading-none tabular-nums text-accent ${detailed ? 'text-5xl' : 'text-4xl'}`}>
                {latest.wpm}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-text-dim">
                {detailed ? 'net wpm' : 'wpm'}
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl font-light leading-none tabular-nums text-text-bright">
                {latest.accuracy}
                <span className="text-sm text-text-dim">%</span>
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-text-dim">accuracy</p>
            </div>
            <div className="hidden sm:block">
              <p className="font-mono text-lg font-light leading-none tabular-nums text-text">
                {latest.duration}s
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-text-dim">time</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {detailed && (
              <span className="rounded-full bg-accent-bg px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
                {rankLabel(latest.wpm)}
                <span className="text-accent/70"> · {percentileLabel(latest.wpm)}</span>
              </span>
            )}
            {prev && (
              <div className="flex flex-col items-end gap-0.5">
                <Delta label="wpm" value={latest.wpm - prev.wpm} />
                <Delta label="acc" value={latest.accuracy - prev.accuracy} />
              </div>
            )}
          </div>
        </div>

        {detailed && (
          <>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
              <div
                className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
                style={{ width: `${wpmBarPercent(latest.wpm)}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-text-dim">wpm scale · 120</p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="font-mono text-base tabular-nums text-correct">{latest.correctChars}</p>
                <p className="text-[10px] uppercase tracking-wider text-text-dim">correct</p>
              </div>
              <div>
                <p className="font-mono text-base tabular-nums text-error">{latest.incorrectChars}</p>
                <p className="text-[10px] uppercase tracking-wider text-text-dim">errors</p>
              </div>
              <div>
                <p className="font-mono text-base tabular-nums text-text-bright">{gross}</p>
                <p className="text-[10px] uppercase tracking-wider text-text-dim">gross wpm</p>
              </div>
              <div>
                <p className="font-mono text-base tabular-nums text-text-bright">{words}</p>
                <p className="text-[10px] uppercase tracking-wider text-text-dim">words</p>
              </div>
            </div>
          </>
        )}

        <h3 className="mt-4 text-sm font-medium text-text-bright">{headline}</h3>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-text">{latest.tip}</p>

        {(showGuideCta || showWeakCta || extraActions) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {showGuideCta && (
              <Link
                href="/keyboard-guide"
                className="rounded-md border border-surface-border px-2.5 py-1 text-[11px] text-text-dim transition-colors hover:border-accent/40 hover:text-accent"
              >
                finger map
              </Link>
            )}
            {showWeakCta && (
              <button
                type="button"
                onClick={onTryWeakKeys}
                className="rounded-md border border-surface-border px-2.5 py-1 text-[11px] text-text-dim transition-colors hover:border-accent/40 hover:text-accent"
              >
                drill weak keys
              </button>
            )}
            {extraActions}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-surface-border/70 pt-3">
          <Sparkline values={spark} />
          <p className="text-[11px] text-text-dim">
            <span className="tabular-nums text-text-bright">{bestWpm}</span> best
            <span className="text-surface-border"> · </span>
            <span className="tabular-nums text-text-bright">{avgWpm}</span> avg
            <span className="text-surface-border"> · </span>
            <span className="tabular-nums text-text-bright">{cleanCount}</span> clean
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
              const isBest = entry.wpm === bestWpm;
              return (
                <li
                  key={entry.id}
                  className="rounded-lg border border-surface-border/80 bg-surface-raised/30 px-3 py-2"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <div className="flex items-baseline gap-2 font-mono text-sm">
                      <span className="text-base font-light tabular-nums text-accent">
                        {entry.wpm}
                      </span>
                      <span className="text-[11px] text-text-dim">wpm</span>
                      <span className="text-surface-border">·</span>
                      <span className="tabular-nums text-text-bright">{entry.accuracy}%</span>
                      {entry.mode === 'speed-test' && (
                        <>
                          <span className="text-surface-border">·</span>
                          <span className="tabular-nums text-error">{entry.incorrectChars}</span>
                          <span className="text-[11px] text-text-dim">err</span>
                        </>
                      )}
                      <span className="text-surface-border">·</span>
                      <span className="text-[11px] text-text-dim">{entry.duration}s</span>
                      {isBest && (
                        <span className="rounded-full bg-accent-bg px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-accent">
                          best
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-text-dim">
                      {timeAgo(entry.date)}
                      <span className="text-surface-border"> · </span>
                      {categoryLabel(entry.modeDetail)}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-text-dim">
                    {entry.headline ? `${entry.headline}. ` : ''}
                    {entry.tip}
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
