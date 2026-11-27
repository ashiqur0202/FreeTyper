// Applies the database migrations in ./drizzle. Runs when the site starts (npm start), never during `next build`.
//
// It can never take the site down: with no DATABASE_URL it does nothing, and if the database
// cannot be reached or a migration fails it says so in the log and lets the site start anyway
// (the site works as a guest site; only accounts need the database). Nothing secret is printed.
const url = process.env.DATABASE_URL;

if (!url) {
  console.log('[migrate] DATABASE_URL is not set: skipping (the site runs as a guest site).');
} else {
  try {
    const { Pool } = await import('pg');
    const { drizzle } = await import('drizzle-orm/node-postgres');
    const { migrate } = await import('drizzle-orm/node-postgres/migrator');
    const pool = new Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 10_000 });
    try {
      await migrate(drizzle(pool), { migrationsFolder: 'drizzle' });
      console.log('[migrate] database is up to date.');
    } finally {
      await pool.end();
    }
  } catch (e) {
    console.error('[migrate] FAILED, the site starts anyway but accounts may not work: ' + (e instanceof Error ? e.message : 'unknown error'));
  }
}
process.exit(0);
