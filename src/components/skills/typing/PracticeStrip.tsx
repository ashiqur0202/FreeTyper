import type { ReactNode } from 'react';

interface PracticeStripProps {
  /** The tab buttons (the kinds of text: mixed, sentences, quotes, facts, code, custom). */
  tabs: ReactNode;
  isRunning: boolean;
  /** Something before the speed, such as the time left in the speed test. */
  lead?: ReactNode;
  wpm: number;
  accuracy: number;
}

/** The top strip of the Practice box: tabs on the left, live speed and accuracy on the right. */
export default function PracticeStrip({ tabs, lead, isRunning, wpm, accuracy }: PracticeStripProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-surface-border bg-surface-raised px-3 py-1.5">
      {tabs}
      <div className="flex items-center gap-3 font-mono text-sm text-text">
        {lead}
        {lead && <span className="text-text-dim">·</span>}
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
