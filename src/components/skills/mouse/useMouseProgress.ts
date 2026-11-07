'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import type { Device, StepId } from './mouseData';
import type { AimSize } from './aimScoring';
import { isNewBest } from './aimScoring';

// Saved state for the Mouse practice page: chosen device, finished steps per device,
// best Aim score per size. One localStorage key, read through useSyncExternalStore so the
// server render and the first client render both show the defaults (no hydration mismatch).

export type MouseProgress = {
  device: Device;
  done: Record<Device, StepId[]>;
  best: Partial<Record<AimSize, number>>;
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
    const list = (v: unknown): StepId[] => (Array.isArray(v) ? (v.filter((x) => typeof x === 'string') as StepId[]) : []);
    const best: Partial<Record<AimSize, number>> = {};
    for (const size of ['large', 'medium', 'small'] as AimSize[]) {
      const v = p.best?.[size];
      if (typeof v === 'number' && Number.isFinite(v) && v > 0) best[size] = v;
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

  const completeStep = useCallback((device: Device, step: StepId) => {
    const cur = parse(readRaw());
    if (cur.done[device].includes(step)) return;
    write({ ...cur, done: { ...cur.done, [device]: [...cur.done[device], step] } });
  }, []);

  /** Returns true when `score` beat the saved best for `size` (and saves it). */
  const recordBest = useCallback((size: AimSize, score: number): boolean => {
    const cur = parse(readRaw());
    if (!isNewBest(cur.best[size], score)) return false;
    write({ ...cur, best: { ...cur.best, [size]: score } });
    return true;
  }, []);

  return { progress, ready, setDevice, completeStep, recordBest };
}
