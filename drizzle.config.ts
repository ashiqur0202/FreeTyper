import { defineConfig } from 'drizzle-kit';

// Run with DATABASE_URL set. The migrations in ./drizzle are applied at deploy, never during `next build`.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
});
