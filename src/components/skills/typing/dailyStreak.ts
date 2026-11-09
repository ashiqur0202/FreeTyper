export interface DailyDay {
  /** Best net WPM among counted runs that day. */
  wpm: number;
  accuracy: number;
  runs: number;
}

export type DailyStore = Record<string, DailyDay>;

/** Newest days kept in storage when there is no longer streak to protect. */
export const KEEP_DAYS = 60;

/** Today's challenge date, as UTC `YYYY-MM-DD`, so everyone gets the same passage at the same moment. */
export function utcDateKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

function previousDay(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return utcDateKey(d);
}

const counted = (day?: DailyDay) => !!day && day.wpm > 0;

/** The days of the streak ending today (or yesterday, if today has no counted run yet). */
function streakDays(store: DailyStore, today: string): string[] {
  const days: string[] = [];
  let day = counted(store[today]) ? today : previousDay(today);
  while (counted(store[day])) {
    days.push(day);
    day = previousDay(day);
  }
  return days;
}

/**
 * Days in a row with a counted run, ending today. If today has no counted run
 * yet, the streak still shows yesterday's chain so it is not lost until the day ends.
 */
export function dailyStreak(store: DailyStore, today: string): number {
  return streakDays(store, today).length;
}

/** Keep the newest `keep` days plus every day of the current streak, so a long streak is never cut. */
export function pruneDaily(store: DailyStore, today: string, keep: number = KEEP_DAYS): DailyStore {
  const protectedDays = new Set(streakDays(store, today));
  const newest = new Set(Object.keys(store).sort().slice(-keep));
  const out: DailyStore = {};
  for (const k of Object.keys(store)) if (newest.has(k) || protectedDays.has(k)) out[k] = store[k];
  return out;
}
