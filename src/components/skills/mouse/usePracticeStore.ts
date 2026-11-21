'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { STORE_KEY, parseStore, type PracticeStore } from './practiceRules';

// What the Mouse practice page remembers in this browser (levels per skill, minutes today, the latest rounds).
// Read through useSyncExternalStore so the server render and the first client render both show the defaults.
// If the browser blocks storage, the data is kept in memory for this visit so levels still adapt.

const listeners = new Set<() => void>();
let memory: string | null = null;

function readRaw(): string | null {
  try {
    const v = localStorage.getItem(STORE_KEY);
    return v ?? memory;
  } catch {
    return memory;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORE_KEY) cb();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

export function usePracticeStore() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const store = useMemo(() => parseStore(raw), [raw]);

  /** The freshest saved data, for use inside timers and event handlers. */
  const current = useCallback(() => parseStore(readRaw()), []);

  const save = useCallback((next: PracticeStore) => {
    const text = JSON.stringify(next);
    try {
      localStorage.setItem(STORE_KEY, text);
      memory = null;
    } catch {
      /* storage full or blocked: the in-memory copy keeps this visit working */
      memory = text;
    }
    listeners.forEach((l) => l());
  }, []);

  return { store, current, save };
}
