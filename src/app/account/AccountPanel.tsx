'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { clearAccount, saveAccount } from '@/lib/sync/account-state';

/**
 * The account page: who is logged in, log out, and (small, at the bottom) log out
 * everywhere and delete the account. Landing here after Google is also how this
 * browser learns it is logged in.
 */
export default function AccountPanel({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const { data, isPending, error } = authClient.useSession();
  const user = data?.user;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirm, setConfirm] = useState('');

  // The browser's hint follows the server's answer.
  useEffect(() => {
    if (user) saveAccount({ id: user.id, email: user.email });
    else if (!isPending && !error) clearAccount();
  }, [user, isPending, error]);

  const leave = async (everywhere: boolean) => {
    setBusy(true);
    setMessage('');
    try {
      if (everywhere) await authClient.revokeSessions();
      await authClient.signOut();
      clearAccount();
      router.push('/');
    } catch {
      setBusy(false);
      setMessage('Could not log out. Check your connection and try again.');
    }
  };

  const remove = async () => {
    setBusy(true);
    setMessage('');
    try {
      const r = await authClient.deleteUser();
      if (r?.error) throw new Error(r.error.message);
      clearAccount();
      router.push('/');
    } catch {
      setBusy(false);
      setMessage('Could not delete the account. If you logged in a while ago, log out, log in again, and then delete it.');
    }
  };

  const shell = 'mx-auto w-full max-w-sm rounded-xl border border-surface-border bg-surface-raised p-5';

  if (!enabled) {
    return (
      <div className={shell}>
        <h1 className="text-xl font-semibold text-text-bright">Account</h1>
        <p className="mt-2 text-sm text-text-dim">Accounts are not available right now. Everything else on FreeTyper works as usual.</p>
      </div>
    );
  }
  if (isPending) {
    return <div className={shell}><p className="text-sm text-text-dim">Checking your login…</p></div>;
  }
  if (!user) {
    return (
      <div className={shell}>
        <h1 className="text-xl font-semibold text-text-bright">Account</h1>
        <p className="mt-2 text-sm text-text-dim">{error ? 'Could not reach the server. Try again in a moment.' : 'You are not logged in.'}</p>
        {!error && <Link href="/login" className="mt-4 inline-block rounded-lg border border-accent bg-accent-bg px-4 py-2 text-sm font-semibold text-accent">Log in</Link>}
      </div>
    );
  }

  return (
    <div className={shell}>
      <h1 className="text-xl font-semibold text-text-bright">Account</h1>
      <p className="mt-1 break-all font-mono text-sm text-text-bright">{user.email}</p>
      <p className="mt-1 text-xs text-text-dim">Your progress is saved to your account. It also stays on this device after you log out.</p>

      <button
        type="button"
        disabled={busy}
        onClick={() => leave(false)}
        className="mt-5 w-full cursor-pointer rounded-lg border border-surface-border bg-surface px-4 py-2.5 text-sm font-medium text-text-bright transition-colors hover:border-text-dim disabled:cursor-wait disabled:opacity-60"
      >
        Log out
      </button>

      <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs">
        <button type="button" disabled={busy} onClick={() => leave(true)} className="cursor-pointer text-text-dim underline hover:text-text disabled:opacity-50">
          Log out everywhere
        </button>
        <button type="button" disabled={busy} onClick={() => setDeleteOpen((v) => !v)} aria-expanded={deleteOpen} className="cursor-pointer text-text-dim underline hover:text-text disabled:opacity-50">
          Delete account
        </button>
      </div>

      {deleteOpen && (
        <div className="mt-4 rounded-lg border border-error/60 p-3">
          <p className="text-sm text-text">This removes your account and the progress saved on our server. Progress on this device stays.</p>
          <label htmlFor="delete-confirm" className="mt-3 block text-xs text-text-dim">Type DELETE to confirm</label>
          <input
            id="delete-confirm"
            type="text"
            autoComplete="off"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-md border border-surface-border bg-surface px-3 py-2 text-sm text-text-bright"
          />
          <button
            type="button"
            disabled={busy || confirm !== 'DELETE'}
            onClick={remove}
            className="mt-3 w-full cursor-pointer rounded-lg border border-error px-4 py-2 text-sm font-medium text-error transition-colors hover:bg-error-bg disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete my account
          </button>
        </div>
      )}

      <p role="alert" className="mt-3 min-h-5 text-sm text-error">{message}</p>
    </div>
  );
}
