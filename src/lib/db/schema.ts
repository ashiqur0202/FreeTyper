import { boolean, index, integer, jsonb, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core';

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
