# Accounts QA rig

A real-server check for the account features, with no Docker and nothing installed on your machine.
It runs the real built site against an in-memory Postgres that speaks the real wire protocol
(PGlite plus pglite-socket), with the real migrations and real signed login cookies. Google's own
login screen is the only part it cannot run.

Use it before any release that touches login, sync or the database (for example the email code
release). The quick unit tests (`npm run test:sync`, `test:sync-store`, `test:sync-client`,
`test:accounts`) do not need it.

## Setup once per machine (deliberately NOT a project dependency)

    npm install --no-save @electric-sql/pglite-socket@0.3.0

Use exactly 0.3.0: it matches the PGlite version the project pins (0.6.0), and it keeps these extra packages out of package.json and out of the production build. `npm install` or `npm ci` removes it again.

## Steps (from the repo root, three terminals or background jobs)

1. Start the database and create four users:

       node --import ./scripts/register-ts.mjs scripts/qa-accounts/rig.mjs

   It writes `.qa-rig.json` (git-ignored; throwaway tokens for that in-memory database only).

2. Build and start the site with the rig's settings. The secret must be the rig's, the URL must
   be port 3120. Force the variables on the command line so a local `.env.local` cannot change them:

       DATABASE_URL=postgres://postgres:postgres@127.0.0.1:54329/postgres \
       BETTER_AUTH_SECRET=qa-rig-secret-qa-rig-secret-qa-rig-secret-123 \
       BETTER_AUTH_URL=http://localhost:3120 GOOGLE_CLIENT_ID=qa GOOGLE_CLIENT_SECRET=qa \
       npm run build

   then the same variables with `PORT=3120 npm start`.

3. Run the suite (47 checks: sessions and forged cookies, access rules, saving and merging,
   bad input, 12 simultaneous saves, reset, log out, delete account, no typed text stored):

       node scripts/qa-accounts/api.mjs

4. For the browser: set a cookie from `.qa-rig.json` on localhost:3120 (name, then `=`, then value,
   with `; path=/; Secure`) and open /account.

Extra: `scripts/qa-accounts/empty-db.mjs` starts an UNmigrated database on port 54330. Start the site
with plain `next start` against it and make any /api/progress request: the five tables appear (the
site's own self-migration).

Stop everything with Ctrl+C or by killing the node processes on ports 3120, 54329 and 54330.
