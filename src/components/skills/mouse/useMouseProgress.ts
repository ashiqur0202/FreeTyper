'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { Device } from './mouseData';
import { isNewBest } from './aimScoring';

// Saved state for the Mouse practice page: chosen device, finished steps per device,
// best Aim score per size. One localStorage key, read through useSyncExternalStore so the
// server render and the first client render both show the defaults (no hydration mismatch).

export type MouseProgress = {
  device: Device;
  /** Ids of finished drills from every level (the 7 Level 1 steps use their old ids). */
  done: Record<Device, string[]>;
  /** Best Aim score by key: "large" (classic), "moving-large", "shrinking". */
  best: Record<string, number>;
};

const STORAGE_KEY = 'freetyper-mouse';

const DEFAULT: MouseProgress = { device: 'mouse', done: { mouse: [], trackpad: [] }, best: {} };

const listeners = new Set<() => void>();

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

function parse(raw: string | null): MouseProgress {
  if (!raw) return DEFAULT;
  try {
    const p = JSON.parse(raw) as Partial<MouseProgress>;
    const device: Device = p.device === 'trackpad' ? 'trackpad' : 'mouse';
    const list = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
    const best: Record<string, number> = {};
    for (const [key, v] of Object.entries(p.best ?? {})) {
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) best[key] = v;
    }
    return { device, done: { mouse: list(p.done?.mouse), trackpad: list(p.done?.trackpad) }, best };
  } catch {
    return DEFAULT;
  }
}

function write(next: MouseProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked: the page still works for this visit */
  }
  listeners.forEach((l) => l());
}

const subscribeNoop = () => () => {};

/** False on the server and during hydration, true afterwards. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

export function useMouseProgress() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const progress = useMemo(() => parse(raw), [raw]);
  const ready = useIsClient();

  const setDevice = useCallback((device: Device) => {
    write({ ...parse(readRaw()), device });
  }, []);

  const completeStep = useCallback((device: Device, step: string) => {
    const cur = parse(readRaw());
    if (cur.done[device].includes(step)) return;
    write({ ...cur, done: { ...cur.done, [device]: [...cur.done[device], step] } });
  }, []);

  /** Returns true when `score` beat the saved best for `key` (and saves it). */
  const recordBest = useCallback((key: string, score: number): boolean => {
    const cur = parse(readRaw());
    if (!isNewBest(cur.best[key], score)) return false;
    write({ ...cur, best: { ...cur.best, [key]: score } });
    return true;
  }, []);

  return { progress, ready, setDevice, completeStep, recordBest };
}
