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
import { isLevelUnlocked, shrinkDiameter, stepTarget, type Mover } from './levelRules';
import { useMouseProgress } from './useMouseProgress';
import { trackEvent } from '@/lib/analytics';

export type AimMode = 'classic' | 'moving' | 'shrinking';

type Phase = 'idle' | 'running' | 'done';

const SIZE_LABEL: Record<AimSize, string> = { large: 'Large', medium: 'Medium', small: 'Small' };
const MODE_LABEL: Record<AimMode, string> = { classic: 'Classic', moving: 'Moving', shrinking: 'Shrinking' };
const MODE_NOTE: Record<AimMode, string> = {
  classic: 'The target stays where it appears.',
  moving: 'The target drifts across the area.',
  shrinking: 'The target gets 4 px smaller with every hit, down to 24 px.',
};
const MOVE_SPEED = 130; // px per second in Moving mode

/** Level that opens each mode on the Aim tab. */
const MODE_LEVEL: Record<AimMode, 1 | 3 | 4> = { classic: 1, moving: 3, shrinking: 4 };

type Props = {
  /** The Level 4 "shrink" drill runs the Shrinking mode with the mode picker hidden. */
  lockedMode?: AimMode;
  passScore?: number;
  onPass?: () => void;
};

export default function AimTrainer({ lockedMode, passScore, onPass }: Props) {
  const { progress, recordBest } = useMouseProgress();
  const done = progress.done[progress.device];
  const [modeChoice, setModeChoice] = useState<AimMode>('classic');
  const mode: AimMode = lockedMode ?? modeChoice;
  const [chosen, setChosen] = useState<AimSize | null>(null);
  const size: AimSize = chosen ?? defaultSize(progress.device);

  const [phase, setPhase] = useState<Phase>('idle');
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [counts, setCounts] = useState({ hits: 0, misses: 0 });
  const [secondsLeft, setSecondsLeft] = useState(AIM_SECONDS);
  const [result, setResult] = useState<AimResult | null>(null);
  const [isBest, setIsBest] = useState(false);

  const d = mode === 'shrinking' ? shrinkDiameter(counts.hits) : AIM_SIZES[size];
  const bestKey = mode === 'classic' ? size : mode === 'moving' ? `moving-${size}` : 'shrinking';
  const best = progress.best[bestKey];

  const areaRef = useRef<HTMLDivElement>(null);
  const events = useRef<AimEvent[]>([]);
  const startedAt = useRef(0);
  const shownAt = useRef(0);
  const running = useRef(false);
  const mover = useRef<Mover>({ x: 0, y: 0, vx: MOVE_SPEED, vy: MOVE_SPEED * 0.6 });
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => () => clearInterval(timer.current), []);

  // Moving mode: advance the target every frame while a run is going.
  useEffect(() => {
    if (phase !== 'running' || mode !== 'moving') return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const r = areaRef.current?.getBoundingClientRect();
      if (r) {
        mover.current = stepTarget(mover.current, Math.min(0.05, (now - last) / 1000), r.width, r.height, d);
        setPos({ x: mover.current.x, y: mover.current.y });
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, mode, d]);

  const place = (diameter: number) => {
    const r = areaRef.current?.getBoundingClientRect();
    const p = randomTarget(r?.width ?? 600, r?.height ?? 320, diameter);
    const angle = Math.random() * Math.PI * 2;
    mover.current = { x: p.x, y: p.y, vx: Math.cos(angle) * MOVE_SPEED, vy: Math.sin(angle) * MOVE_SPEED };
    setPos(p);
    shownAt.current = performance.now();
  };

  const finish = () => {
    clearInterval(timer.current);
    running.current = false;
    const r = scoreRun(events.current);
    setResult(r);
    setIsBest(recordBest(bestKey, r.score));
    setPhase('done');
    trackEvent('aim_run_complete', { mode, size, hits: r.hits, accuracy: r.accuracy, score: r.score });
    if (passScore !== undefined && r.score >= passScore) onPass?.();
  };

  const start = () => {
    events.current = [];
    setCounts({ hits: 0, misses: 0 });
    setResult(null);
    setIsBest(false);
    setSecondsLeft(AIM_SECONDS);
    running.current = true;
    startedAt.current = performance.now();
    place(mode === 'shrinking' ? shrinkDiameter(0) : AIM_SIZES[size]);
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
    place(mode === 'shrinking' ? shrinkDiameter(counts.hits + 1) : AIM_SIZES[size]);
  };

  const modeOpen = (m: AimMode) => !!lockedMode || isLevelUnlocked(MODE_LEVEL[m], done);

  return (
    <div className="mx-auto w-full max-w-2xl">
      {!lockedMode && (
        <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Aim mode">
          {(Object.keys(MODE_LABEL) as AimMode[]).map((m) => {
            const open = modeOpen(m);
            return (
              <button
                key={m}
                type="button"
                disabled={phase === 'running' || !open}
                onClick={() => setModeChoice(m)}
                aria-pressed={mode === m}
                title={open ? undefined : `Opens when you reach Level ${MODE_LEVEL[m]} in Learn`}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  mode === m ? 'border-accent bg-accent-bg text-accent' : 'border-surface-border text-text-dim hover:text-text'
                } disabled:opacity-50`}
              >
                {MODE_LABEL[m]}
                {!open && ' 🔒'}
              </button>
            );
          })}
        </div>
      )}

      {mode !== 'shrinking' && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Target size">
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
      )}

      <p className="mt-2 text-center text-xs text-text-dim">
        {phase === 'running'
          ? `${secondsLeft}s left · ${counts.hits} hits · ${counts.misses} misses`
          : `${MODE_NOTE[mode]} ${AIM_SECONDS} seconds. A click that misses costs a point.${
              passScore !== undefined ? ` Score ${passScore} or more to pass.` : ''
            }${best ? ` Best: ${best}.` : ''}`}
      </p>

      <div ref={areaRef} className="mp-aim mt-3" data-testid="aim-area" onPointerDown={() => record({ hit: false })}>
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
              <p className="text-sm text-text-dim">
                {passScore !== undefined && result.score < passScore
                  ? `Not quite: you need ${passScore}.`
                  : isBest
                    ? 'New best!'
                    : 'Time is up'}
              </p>
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
