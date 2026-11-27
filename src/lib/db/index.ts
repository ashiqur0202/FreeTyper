import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { join } from 'node:path';
import { Pool } from 'pg';
import * as schema from './schema';

/**
 * The database connection, created only when something asks for it, never at
 * import or build time (the site must build and run as a guest with no database).
 */

export type Db = NodePgDatabase<typeof schema>;

let cached: { pool: Pool; db: Db } | null = null;

/** True when the server has the settings to talk to the database. */
export function databaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

export function getDb(): Db {
  if (cached) return cached.db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  // A small pool: the one server also runs the site and other projects.
  const pool = new Pool({ connectionString: url, max: 5, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000 });
  cached = { pool, db: drizzle(pool, { schema }) };
  return cached.db;
}

let migrating: Promise<void> | null = null;
let lastFailure = 0;

/**
 * Makes sure the tables exist before the first account request is served: the same
 * migrations scripts/migrate.mjs applies when the site starts, checked once per process.
 * A second line of defence, so accounts work however the site is started (a start script,
 * or the standalone server). Never throws: a failure is logged, the request that follows
 * simply gets an error, and the check is tried again after 30 seconds.
 */
export function dbReady(): Promise<void> {
  if (migrating) return migrating;
  if (Date.now() - lastFailure < 30_000) return Promise.resolve();
  migrating = (async () => {
    const { migrate } = await import('drizzle-orm/node-postgres/migrator');
    await migrate(getDb(), { migrationsFolder: join(process.cwd(), 'drizzle') });
  })().catch((e) => {
    migrating = null;
    lastFailure = Date.now();
    console.error('[db] migration check failed: ' + (e instanceof Error ? e.message : 'unknown error'));
  });
  return migrating;
}
