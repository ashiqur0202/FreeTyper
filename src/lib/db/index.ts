import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
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
