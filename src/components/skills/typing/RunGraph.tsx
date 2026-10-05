'use client';

import { useId, useRef, useState } from 'react';
import type { RunDetail } from './types';

const W = 760;
const H = 190;
const PAD = { l: 34, r: 12, t: 12, b: 26 };

interface RunGraphProps {
  run: RunDetail;
}

/**
 * Speed over time for one run: net speed (gold), raw keystroke speed (grey,
 * dashed) and a red dot for every second that had a mistake. Hand-drawn SVG so
 * there is no chart library to load. Hover, touch or the arrow keys read out a
 * single moment.
 */
export default function RunGraph({ run }: RunGraphProps) {
  const gradId = useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const n = run.speed.length;
  if (n < 2) return null;

  const maxV = Math.max(20, Math.ceil(Math.max(...run.speed, ...run.raw) / 20) * 20);
  const x = (i: number) => PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / maxV) * (H - PAD.t - PAD.b);
  const secAt = (i: number) => Math.round((i / (n - 1)) * Math.max(0, run.seconds - 1));
  const line = (arr: number[]) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const area = `${line(run.speed)} L${x(n - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;

  const ticks: number[] = [];
  for (let v = 0; v <= maxV; v += maxV > 120 ? 40 : 20) ticks.push(v);
  const secStep = run.seconds <= 20 ? 5 : run.seconds <= 90 ? 10 : run.seconds <= 400 ? 60 : 300;
  const xTicks: number[] = [];
  for (let s = 0; s < run.seconds; s += secStep) xTicks.push(s);

  const peak = run.speed.reduce((best, v, i) => (v > run.speed[best] ? i : best), 0);
  const last = n - 1;
  const errorSeconds = run.errors.filter((e) => e > 0).length;

  const label = `Typing speed over ${run.seconds} seconds. Starts at ${run.speed[0]} words per minute, peaks at ${run.speed[peak]}, ends at ${run.speed[last]}. ${errorSeconds} ${errorSeconds === 1 ? 'point' : 'points'} with mistakes.`;

  const pick = (clientX: number) => {
    const box = svgRef.current?.getBoundingClientRect();
    if (!box) return;
    const px = ((clientX - box.left) / box.width) * W;
    setHover(Math.max(0, Math.min(n - 1, Math.round(((px - PAD.l) / (W - PAD.l - PAD.r)) * (n - 1)))));
  };

  const tipLeft = hover !== null ? (x(hover) / W) * 100 : 0;

  return (
    <div className="relative" data-run-graph>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={label}
        tabIndex={0}
        className="block h-auto w-full touch-pan-y overflow-visible rounded-md outline-none focus-visible:ring-1 focus-visible:ring-accent"
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setHover((h) => Math.min(n - 1, (h ?? -1) + 1));
          else if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? n) - 1));
          else if (e.key === 'Escape') setHover(null);
          else return;
          e.preventDefault();
        }}
        onBlur={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y(v)}
              y2={y(v)}
              stroke="var(--color-surface-border)"
              strokeWidth="1"
              strokeDasharray={v ? '2 5' : undefined}
              opacity={v ? 0.7 : 1}
            />
            <text x={PAD.l - 7} y={y(v) + 3} fill="var(--color-text-dim)" fontSize="9" textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {xTicks.map((s) => (
          <text
            key={s}
            x={PAD.l + (s / Math.max(1, run.seconds - 1)) * (W - PAD.l - PAD.r)}
            y={H - 8}
            fill="var(--color-text-dim)"
            fontSize="9"
            textAnchor="middle"
          >
            {s >= 120 && s % 60 === 0 ? `${s / 60}m` : `${s}s`}
          </text>
        ))}

        <path d={area} fill={`url(#${gradId})`} />
        <path d={line(run.raw)} fill="none" stroke="var(--color-text-dim)" strokeWidth="1.4" strokeDasharray="4 3" opacity="0.9" />
        <path d={line(run.speed)} fill="none" stroke="var(--color-accent)" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />

        {run.errors.map((e, i) =>
          e > 0 ? <circle key={i} cx={x(i)} cy={y(0) - 8} r={e > 1 ? 3.4 : 2.5} fill="var(--color-error)" /> : null,
        )}

        {/* the peak and the final speed */}
        <circle cx={x(peak)} cy={y(run.speed[peak])} r="3" fill="var(--color-accent)" />
        <text x={x(peak)} y={y(run.speed[peak]) - 8} fill="var(--color-text-bright)" fontSize="9" textAnchor="middle">
          {run.speed[peak]}
        </text>
        {peak !== last && (
          <>
            <circle cx={x(last)} cy={y(run.speed[last])} r="3" fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth="1.8" />
          </>
        )}

        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={H - PAD.b} stroke="var(--color-text-dim)" strokeWidth="1" opacity="0.6" />
            <circle cx={x(hover)} cy={y(run.speed[hover])} r="3.6" fill="var(--color-accent)" stroke="var(--color-surface)" strokeWidth="1.5" />
          </>
        )}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-surface-border bg-surface px-2 py-1 font-mono text-[11px] text-text-bright shadow-lg"
          style={{ left: `${Math.min(88, Math.max(12, tipLeft))}%` }}
          data-run-tip
        >
          {secAt(hover)}s · speed {run.speed[hover]} · raw {run.raw[hover]}
          {run.errors[hover] > 0 && <span className="text-error"> · {run.errors[hover]} {run.errors[hover] === 1 ? 'mistake' : 'mistakes'}</span>}
        </div>
      )}

      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-text-dim">
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-[3px] w-3.5 rounded bg-accent" /> speed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-0 w-3.5 border-t border-dashed border-text-dim" /> raw keystrokes
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-1.5 w-1.5 rounded-full bg-error" /> mistakes
        </span>
      </div>
    </div>
  );
}
