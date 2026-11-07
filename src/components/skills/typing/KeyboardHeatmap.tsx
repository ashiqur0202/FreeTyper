'use client';

import LaptopKeyboard, { type KeyLook } from './LaptopKeyboard';
import { SHIFTED } from './guideLayout';
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

  // A symbol key counts both what it types plain and with Shift ("/" and "?").
  const statsFor = (key: string) => {
    let total = 0;
    let correct = 0;
    for (const k of [key, SHIFTED[key]]) {
      const st = k ? progress.keyStats[k] : undefined;
      if (st) {
        total += st.totalPresses;
        correct += st.correctPresses;
      }
    }
    return { total, correct };
  };

  const getErrorRate = (key: string): number | null => {
    const { total, correct } = statsFor(key);
    if (total < 3) return null;
    return (total - correct) / total;
  };

  const getTooltip = (key: string): string => {
    const name = key === ' ' ? 'Space' : key.toUpperCase();
    const { total, correct } = statsFor(key);
    if (total < 1) return `${name}: no data yet`;
    return `${name}: ${Math.round((correct / total) * 100)}% accuracy · ${total} presses`;
  };

  const look = (id: string): KeyLook => {
    if (id.length > 1) return { color: 'var(--color-surface-border)' }; // Shift, Enter ... are not tracked
    const rate = getErrorRate(id);
    return { color: rate === null ? 'var(--color-surface-border)' : heatStyle(rate).bg, title: getTooltip(id) };
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

      <LaptopKeyboard keyH={40} width="100%" fingerColors={false} look={look} className="lk-heat max-w-3xl" />
      <p className="mt-2 text-center text-[11px] text-text-dim">
        Hover a key for accuracy · needs 3+ presses to color
      </p>
    </div>
  );
}
