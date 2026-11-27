'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  clearAccount, getAccountSnapshot, isSyncReady, markSyncReady, parseAccount, subscribeAccount,
} from '@/lib/sync/account-state';
import { checkMergeChoice, startAutoSync, syncNow, type MergeChoice } from '@/lib/sync/client';

/**
 * Keeps a logged-in browser in step with its account, in the background.
 * Renders nothing, except in the rare case where this browser and the account both
 * already hold progress: then it asks once, with one button, before combining them.
 * Mounted only when accounts are switched on; a guest never reaches the server from here.
 */
export default function AccountSync() {
  const raw = useSyncExternalStore(subscribeAccount, getAccountSnapshot, () => null);
  const account = useMemo(() => parseAccount(raw), [raw]);
  const accountId = account?.id ?? null;
  const [choice, setChoice] = useState<MergeChoice | null>(null);
  // Bumped when the question is answered, so the effect starts the sync.
  const [answered, setAnswered] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!accountId) return;
    let cancelled = false;
    let stop: (() => void) | undefined;
    (async () => {
      if (!isSyncReady(accountId)) {
        const r = await checkMergeChoice();
        if (cancelled) return;
        if (r === 'signed-out') { clearAccount(); return; } // the cookie is gone: forget the hint
        if (r === 'unavailable' || r === 'error') return; // try again next page load; the site works meanwhile
        if (r.needed) { setChoice(r); return; }
        markSyncReady(accountId);
      }
      if (!cancelled) stop = startAutoSync((res) => { if (res === 'signed-out') clearAccount(); });
    })();
    return () => { cancelled = true; stop?.(); };
  }, [accountId, answered]);

  if (!accountId || !choice) return null;

  const combine = async () => {
    setBusy(true);
    const r = await syncNow();
    setBusy(false);
    if (r === 'signed-out') { clearAccount(); setChoice(null); return; }
    if (r !== 'synced') return; // stay open so they can try again
    markSyncReady(accountId);
    setChoice(null);
    setAnswered((n) => n + 1);
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 px-4" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="merge-title" className="w-full max-w-md rounded-xl border border-surface-border bg-surface-raised p-5 shadow-xl">
        <h2 id="merge-title" className="text-lg font-semibold text-text-bright">Keep which progress?</h2>
        <p className="mt-1 text-sm text-text-dim">
          This device and your account both have progress. We will combine them, and nothing is lost.
        </p>
        <div className="my-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Numbers title="This device" s={choice.local} />
          <Numbers title="Your account" s={choice.server} />
        </div>
        <button
          type="button"
          autoFocus
          disabled={busy}
          onClick={combine}
          className="w-full cursor-pointer rounded-lg border border-accent bg-accent-bg px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:brightness-110 disabled:cursor-wait disabled:opacity-50"
        >
          {busy ? 'Combining…' : 'Combine them'}
        </button>
        <p className="mt-3 text-xs text-text-dim">Best speed and finished lessons are kept.</p>
      </div>
    </div>
  );
}

function Numbers({ title, s }: { title: string; s: MergeChoice['local'] }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-text">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-bright">{title}</p>
      <p>{s.totalTests} speed {s.totalTests === 1 ? 'test' : 'tests'}</p>
      <p>Best {Math.round(s.bestWpm)} WPM</p>
      <p>Lessons {s.lessonsCompleted} of 34</p>
    </div>
  );
}
