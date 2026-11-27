'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { getAccountSnapshot, parseAccount, subscribeAccount, type AccountInfo } from './account-state';

/** Who is logged in on this browser (null for a guest). Reads the hint after hydration only. */
export function useAccount(): AccountInfo | null {
  const raw = useSyncExternalStore(subscribeAccount, getAccountSnapshot, () => null);
  return useMemo(() => parseAccount(raw), [raw]);
}
