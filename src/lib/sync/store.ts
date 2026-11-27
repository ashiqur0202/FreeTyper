import { eq } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { userProgress } from '@/lib/db/schema';
import type * as schema from '@/lib/db/schema';
import { emptySyncData, mergeSyncData, parseSyncData, summarize, SYNC_SCHEMA_VERSION, type SyncData } from './merge';

/** Any Postgres handle from drizzle: the app's pool, or an in-memory one in tests. */
export type SyncDb = PgDatabase<PgQueryResultHKT, typeof schema>;

export interface Saved {
  data: SyncData;
  /** Goes up by one each time the stored data actually changes. */
  version: number;
}

const readRow = (row: { data: unknown } | undefined): SyncData => (row ? (parseSyncData(row.data) ?? emptySyncData()) : emptySyncData());

export async function loadProgress(db: SyncDb, userId: string): Promise<Saved> {
  const [row] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  return { data: readRow(row), version: row?.version ?? 0 };
}

/**
 * Adds what a device sends to what the account already holds, and returns the
 * result. The device never overwrites the account: both are merged, inside one
 * transaction that locks the row, so two devices saving at the same moment both
 * keep their changes. Saving the same thing twice changes nothing.
 */
export async function saveMerged(db: SyncDb, userId: string, incoming: SyncData): Promise<Saved> {
  return db.transaction(async (tx) => {
    // The row is created once, empty, so there is always one to lock.
    await tx.insert(userProgress).values({ userId, data: emptySyncData(), schemaVersion: SYNC_SCHEMA_VERSION }).onConflictDoNothing();
    const [row] = await tx.select().from(userProgress).where(eq(userProgress.userId, userId)).for('update');
    const stored = readRow(row);
    const merged = mergeSyncData(stored, incoming);
    if (JSON.stringify(merged) === JSON.stringify(stored) && row.version > 0) return { data: stored, version: row.version };
    const s = summarize(merged);
    const version = row.version + 1;
    await tx
      .update(userProgress)
      .set({
        data: merged,
        schemaVersion: SYNC_SCHEMA_VERSION,
        bestWpm: s.bestWpm,
        totalTests: s.totalTests,
        lessonsCompleted: s.lessonsCompleted,
        currentLesson: s.currentLesson,
        dailyStreak: s.dailyStreak,
        lastActiveDate: s.lastActiveDate,
        version,
        updatedAt: new Date(),
      })
      .where(eq(userProgress.userId, userId));
    return { data: merged, version };
  });
}
