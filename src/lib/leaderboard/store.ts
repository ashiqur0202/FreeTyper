import { randomUUID } from 'node:crypto';
import { and, eq, gte, sql } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import { score, scoreReport, typist } from '@/lib/db/schema';
import type * as schema from '@/lib/db/schema';
import {
  checkScore, checkUsername, countsForBoard, MAX_REPORTS_PER_DAY, MAX_SCORES_PER_HOUR, periodStart, suggestUsername, timingPossible,
  type Period, type ScoreInput,
} from './rules';

/** Any Postgres handle from drizzle: the app's pool, or an in-memory one in tests. */
export type LbDb = PgDatabase<PgQueryResultHKT, typeof schema>;
export type Typist = typeof typist.$inferSelect;

const isUniqueViolation = (e: unknown): boolean => {
  const x = e as { code?: string; cause?: { code?: string } } | null;
  return x?.code === '23505' || x?.cause?.code === '23505';
};

// ---------------------------------------------------------------- typists

export async function getTypist(db: LbDb, userId: string): Promise<Typist | null> {
  const [row] = await db.select().from(typist).where(eq(typist.userId, userId));
  return row ?? null;
}

/**
 * The typist row for a logged-in person, made the first time it is needed with a username taken
 * from their Google name (a number is added when that one is taken). Safe to call from two places at once.
 */
export async function ensureTypist(db: LbDb, user: { id: string; name: string }): Promise<Typist> {
  const have = await getTypist(db, user.id);
  if (have) return have;
  const base = suggestUsername(user.name);
  for (let attempt = 0; attempt < 12; attempt++) {
    const suffix = attempt === 0 ? '' : String(Math.floor(Math.random() * 9000) + 1000);
    const username = (base.slice(0, 20 - suffix.length) + suffix).toLowerCase();
    // A name that is reserved or invalid (very rare) just gets a number too.
    if (!checkUsername(username).ok) continue;
    try {
      const [row] = await db.insert(typist).values({ id: randomUUID(), userId: user.id, username }).returning();
      return row;
    } catch (e) {
      if (!isUniqueViolation(e)) throw e;
      const raced = await getTypist(db, user.id); // another request made it first
      if (raced) return raced;
    }
  }
  throw new Error('could not make a username');
}

export type UsernameResult = { ok: true; typist: Typist } | { ok: false; reason: 'bad_username' | 'reserved' | 'taken' };

export async function setUsername(db: LbDb, user: { id: string; name: string }, raw: unknown): Promise<UsernameResult> {
  const checked = checkUsername(raw);
  if (!checked.ok) return checked;
  const me = await ensureTypist(db, user);
  try {
    const [row] = await db.update(typist).set({ username: checked.value }).where(eq(typist.id, me.id)).returning();
    return { ok: true, typist: row };
  } catch (e) {
    if (isUniqueViolation(e)) return { ok: false, reason: 'taken' };
    throw e;
  }
}

/** Called just before an account is deleted: the typist stays, marked deleted. (The database then clears user_id.) */
export async function markTypistDeleted(db: LbDb, userId: string, now = new Date()): Promise<void> {
  await db.update(typist).set({ status: 'deleted', deletedAt: now }).where(eq(typist.userId, userId));
}

// ---------------------------------------------------------------- scores

export type SubmitResult =
  | { status: 'counted' }
  | { status: 'duplicate' }
  | { status: 'ignored'; reason: 'below_accuracy' }
  | { status: 'rejected'; reason: string };

export async function submitScore(db: LbDb, user: { id: string; name: string }, raw: unknown, now = new Date()): Promise<SubmitResult> {
  const checked = checkScore(raw);
  if (!checked.ok) return { status: 'rejected', reason: checked.reason };
  const s: ScoreInput = checked.value;
  if (!countsForBoard(s)) return { status: 'ignored', reason: 'below_accuracy' };

  const me = await ensureTypist(db, user);
  // One person's submissions go through one at a time, so a burst of requests at the same instant
  // cannot all pass the timing and rate checks before any is saved. The lock does NOT make anyone
  // wait (a waiting request would hold a database connection and could starve other people):
  // if another submission of the same person is in progress, this one is turned away at once.
  return db.transaction(async (tx) => {
    const got = await tx.execute(sql`select pg_try_advisory_xact_lock(hashtext(${'score:' + me.id})) as ok`);
    const free = ((got as { rows?: { ok: boolean }[] }).rows ?? (got as unknown as { ok: boolean }[]))[0]?.ok;
    if (!free) return { status: 'rejected', reason: 'busy' } as SubmitResult;
    // The same run sent again (a retry, a double send) is simply a duplicate, whatever the timing.
    const [again] = await tx.select({ id: score.id }).from(score).where(and(eq(score.typistId, me.id), eq(score.runId, s.runId))).limit(1);
    if (again) return { status: 'duplicate' } as SubmitResult;
    const [last] = await tx.select({ at: score.createdAt }).from(score).where(eq(score.typistId, me.id)).orderBy(sql`${score.createdAt} desc`).limit(1);
    if (!timingPossible(last ? last.at.getTime() : null, now.getTime(), s.seconds)) return { status: 'rejected', reason: 'too_fast' } as SubmitResult;
    const [{ n }] = await tx
      .select({ n: sql<number>`count(*)::int` })
      .from(score)
      .where(and(eq(score.typistId, me.id), gte(score.createdAt, new Date(now.getTime() - 3_600_000))));
    if (n >= MAX_SCORES_PER_HOUR) return { status: 'rejected', reason: 'rate_limited' } as SubmitResult;

    const inserted = await tx
      .insert(score)
      .values({ id: randomUUID(), typistId: me.id, runId: s.runId, wpm: s.wpm, accuracy: s.accuracy, seconds: s.seconds, textMode: s.textMode, textLevel: s.textLevel, createdAt: now })
      .onConflictDoNothing()
      .returning({ id: score.id });
    return (inserted.length ? { status: 'counted' } : { status: 'duplicate' }) as SubmitResult;
  });
}

// ---------------------------------------------------------------- boards

export interface BoardFilters {
  period: Period;
  top: number;
  /** A test length in seconds, or null for all. */
  length: number | null;
  /** A text type (or 'daily' or 'challenge'), or null for all. */
  mode: string | null;
  now?: Date;
}

export interface BoardEntry {
  rank: number;
  scoreId: string;
  username: string;
  /** The Google name, only for active accounts; null once the account is deleted. */
  name: string | null;
  deleted: boolean;
  wpm: number;
  accuracy: number;
  seconds: number;
  textMode: string;
  textLevel: number;
  at: string;
}

/** Each person's best score inside the window and filters, ranked: fastest first, earlier first on a tie. */
function rankedSql(f: BoardFilters) {
  const start = periodStart(f.period, f.now ?? new Date());
  return sql`
    with best as (
      select distinct on (s.typist_id) s.id, s.typist_id, s.wpm, s.accuracy, s.seconds, s.text_mode, s.text_level, s.created_at
      from score s
      where s.hidden = false
        ${start ? sql`and s.created_at >= ${start.toISOString()}::timestamptz` : sql``}
        ${f.length ? sql`and s.seconds = ${f.length}::int` : sql``}
        ${f.mode ? sql`and s.text_mode = ${f.mode}::text` : sql``}
      order by s.typist_id, s.wpm desc, s.created_at asc
    ), ranked as (
      select b.*, row_number() over (order by b.wpm desc, b.created_at asc) as rank from best b
    )`;
}

type Row = {
  rank: number; score_id: string; wpm: number; accuracy: number; seconds: number; text_mode: string; text_level: number;
  created_at: Date | string; username: string; status: string; user_id: string | null; display_name: string | null; typist_id?: string;
};

const rowsOf = (res: unknown): Row[] => ((res as { rows?: Row[] }).rows ?? (res as Row[]));

const toEntry = (r: Row): BoardEntry => {
  const deleted = r.status === 'deleted' || r.user_id === null;
  return {
    rank: Number(r.rank), scoreId: r.score_id, username: r.username, name: deleted ? null : r.display_name, deleted,
    wpm: r.wpm, accuracy: r.accuracy, seconds: r.seconds, textMode: r.text_mode, textLevel: r.text_level,
    at: new Date(r.created_at).toISOString(),
  };
};

export async function leaderboard(db: LbDb, f: BoardFilters): Promise<BoardEntry[]> {
  const res = await db.execute(sql`${rankedSql(f)}
    select r.rank::int as rank, r.id as score_id, r.wpm, r.accuracy, r.seconds, r.text_mode, r.text_level, r.created_at,
           t.username, t.status, t.user_id, u.name as display_name
    from ranked r join typist t on t.id = r.typist_id left join "user" u on u.id = t.user_id
    order by r.rank limit ${f.top}`);
  return rowsOf(res).map(toEntry);
}

/** Where one logged-in person stands on a board (null when they have no counted score in it). */
export async function myPosition(db: LbDb, userId: string, f: BoardFilters): Promise<BoardEntry | null> {
  const res = await db.execute(sql`${rankedSql(f)}
    select r.rank::int as rank, r.id as score_id, r.wpm, r.accuracy, r.seconds, r.text_mode, r.text_level, r.created_at,
           t.username, t.status, t.user_id, u.name as display_name
    from ranked r join typist t on t.id = r.typist_id left join "user" u on u.id = t.user_id
    where t.user_id = ${userId}`);
  const [row] = rowsOf(res);
  return row ? toEntry(row) : null;
}

// ---------------------------------------------------------------- reports

export type ReportResult = { ok: true } | { ok: false; reason: 'bad_input' | 'not_found' | 'rate_limited' };

export async function reportScore(db: LbDb, user: { id: string; name: string }, scoreId: unknown, reason: unknown, now = new Date()): Promise<ReportResult> {
  if (typeof scoreId !== 'string' || scoreId.length > 64 || typeof reason !== 'string') return { ok: false, reason: 'bad_input' };
  const text = reason.trim().slice(0, 300);
  if (!text) return { ok: false, reason: 'bad_input' };
  const [target] = await db.select({ id: score.id }).from(score).where(eq(score.id, scoreId));
  if (!target) return { ok: false, reason: 'not_found' };
  const me = await ensureTypist(db, user);
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(scoreReport)
    .where(and(eq(scoreReport.reporterTypistId, me.id), gte(scoreReport.createdAt, new Date(now.getTime() - 86_400_000))));
  if (n >= MAX_REPORTS_PER_DAY) return { ok: false, reason: 'rate_limited' };
  await db.insert(scoreReport).values({ id: randomUUID(), scoreId, reporterTypistId: me.id, reason: text, createdAt: now });
  return { ok: true };
}
