'use client';

import { keyboardRows } from './typingData';
import { useTypingProgress } from './useTypingProgress';

function heatStyle(errorRate: number | null): { bg: string; label: string } {
  if (errorRate === null) {
    return { bg: 'var(--color-surface-raised)', label: 'no data' };
  }
  if (errorRate > 0.15) return { bg: '#c44250', label: 'high errors' };
  if (errorRate > 0.1) return { bg: '#d97706', label: 'elevated' };
  if (errorRate > 0.05) return { bg: '#e2b714', label: 'mild' };
  return { bg: '#6b7c3a', label: 'clean' };
}

export default function KeyboardHeatmap() {
  const { progress } = useTypingProgress();

  const getErrorRate = (key: string): number | null => {
    const stats = progress.keyStats[key.toLowerCase()];
    if (!stats || stats.totalPresses < 3) return null;
    return stats.incorrectPresses / stats.totalPresses;
  };

  const getTooltip = (key: string): string => {
    const stats = progress.keyStats[key.toLowerCase()];
    if (!stats || stats.totalPresses < 1) return `${key === ' ' ? 'Space' : key.toUpperCase()}: no data yet`;
    const acc = Math.round((stats.correctPresses / stats.totalPresses) * 100);
    return `${key === ' ' ? 'Space' : key.toUpperCase()}: ${acc}% accuracy · ${stats.totalPresses} presses`;
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-text-bright">Error heatmap</h3>
        <div className="flex items-center gap-2 text-[10px] text-text-dim">
          <span>clean</span>
          <div className="flex gap-0.5">
            <div className="h-2.5 w-5 rounded-sm" style={{ background: '#6b7c3a' }} />
            <div className="h-2.5 w-5 rounded-sm" style={{ background: '#e2b714' }} />
            <div className="h-2.5 w-5 rounded-sm" style={{ background: '#d97706' }} />
            <div className="h-2.5 w-5 rounded-sm" style={{ background: '#c44250' }} />
          </div>
          <span>errors</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="mx-auto space-y-1" style={{ minWidth: '32rem' }}>
          {keyboardRows.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1">
              {row.map((key) => {
                const rate = getErrorRate(key);
                const { bg } = heatStyle(rate);
                return (
                  <div
                    key={key}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-surface-border font-mono text-[11px] text-text-bright transition-transform hover:scale-105"
                    style={{ backgroundColor: bg }}
                    title={getTooltip(key)}
                  >
                    {key.toUpperCase()}
                  </div>
                );
              })}
            </div>
          ))}
          <div className="flex justify-center">
            <div
              className="flex h-9 w-64 items-center justify-center rounded-md border border-surface-border font-mono text-[11px] text-text-bright"
              style={{ backgroundColor: heatStyle(getErrorRate(' ')).bg }}
              title={getTooltip(' ')}
            >
              space
            </div>
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-text-dim">
        Hover a key for accuracy · needs 3+ presses to color
      </p>
    </div>
  );
}
