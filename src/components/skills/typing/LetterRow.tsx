'use client';

import { useEffect, useRef, useState } from 'react';
import type { LetterLevel, LetterScore } from './letterStats';
import { summarize } from './letterStats';

/** Same palette as the error heatmap on the progress page. */
const COLORS: Record<LetterLevel, string> = {
  none: 'var(--color-surface-raised)',
  good: '#6b7c3a',
  ok: '#e2b714',
  weak: '#d97706',
  bad: '#c44250',
};

const LABELS: Record<LetterLevel, string> = {
  none: 'not enough data',
  good: 'good',
  ok: 'okay',
  weak: 'weak',
  bad: 'weakest',
};

/** How full the bar under the letter is: full for a clean letter, short for a weak one. */
function barPercent(s: LetterScore): number {
  if (s.level === 'none') return 0;
  return Math.max(12, Math.round((1 - Math.min(s.score, 0.9) / 0.9) * 100));
}

function tooltip(s: LetterScore, marked: boolean): string {
  const name = s.key.toUpperCase();
  const focus = marked ? ' Adaptive practice is on this key.' : '';
  if (s.level === 'none') {
    return `${name}: ${s.presses < 1 ? 'no data yet' : `${s.presses} presses so far, needs 10`}.${focus} Click to drill this key.`;
  }
  const speed = s.ms !== null ? `, ${s.ms} ms` : '';
  return `${name}: ${LABELS[s.level]} — ${s.accuracy}% accurate${speed}, ${s.presses} presses.${focus} Click to drill this key.`;
}

interface LetterRowProps {
  scores: LetterScore[];
  /** The key being drilled right now (picked by adaptive practice or by hand). */
  focusKey: string | null;
  /** True when the user picked the key, so a way back to adaptive is offered. */
  manual?: boolean;
  disabled?: boolean;
  onPick: (key: string) => void;
  onBack?: () => void;
}

export default function LetterRow({ scores, focusKey, manual, disabled, onPick, onBack }: LetterRowProps) {
  const { good, judged } = summarize(scores);
  const [helpOpen, setHelpOpen] = useState(false);
  const helpRef = useRef<HTMLDivElement>(null);

  // Close the legend on Escape or a click outside it.
  useEffect(() => {
    if (!helpOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHelpOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) setHelpOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onDown);
    };
  }, [helpOpen]);

  return (
    <div className="mb-3 pt-2" data-letter-row>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Your keys, colour-coded by accuracy and speed. The marked key is the one being drilled. Click a letter to drill it.">
          {scores.map((s) => {
            const marked = focusKey === s.key;
            return (
              <div key={s.key} className="relative">
                {marked && (
                  <span
                    aria-hidden
                    data-focus-marker
                    className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] leading-none text-accent"
                  >
                    ▼
                  </span>
                )}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onPick(s.key)}
                  title={tooltip(s, marked)}
                  aria-label={tooltip(s, marked)}
                  aria-pressed={marked}
                  data-letter={s.key}
                  data-level={s.level}
                  className={`relative flex h-8 w-[22px] flex-col items-center justify-center overflow-hidden rounded-md border font-mono text-[11px] uppercase text-text-bright transition-transform hover:scale-105 ${
                    marked ? 'border-accent ring-2 ring-accent' : 'border-surface-border'
                  } ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                  style={{
                    backgroundColor: s.level === 'none' ? COLORS.none : `${COLORS[s.level]}33`,
                  }}
                >
                  <span className="leading-none">{s.key}</span>
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-[3px]"
                    style={{ width: `${barPercent(s)}%`, backgroundColor: COLORS[s.level] }}
                  />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-text-dim">
          <span className="tabular-nums" data-letter-summary>
            {judged === 0 ? 'no data yet' : `${good}/${judged} good`}
          </span>
          {manual && onBack && (
            <button type="button" onClick={onBack} className="text-accent hover:underline">
              back to adaptive
            </button>
          )}
          <div className="relative" ref={helpRef}>
            <button
              type="button"
              onClick={() => setHelpOpen((o) => !o)}
              aria-expanded={helpOpen}
              aria-label="What do the colours mean?"
              title="What do the colours mean?"
              data-letter-help
              className="flex h-4 w-4 items-center justify-center rounded-full border border-surface-border text-[10px] leading-none text-text-dim transition-colors hover:border-accent hover:text-accent"
            >
              ?
            </button>
            {helpOpen && (
              <div
                role="dialog"
                aria-label="Letter row legend"
                data-letter-legend
                className="absolute left-0 top-6 z-20 w-64 rounded-lg border border-surface-border bg-surface p-3 text-[11px] leading-relaxed text-text shadow-xl"
              >
                <div className="space-y-1">
                  {(['good', 'ok', 'weak', 'bad', 'none'] as LetterLevel[]).map((l) => (
                    <p key={l} className="flex items-center gap-2">
                      <span className="h-2 w-4 shrink-0 rounded-sm" style={{ backgroundColor: COLORS[l] }} />
                      {LABELS[l]}
                    </p>
                  ))}
                </div>
                <p className="mt-2 text-text-dim">
                  The bar under a letter is how clean and fast the key is. Colours come from your accuracy and speed on that key.
                </p>
                <p className="mt-1 text-text-dim">
                  The marked key is the one being drilled. Adaptive practice moves on by itself when it is good. Click any letter to drill it by hand.
                </p>
                {judged > 0 && judged < scores.length && (
                  <p className="mt-1 text-text-dim">{scores.length - judged} {scores.length - judged === 1 ? 'key needs' : 'keys need'} more typing before {scores.length - judged === 1 ? 'it gets' : 'they get'} a colour.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
