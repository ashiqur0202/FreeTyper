import { emptySyncData, parseSyncData, type SyncData } from './merge';

/**
 * Reads and writes the synced part of the progress kept in this browser.
 * Only these four keys travel; settings, texts and the like stay on the device.
 */
export const LOCAL_KEYS = {
  progress: 'freetyper-progress',
  course: 'freetyper-course-progress',
  smart: 'freetyper-smart-progress',
  daily: 'freetyper-daily-challenge',
} as const;

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // blocked or unreadable storage: treat as nothing saved
  }
}

/** What this browser holds, cleaned to the shape the server accepts. */
export function readLocal(): SyncData {
  return (
    parseSyncData({
      schemaVersion: 1,
      progress: readJson(LOCAL_KEYS.progress),
      course: readJson(LOCAL_KEYS.course),
      smart: readJson(LOCAL_KEYS.smart),
      daily: readJson(LOCAL_KEYS.daily),
    }) ?? emptySyncData()
  );
}

/** Puts the combined progress back into the browser. Returns true when something was written. */
export function writeLocal(data: SyncData): boolean {
  // Nothing to do when the browser already holds exactly this (keeps the sync from ever looping).
  if (JSON.stringify(readLocal()) === JSON.stringify(data)) return false;
  let wrote = false;
  for (const doc of ['progress', 'course', 'smart', 'daily'] as const) {
    const value = data[doc];
    if (!value) continue;
    try {
      localStorage.setItem(LOCAL_KEYS[doc], JSON.stringify(value));
      wrote = true;
    } catch {
      // storage full or blocked: the account still has it
    }
  }
  return wrote;
}
