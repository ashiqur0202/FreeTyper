'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useSyncExternalStore } from 'react';
import { LogIn } from 'lucide-react';
import { getAccountSnapshot, parseAccount, subscribeAccount } from '@/lib/sync/account-state';

/**
 * The login entry in the left sidebar, right under "settings".
 * Guest: "log in". Logged in: a letter circle and the email, leading to the account page.
 * The browser's hint is read after hydration only, so the server and the first paint always agree.
 */
export default function AccountEntry({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const raw = useSyncExternalStore(subscribeAccount, getAccountSnapshot, () => null);
  const account = useMemo(() => parseAccount(raw), [raw]);

  const href = account ? '/account' : '/login';
  const active = pathname === href;
  const row = `group flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
    active ? 'border-l-2 border-accent bg-accent-bg text-accent' : 'text-text-dim hover:bg-surface-raised hover:text-text'
  }`;

  return (
    <Link href={href} onClick={onNavigate} className={row} aria-label={account ? `Account: ${account.email}` : 'Log in'}>
      {account ? (
        <>
          <span
            aria-hidden="true"
            className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-accent bg-accent-bg font-mono text-[9px] font-bold uppercase text-accent"
          >
            {account.email[0]}
          </span>
          <span className="min-w-0 truncate">{account.email}</span>
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4 shrink-0" />
          <span>log in</span>
        </>
      )}
    </Link>
  );
}
