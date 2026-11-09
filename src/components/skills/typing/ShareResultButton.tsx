'use client';

import { useState } from 'react';
import { Check, Download, Share2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import type { TypingSession } from './types';
import { shareResult, shareSourceOf, type ShareOutcome } from './shareImage';

const LABEL: Record<ShareOutcome | 'idle' | 'busy', string> = {
  idle: 'share',
  busy: 'making image…',
  shared: 'shared',
  cancelled: 'share',
  'image-copied': 'image copied',
  downloaded: 'image saved',
  'text-copied': 'text copied',
  failed: 'could not share',
};

export default function ShareResultButton({ run }: { run: TypingSession }) {
  const [state, setState] = useState<ShareOutcome | 'idle' | 'busy'>('idle');

  const onClick = async () => {
    if (state === 'busy') return;
    // Counted when the button is used, even if the browser blocks the clipboard.
    trackEvent('share_result', { source: shareSourceOf(run.mode) });
    setState('busy');
    const outcome = await shareResult(run);
    if (outcome === 'cancelled') {
      setState('idle');
      return;
    }
    setState(outcome);
    setTimeout(() => setState('idle'), 2500);
  };

  const done = state !== 'idle' && state !== 'busy' && state !== 'failed';
  const Icon = done ? (state === 'downloaded' ? Download : Check) : Share2;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === 'busy'}
      title="Share this result as a picture"
      className="inline-flex items-center gap-1 rounded-md border border-surface-border px-2.5 py-1 text-[11px] text-text-dim transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-60"
    >
      <Icon className={`h-3 w-3 ${done ? 'text-accent' : ''}`} />
      <span aria-live="polite">{LABEL[state]}</span>
    </button>
  );
}
