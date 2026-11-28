import { sql } from 'drizzle-orm';
import { boolean, index, integer, jsonb, pgTable, real, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

/**
 * Tables for the optional account. The first four (user, session, account,
 * verification) are the ones Better Auth expects; user_progress is ours.
 * Nothing here ever holds typed text or keystrokes.
 */

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (t) => [index('session_user_id_idx').on(t.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('account_user_id_idx').on(t.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('verification_identifier_idx').on(t.identifier)],
);

/**
 * One row per account. The summary columns are what a profile page or a
 * leaderboard would read; `data` holds the same progress JSON the site keeps in
 * localStorage (numbers, dates and key names only). `version` goes up on every
 * save so two devices cannot silently overwrite each other; `schemaVersion`
 * is inside the JSON's own format.
 */
export const userProgress = pgTable('user_progress', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  bestWpm: real('best_wpm').notNull().default(0),
  totalTests: integer('total_tests').notNull().default(0),
  lessonsCompleted: integer('lessons_completed').notNull().default(0),
  currentLesson: integer('current_lesson').notNull().default(1),
  dailyStreak: integer('daily_streak').notNull().default(0),
  lastActiveDate: text('last_active_date'),
  data: jsonb('data').notNull().default({}),
  schemaVersion: integer('schema_version').notNull().default(1),
  version: integer('version').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * The public face of an account on the leaderboard: a username, and a status.
 * It is NOT removed when the account is deleted: user_id goes to null (the
 * database does that), status becomes 'deleted', and the leaderboard shows the
 * username and scores marked "account deleted". The person's email, Google
 * name, Google link, sessions and saved progress are deleted with the user row.
 */
export const typist = pgTable(
  'typist',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .unique()
      .references(() => user.id, { onDelete: 'set null' }),
    username: text('username').notNull(),
    status: text('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    // Kept when the account is deleted: email, name, picture, Google id, join date, saved progress. Never shown publicly.
    archive: jsonb('archive'),
  },
  // Usernames are unique whatever the capital letters (the app stores them in lower case).
  (t) => [uniqueIndex('typist_username_lower_idx').on(sql`lower(${t.username})`)],
);

/**
 * One row per counted speed test (at least 95 % accuracy, plausible speed). Numbers and labels
 * only: never typed text. The time is the server's own clock. Scores stay when the account is
 * deleted (they belong to the typist row, which stays).
 */
export const score = pgTable(
  'score',
  {
    id: text('id').primaryKey(),
    typistId: text('typist_id')
      .notNull()
      .references(() => typist.id),
    /** The run's id in the browser, so the same run sent twice counts once. */
    runId: text('run_id').notNull(),
    wpm: real('wpm').notNull(),
    accuracy: real('accuracy').notNull(),
    seconds: integer('seconds').notNull(),
    textMode: text('text_mode').notNull(),
    textLevel: integer('text_level').notNull().default(0),
    /** Set by hand (DBeaver) to take an entry off every board without deleting it. */
    hidden: boolean('hidden').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('score_run_idx').on(t.typistId, t.runId),
    index('score_created_idx').on(t.createdAt),
    index('score_wpm_idx').on(t.wpm),
  ],
);

/** "Report this entry" from a logged-in typist. Looked at by hand. */
export const scoreReport = pgTable('score_report', {
  id: text('id').primaryKey(),
  scoreId: text('score_id')
    .notNull()
    .references(() => score.id, { onDelete: 'cascade' }),
  reporterTypistId: text('reporter_typist_id').references(() => typist.id, { onDelete: 'set null' }),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
