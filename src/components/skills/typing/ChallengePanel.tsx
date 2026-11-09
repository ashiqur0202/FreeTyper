'use client';

import { useState } from 'react';
import { Check, Link2, Swords } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { buildChallengeUrl, compareScores, type Challenge } from './challengeLink';
import { isShareCancel } from './shareOutcome';

interface ChallengePanelProps {
  challenge: Challenge;
  /** The run just finished on this page, or null while the test has not been done. */
  run: { wpm: number; accuracy: number } | null;
}

/** The strip above the challenge test: the target before the run, the comparison and the share link after. */
export default function ChallengePanel({ challenge, run }: ChallengePanelProps) {
  const [copied, setCopied] = useState(false);
  const [manualUrl, setManualUrl] = useState<string | null>(null);
  const target = challenge.wpm !== null ? { wpm: challenge.wpm, accuracy: challenge.accuracy } : null;
  const result = run && target ? compareScores(run.wpm, target.wpm) : null;

  const send = async () => {
    if (!run) return;
    const url = buildChallengeUrl(window.location.origin, challenge.seed, run.wpm, run.accuracy);
    trackEvent('challenge_link_share', { has_target: target !== null });
    const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    if (coarse && typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: `I typed ${run.wpm} WPM. Can you beat it?`, url });
        return;
      } catch (e) {
        if (isShareCancel(e)) return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setManualUrl(url);
    }
  };

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg border border-surface-border bg-surface-raised/40 px-3 py-2 text-xs">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-text-dim">
        <Swords className="h-3.5 w-3.5 text-accent" />
        {result && run && target ? (
          <span className="text-text-bright">
            {result.verdict === 'win' && `You win by ${result.delta} WPM`}
            {result.verdict === 'tie' && 'Tied'}
            {result.verdict === 'behind' && `${result.delta} WPM short`}
            <span className="font-normal text-text-dim">
              {' '}
              · you {run.wpm} ({run.accuracy}%) vs {target.wpm}
              {target.accuracy !== null ? ` (${target.accuracy}%)` : ''}
            </span>
          </span>
        ) : run ? (
          <span className="text-text-bright">
            You typed {run.wpm} WPM · {run.accuracy}%
            <span className="font-normal text-text-dim"> · send the link and see if a friend can beat it</span>
          </span>
        ) : target ? (
          <span>
            <span className="text-text-bright">A friend typed {target.wpm} WPM</span>
            {target.accuracy !== null ? ` at ${target.accuracy}%` : ''} on this text in 60 s. Beat it.
          </span>
        ) : (
          <span>Type this text for 60 s, then send the link to a friend.</span>
        )}
      </p>
      {manualUrl ? (
        <input
          readOnly
          value={manualUrl}
          aria-label="Challenge link"
          onFocus={(e) => e.currentTarget.select()}
          className="w-full rounded-md border border-surface-border bg-surface px-2 py-1 font-mono text-[11px] text-text-bright sm:w-72"
        />
      ) : run && (
        <button
          type="button"
          onClick={send}
          className="inline-flex items-center gap-1 rounded-md border border-surface-border px-2.5 py-1 text-[11px] text-text-dim transition-colors hover:border-accent/40 hover:text-accent"
        >
          {copied ? <Check className="h-3 w-3 text-accent" /> : <Link2 className="h-3 w-3" />}
          <span aria-live="polite">{copied ? 'link copied' : 'challenge a friend'}</span>
        </button>
      )}
    </div>
  );
}
