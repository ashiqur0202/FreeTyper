'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  AIM_SECONDS,
  AIM_SIZES,
  defaultSize,
  randomTarget,
  scoreRun,
  type AimEvent,
  type AimResult,
  type AimSize,
} from './aimScoring';
import { useMouseProgress } from './useMouseProgress';
import { trackEvent } from '@/lib/analytics';

type Phase = 'idle' | 'running' | 'done';

const SIZE_LABEL: Record<AimSize, string> = { large: 'Large', medium: 'Medium', small: 'Small' };

export default function AimTrainer() {
  const { progress, recordBest } = useMouseProgress();
  const [chosen, setChosen] = useState<AimSize | null>(null);
  const size: AimSize = chosen ?? defaultSize(progress.device);
  const d = AIM_SIZES[size];

  const [phase, setPhase] = useState<Phase>('idle');
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [counts, setCounts] = useState({ hits: 0, misses: 0 });
  const [secondsLeft, setSecondsLeft] = useState(AIM_SECONDS);
  const [result, setResult] = useState<AimResult | null>(null);
  const [isBest, setIsBest] = useState(false);

  const areaRef = useRef<HTMLDivElement>(null);
  const events = useRef<AimEvent[]>([]);
  const startedAt = useRef(0);
  const shownAt = useRef(0);
  const running = useRef(false);
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => () => clearInterval(timer.current), []);

  const place = () => {
    const r = areaRef.current?.getBoundingClientRect();
    setPos(randomTarget(r?.width ?? 600, r?.height ?? 320, d));
    shownAt.current = performance.now();
  };

  const finish = () => {
    clearInterval(timer.current);
    running.current = false;
    const r = scoreRun(events.current);
    setResult(r);
    setIsBest(recordBest(size, r.score));
    setPhase('done');
    trackEvent('aim_run_complete', { size, hits: r.hits, accuracy: r.accuracy, score: r.score });
  };

  const start = () => {
    events.current = [];
    setCounts({ hits: 0, misses: 0 });
    setResult(null);
    setIsBest(false);
    setSecondsLeft(AIM_SECONDS);
    running.current = true;
    startedAt.current = performance.now();
    place();
    setPhase('running');
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      const left = AIM_SECONDS - (performance.now() - startedAt.current) / 1000;
      if (left <= 0) {
        setSecondsLeft(0);
        finish();
      } else {
        setSecondsLeft(Math.ceil(left));
      }
    }, 100);
  };

  const record = (e: AimEvent) => {
    if (!running.current) return;
    events.current.push(e);
    setCounts((c) => (e.hit ? { ...c, hits: c.hits + 1 } : { ...c, misses: c.misses + 1 }));
  };

  const onTarget = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!running.current) return;
    record({ hit: true, reactionMs: Math.round(performance.now() - shownAt.current) });
    place();
  };

  const best = progress.best[size];

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Target size">
        {(Object.keys(AIM_SIZES) as AimSize[]).map((s) => (
          <button
            key={s}
            type="button"
            disabled={phase === 'running'}
            onClick={() => setChosen(s)}
            aria-pressed={size === s}
            className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              size === s ? 'border-accent bg-accent-bg text-accent' : 'border-surface-border text-text-dim hover:text-text'
            } disabled:opacity-50`}
          >
            {SIZE_LABEL[s]}
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-text-dim">
        {phase === 'running'
          ? `${secondsLeft}s left · ${counts.hits} hits · ${counts.misses} misses`
          : `Click each target as fast as you can for ${AIM_SECONDS} seconds. A click that misses costs a point.${
              best ? ` Best on ${size}: ${best}.` : ''
            }`}
      </p>

      <div
        ref={areaRef}
        className="mp-aim mt-3"
        data-testid="aim-area"
        onPointerDown={() => record({ hit: false })}
      >
        {phase === 'running' && (
          <button
            type="button"
            className="mp-aim-target"
            style={{ width: d, height: d, left: pos.x, top: pos.y }}
            onPointerDown={onTarget}
            aria-label="Target"
            data-testid="aim-target"
            tabIndex={-1}
          />
        )}
        {phase === 'idle' && (
          <div className="absolute inset-0 grid place-items-center">
            <button
              type="button"
              onClick={start}
              className="rounded-xl border border-accent bg-accent-bg px-6 py-3 text-sm font-medium text-accent"
              onPointerDown={(e) => e.stopPropagation()}
            >
              Start
            </button>
          </div>
        )}
        {phase === 'done' && result && (
          <div className="absolute inset-0 grid place-items-center bg-black/40" onPointerDown={(e) => e.stopPropagation()}>
            <div className="text-center">
              <p className="text-sm text-text-dim">{isBest ? 'New best!' : 'Time is up'}</p>
              <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-3 px-3 sm:grid-cols-5">
                <div className="mp-stat"><b data-testid="aim-score">{result.score}</b><span>score</span></div>
                <div className="mp-stat"><b>{result.hits}</b><span>hits</span></div>
                <div className="mp-stat"><b>{result.misses}</b><span>misses</span></div>
                <div className="mp-stat"><b>{result.accuracy}%</b><span>accuracy</span></div>
                <div className="mp-stat"><b>{result.avgReactionMs}</b><span>ms avg</span></div>
              </div>
              <button
                type="button"
                onClick={start}
                className="mt-4 rounded-xl border border-accent bg-accent-bg px-5 py-2 text-sm font-medium text-accent"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
