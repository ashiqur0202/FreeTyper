'use client';

import { useState, type ReactNode } from 'react';
import { Check, Link2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { isShareCancel } from './shareOutcome';

interface ChallengeSendButtonProps {
  /** The finished run, sent as "I typed N WPM" in the share sheet. */
  wpm: number;
  /** Builds the link when the button is pressed (it needs `window.location.origin`). */
  buildUrl: () => string;
  /** Where the button is: the speed-test result card or the challenge page. */
  source: 'result_card' | 'challenge_page' | 'history_row' | 'finished_box';
  /** True when the run was compared with a friend's score first. */
  hasTarget?: boolean;
  /** Highlight it, for example after a new best. */
  emphasis?: boolean;
  /** A bigger button, for the box shown when a test ends. */
  large?: boolean;
  children?: ReactNode;
}

/**
 * Sends a challenge link: the system share sheet on touch devices, else the clipboard,
 * else a text box with the link to copy by hand. One press, no second run.
 */
export default function ChallengeSendButton({
  wpm,
  buildUrl,
  source,
  hasTarget = false,
  emphasis = true,
  large = false,
  children,
}: ChallengeSendButtonProps) {
  const [copied, setCopied] = useState(false);
  const [manualUrl, setManualUrl] = useState<string | null>(null);

  const send = async () => {
    const url = buildUrl();
    trackEvent('challenge_link_share', { has_target: hasTarget, source });
    const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    if (coarse && typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: `I typed ${wpm} WPM. Can you beat it?`, url });
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

  if (manualUrl) {
    return (
      <input
        readOnly
        value={manualUrl}
        aria-label="Challenge link"
        onFocus={(e) => e.currentTarget.select()}
        className="w-full rounded-md border border-surface-border bg-surface px-2 py-1 font-mono text-[11px] text-text-bright sm:w-72"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={send}
      className={`inline-flex items-center justify-center transition-colors hover:border-accent/40 hover:text-accent ${
        large ? 'gap-[0.5em] rounded-[0.5em] border px-[1em] py-[0.625em] text-[0.875em] max-sm:basis-full' : 'gap-1 rounded-md border px-2.5 py-1 text-[11px]'
      } ${emphasis ? 'border-accent/40 bg-accent-bg font-medium text-accent' : 'border-surface-border text-text-dim'}`}
    >
      {copied ? <Check className={`${large ? 'size-[1em]' : 'h-3 w-3'} text-accent`} /> : <Link2 className={large ? 'size-[1em]' : 'h-3 w-3'} />}
      <span aria-live="polite">{copied ? 'link copied' : (children ?? 'challenge a friend')}</span>
    </button>
  );
}
