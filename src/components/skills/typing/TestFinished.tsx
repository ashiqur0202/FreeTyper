'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ArrowDown, X } from 'lucide-react';
import { LEVELS, levelIndex } from './levelLadder';

interface TestFinishedProps {
  wpm: number;
  accuracy: number;
  seconds: number;
  /** Net WPM of the run before this one, when there is one. */
  previousWpm: number | null;
  /** This run beat every run in the list. */
  newBest: boolean;
  /** No level badge (number row runs are not on the level ladder). */
  plain?: boolean;
  onAgain: () => void;
  onDetails: () => void;
  onClose: () => void;
  /** The "challenge a friend" button, when this run can be sent. */
  challenge?: ReactNode;
}

/** Near-black or white, whichever reads better on the accent colour in use (any accent, any theme). */
function inkOnAccent(): string {
  const dark = '#16140f';
  if (typeof document === 'undefined') return dark;
  const m = /^#?([0-9a-f]{6})/i.exec(getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim());
  if (!m) return dark;
  const n = parseInt(m[1], 16);
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lum = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  const onDark = (lum + 0.05) / (0.008 + 0.05);
  const onWhite = 1.05 / (lum + 0.05);
  return onDark >= onWhite ? dark : '#ffffff';
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

/** Counts up to `target` once, unless the person asked for less motion. */
function useCountUp(target: number, ms = 700) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0));
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

function Note({ wpm, previousWpm, newBest }: { wpm: number; previousWpm: number | null; newBest: boolean }) {
  if (previousWpm === null) return <>Your first run here. Nice start.</>;
  const d = wpm - previousWpm;
  if (newBest) {
    return (
      <>
        Your fastest yet: <b className="font-mono font-medium text-correct">↑ {d} wpm</b> on your last run.
      </>
    );
  }
  if (d > 0) {
    return (
      <>
        Faster than your last run: <b className="font-mono font-medium text-correct">↑ {d} wpm</b>
      </>
    );
  }
  if (d === 0) return <>Same speed as your last run.</>;
  return (
    <>
      <b className="font-mono font-medium text-error">↓ {Math.abs(d)} wpm</b> under your last run. Go again?
    </>
  );
}

/**
 * The small box shown over the text when a speed test ends. Three lines: the level and how this run
 * compares, the numbers, then what to do next. Nothing starts again until the person chooses.
 */
export default function TestFinished({
  wpm,
  accuracy,
  seconds,
  previousWpm,
  newBest,
  plain = false,
  onAgain,
  onDetails,
  onClose,
  challenge,
}: TestFinishedProps) {
  const shown = useCountUp(wpm);
  const [ink] = useState(inkOnAccent);
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-1">
      <div
        role="dialog"
        aria-label="Test finished"
        data-typing-ignore
        className={`test-finished pointer-events-auto relative w-full max-w-[34em] animate-fade-up rounded-[1em] border bg-surface-raised px-[1em] py-[0.875em] shadow-2xl sm:px-[1.25em] ${
          newBest ? 'border-accent shadow-[0_0_28px_var(--color-accent-bg)]' : 'border-accent/40'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-[0.5em] top-[0.5em] rounded-md p-[0.25em] text-text-dim transition-colors hover:bg-surface hover:text-text-bright"
        >
          <X className="size-[0.875em]" />
        </button>

        <div className="flex min-h-[1.5em] flex-wrap items-center justify-between gap-x-[0.75em] gap-y-[0.25em] pr-[1.75em]">
          <div className="flex items-center gap-[0.375em]">
            {!plain && (
              <span className="rounded-full bg-accent-bg px-[0.625em] py-[0.125em] text-[0.625em] font-semibold uppercase tracking-wider text-accent">
                {LEVELS[levelIndex(wpm)].key}
              </span>
            )}
            {newBest && (
              <span
                className="rounded-full bg-accent px-[0.625em] py-[0.125em] text-[0.625em] font-semibold uppercase tracking-wider"
                style={{ color: ink }}
              >
                new best
              </span>
            )}
          </div>
          <p className="text-[0.75em] text-text-dim">
            <Note wpm={wpm} previousWpm={previousWpm} newBest={newBest} />
          </p>
        </div>

        <div className="mt-[0.5em] flex items-end gap-[1.25em]">
          <div>
            <p className="font-mono text-[3em] font-extralight leading-none tabular-nums text-accent">{shown}</p>
            <p className="mt-[0.25em] text-[0.625em] uppercase tracking-widest text-text-dim">net wpm</p>
          </div>
          <div>
            <p className="font-mono text-[1.5em] font-light leading-none tabular-nums text-text-bright">
              {accuracy}
              <span className="text-[0.58em] text-text-dim">%</span>
            </p>
            <p className="mt-[0.25em] text-[0.625em] uppercase tracking-widest text-text-dim">accuracy</p>
          </div>
          <div>
            <p className="font-mono text-[1.5em] font-light leading-none tabular-nums text-text-bright">
              {seconds}
              <span className="text-[0.58em] text-text-dim">s</span>
            </p>
            <p className="mt-[0.25em] text-[0.625em] uppercase tracking-widest text-text-dim">time</p>
          </div>
        </div>

        <div className="mt-[0.875em] flex flex-wrap gap-[0.5em]">
          <button
            type="button"
            onClick={onAgain}
            style={{ color: ink }}
            className="inline-flex flex-1 items-center justify-center gap-[0.5em] rounded-[0.5em] bg-accent px-[1em] py-[0.625em] text-[0.875em] font-semibold transition-opacity hover:opacity-90 max-sm:basis-full sm:flex-none"
          >
            Test again
            <kbd className="hidden rounded border border-current/40 px-[0.3em] font-mono text-[0.72em] sm:inline">Enter</kbd>
          </button>
          {challenge}
          <button
            type="button"
            onClick={onDetails}
            className="inline-flex flex-1 items-center justify-center gap-[0.5em] rounded-[0.5em] border border-surface-border px-[1em] py-[0.625em] text-[0.875em] text-text transition-colors hover:border-accent/50 hover:text-accent max-sm:basis-full sm:flex-none"
          >
            See details
            <ArrowDown className="size-[1em]" />
          </button>
        </div>
      </div>
    </div>
  );
}
