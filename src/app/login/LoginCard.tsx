'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { authClient } from '@/lib/auth-client';
import { getAccountSnapshot, parseAccount, subscribeAccount } from '@/lib/sync/account-state';

/**
 * Log in. Optional: FreeTyper works the same without it. Google today; an email
 * code and a link follow in a later release.
 */
export default function LoginCard({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const raw = useSyncExternalStore(subscribeAccount, getAccountSnapshot, () => null);
  const account = useMemo(() => parseAccount(raw), [raw]);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');

  // Already logged in on this browser: nothing to do here.
  useEffect(() => {
    if (account) router.replace('/account');
  }, [account, router]);

  const google = async () => {
    setBusy(true);
    setProblem('');
    try {
      const r = await authClient.signIn.social({ provider: 'google', callbackURL: '/account' });
      if (r?.error) throw new Error(r.error.message);
      // On success the browser is sent to Google; nothing more to do here.
    } catch {
      setBusy(false);
      setProblem('Could not start the login. Check your connection and try again.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm rounded-xl border border-surface-border bg-surface-raised p-5">
      <h1 className="text-xl font-semibold text-text-bright">Log in</h1>
      <p className="mt-1 text-sm text-text-dim">Save your progress and use it on any device.</p>

      {enabled ? (
        <>
          <button
            type="button"
            onClick={google}
            disabled={busy}
            className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-surface-border bg-surface px-4 py-2.5 text-sm font-medium text-text-bright transition-colors hover:border-text-dim disabled:cursor-wait disabled:opacity-60"
          >
            <svg aria-hidden="true" viewBox="0 0 18 18" className="h-4 w-4">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.65 8.65 0 0 0 9 0 9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
            {busy ? 'Opening Google…' : 'Continue with Google'}
          </button>
          <p role="alert" className="mt-3 min-h-5 text-sm text-error">{problem}</p>
        </>
      ) : (
        <p className="mt-5 rounded-lg border border-surface-border bg-surface px-3 py-2.5 text-sm text-text-dim">
          Login is not available right now. Everything else on FreeTyper works as usual.
        </p>
      )}

      <p className="mt-3 text-xs text-text-dim">
        No password. You can keep using FreeTyper without logging in. See the <Link href="/privacy" className="text-accent underline">privacy page</Link> for what an account stores.
      </p>
    </div>
  );
}
