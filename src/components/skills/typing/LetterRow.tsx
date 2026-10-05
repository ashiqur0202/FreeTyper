'use client';

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

function tooltip(s: LetterScore): string {
  const name = s.key.toUpperCase();
  if (s.level === 'none') {
    return `${name}: ${s.presses < 1 ? 'no data yet' : `${s.presses} presses so far, needs 10`}. Click to drill this key.`;
  }
  const speed = s.ms !== null ? `, ${s.ms} ms` : '';
  return `${name}: ${LABELS[s.level]} — ${s.accuracy}% accurate${speed}, ${s.presses} presses. Click to drill this key.`;
}

interface LetterRowProps {
  scores: LetterScore[];
  /** The letter currently being drilled, if any. */
  activeKey: string | null;
  disabled?: boolean;
  onPick: (key: string) => void;
}

export default function LetterRow({ scores, activeKey, disabled, onPick }: LetterRowProps) {
  const { good, judged } = summarize(scores);

  return (
    <div className="mb-3" data-letter-row>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Your keys, colour-coded by accuracy and speed. Click a letter to drill it.">
          {scores.map((s) => {
            const active = activeKey === s.key;
            return (
              <button
                key={s.key}
                type="button"
                disabled={disabled}
                onClick={() => onPick(s.key)}
                title={tooltip(s)}
                aria-label={tooltip(s)}
                aria-pressed={active}
                data-letter={s.key}
                data-level={s.level}
                className={`relative flex h-8 w-6 flex-col items-center justify-center overflow-hidden rounded-md border font-mono text-[11px] uppercase text-text-bright transition-transform hover:scale-105 ${
                  active ? 'border-accent ring-1 ring-accent' : 'border-surface-border'
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
            );
          })}
        </div>
        <p className="text-[11px] tabular-nums text-text-dim" data-letter-summary>
          {judged === 0 ? 'no keys judged yet' : `${good} of ${judged} judged keys good`}
        </p>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-text-dim">
        {(['good', 'ok', 'weak', 'bad', 'none'] as LetterLevel[]).map((l) => (
          <span key={l} className="inline-flex items-center gap-1">
            <span className="h-2 w-3 rounded-sm" style={{ backgroundColor: COLORS[l] }} />
            {LABELS[l]}
          </span>
        ))}
        <span>· bar = how clean and fast the key is · click a letter to drill it</span>
      </div>
    </div>
  );
}
