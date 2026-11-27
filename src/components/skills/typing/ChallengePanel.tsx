'use client';

import { Swords } from 'lucide-react';
import { buildChallengeUrl, compareScores, type Challenge } from './challengeLink';
import ChallengeSendButton from './ChallengeSendButton';

interface ChallengePanelProps {
  challenge: Challenge;
  /** The run just finished on this page, or null while the test has not been done. */
  run: { wpm: number; accuracy: number } | null;
}

/** The strip above the challenge test: the target before the run, the comparison and the share link after. */
export default function ChallengePanel({ challenge, run }: ChallengePanelProps) {
  const target = challenge.wpm !== null ? { wpm: challenge.wpm, accuracy: challenge.accuracy } : null;
  const result = run && target ? compareScores(run.wpm, target.wpm) : null;
  const length = challenge.seconds >= 120 ? `${challenge.seconds / 60} min` : `${challenge.seconds} s`;

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
            {target.accuracy !== null ? ` at ${target.accuracy}%` : ''} on this text in {length}. Beat it.
          </span>
        ) : (
          <span>Type this text for {length}, then send the link to a friend.</span>
        )}
      </p>
      {run && (
        <ChallengeSendButton
          wpm={run.wpm}
          source="challenge_page"
          hasTarget={target !== null}
          buildUrl={() =>
            buildChallengeUrl(window.location.origin, challenge.seed, run.wpm, run.accuracy, challenge.mode, challenge.seconds, challenge.level, challenge.gen)
          }
        />
      )}
    </div>
  );
}
