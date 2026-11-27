import type { ReactNode } from 'react';

interface PracticeStripProps {
  /** The tab buttons (adaptive, quotes, facts, code). */
  tabs: ReactNode;
  isRunning: boolean;
  wpm: number;
  accuracy: number;
}

/** The top strip of the Practice box: tabs on the left, live speed and accuracy on the right. */
export default function PracticeStrip({ tabs, isRunning, wpm, accuracy }: PracticeStripProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-surface-border bg-surface-raised px-3 py-1.5">
      {tabs}
      <div className="flex items-center gap-3 font-mono text-sm text-text">
        <span className="tabular-nums text-text-bright">
          {isRunning ? wpm : '--'}
          <span className="text-text"> wpm</span>
        </span>
        <span className="text-text-dim">·</span>
        <span className="tabular-nums text-text-bright">
          {isRunning ? accuracy : '--'}
          <span className="text-text">%</span>
        </span>
      </div>
    </div>
  );
}
