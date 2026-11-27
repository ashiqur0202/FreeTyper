/**
 * What this browser remembers about being logged in. It is only a hint, so the
 * site can show the right thing without asking the server on every page: the
 * server's cookie is what really decides, and a 401 clears this hint.
 *
 * Read it only after hydration (it lives in localStorage); `useSyncExternalStore`
 * with a null server snapshot does that.
 */

const ACCOUNT_KEY = 'freetyper-account';
/** The account this browser has already been joined with (the merge question was settled). */
const READY_KEY = 'freetyper-sync-ready';
const CHANGED_EVENT = 'freetyper-account-changed';

export interface AccountInfo {
  id: string;
  email: string;
}

export function parseAccount(raw: string | null): AccountInfo | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as { id?: unknown; email?: unknown };
    return typeof v.id === 'string' && v.id && typeof v.email === 'string' ? { id: v.id, email: v.email } : null;
  } catch {
    return null;
  }
}

/** The raw hint (a string compares by value, which `useSyncExternalStore` needs). */
export function getAccountSnapshot(): string | null {
  try {
    return localStorage.getItem(ACCOUNT_KEY);
  } catch {
    return null;
  }
}

export function subscribeAccount(onChange: () => void): () => void {
  window.addEventListener(CHANGED_EVENT, onChange);
  window.addEventListener('storage', onChange); // another tab logged in or out
  return () => {
    window.removeEventListener(CHANGED_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function saveAccount(info: AccountInfo) {
  try {
    const next = JSON.stringify({ id: info.id, email: info.email });
    if (localStorage.getItem(ACCOUNT_KEY) !== next) {
      localStorage.setItem(ACCOUNT_KEY, next);
      window.dispatchEvent(new Event(CHANGED_EVENT));
    }
  } catch {
    /* storage blocked: the hint is lost, login still works */
  }
}

export function clearAccount() {
  try {
    if (localStorage.getItem(ACCOUNT_KEY) !== null) {
      localStorage.removeItem(ACCOUNT_KEY);
      window.dispatchEvent(new Event(CHANGED_EVENT));
    }
  } catch {
    /* nothing to clear */
  }
}

export function isSyncReady(accountId: string): boolean {
  try {
    return localStorage.getItem(READY_KEY) === accountId;
  } catch {
    return false;
  }
}

export function markSyncReady(accountId: string) {
  try {
    localStorage.setItem(READY_KEY, accountId);
  } catch {
    /* asked again next time */
  }
}
