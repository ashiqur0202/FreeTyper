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
  source: 'result_card' | 'challenge_page' | 'history_row' | 'finished_box' | 'sidebar';
  /** True when the run was compared with a friend's score first. */
  hasTarget?: boolean;
  /** Highlight it, for example after a new best. */
  emphasis?: boolean;
  /** A bigger button, for the box shown when a test ends. */
  large?: boolean;
  /** Full width, left aligned, with a second line of small text (the right sidebar). */
  wide?: boolean;
  /** The small second line of the `wide` button. */
  hint?: string;
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
  wide = false,
  hint,
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

  const icon = wide ? 'h-3.5 w-3.5 flex-none' : large ? 'size-[1em]' : 'h-3 w-3';
  const label = copied ? 'link copied' : (children ?? 'challenge a friend');
  const size = wide
    ? 'w-full justify-start gap-2 rounded-lg border px-2.5 py-2 text-left text-[12px]'
    : large
      ? 'justify-center gap-[0.5em] rounded-[0.5em] border px-[1em] py-[0.625em] text-[0.875em] max-sm:basis-full'
      : 'justify-center gap-1 rounded-md border px-2.5 py-1 text-[11px]';

  return (
    <button
      type="button"
      onClick={send}
      className={`inline-flex items-center transition-colors hover:border-accent/40 hover:text-accent ${size} ${
        emphasis ? 'border-accent/40 bg-accent-bg font-medium text-accent' : 'border-surface-border text-text-dim'
      }`}
    >
      {copied ? <Check className={`${icon} text-accent`} /> : <Link2 className={icon} />}
      {wide ? (
        <span className="leading-snug" aria-live="polite">
          {label}
          {hint && !copied && <span className="block text-[10.5px] font-normal text-text-dim">{hint}</span>}
        </span>
      ) : (
        <span aria-live="polite">{label}</span>
      )}
    </button>
  );
}
