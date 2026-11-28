# Accounts runbook (FreeTyper)

Written 2026-11-27, the day optional accounts went live (master `cc09d0a`). Read this first for anything about login, sync, the database, backups or releases that touch them. The build history and every finding are in `docs/superpowers/plans/2026-11-27-accounts-and-sync.md`; this page is the short, operational version. No secrets here: only names and places.

## 1. What exists

- **Optional login, Google only.** Guest mode is the default and never depends on the server. Logging in only adds: progress follows you to other devices, and comes back after clearing the browser. No password, no email login yet.
- **Synced data (four browser keys):** `freetyper-progress`, `freetyper-course-progress`, `freetyper-smart-progress`, `freetyper-daily-challenge`. Not synced: settings, texts, speed log, mouse progress, certificate name. Never typed text.
- **Rules that must not break:** merging never lowers a number and gives the same answer in either order; a reset also removes the account copy first; the site must keep working with the server or the database down.

## 2. Where things live

| Thing | Where |
|---|---|
| Live site | https://freetyper.com (non-www; `www` redirects) |
| Hosting | Hetzner CX23 (Nuremberg), one server shared with other projects; managed by Coolify at http://178.104.135.111:8000 (no domain, no HTTPS) |
| FreeTyper app | Coolify, project Web, application `FreeTyper` (Nixpacks; Start Command empty, so it runs `npm run start` = `node scripts/migrate.mjs && next start`) |
| Database | Coolify, project Web, `freetyper-db`: PostgreSQL 18, database and user `freetyper`, private (no public port), loopback port `127.0.0.1:5433` for DBeaver only |
| Login keys | Google Cloud project `FreeTyper` (id `freetyper`): Google Auth Platform, External, In production, web client "FreeTyper website", redirect `https://freetyper.com/api/auth/callback/google` (and a localhost one) |
| App settings (Coolify environment, names only) | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (= https://freetyper.com), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`; all marked build time and run time |
| Mail DNS (Cloudflare) | SPF with the server IP, DMARC `p=none`, reverse DNS `mail.freetyper.com` (Hetzner). **There is no mail server.** |
| Backups | Coolify scheduled backup on `freetyper-db`: daily (UTC), keep 14 / 30 days / 2 GB, on the server disk only |
| Real-server QA kit | `scripts/qa-accounts/` (README inside) |
| Design demos (private) | accounts flow https://claude.ai/artifact/GRTyT7tamgzNhnXVMg8wZa ; login page options https://claude.ai/artifact/9SGvQAiqcnpP9b9nCv1EJx |

Code map: `src/lib/auth.ts` (Better Auth, Google, no tokens stored), `src/lib/db/` (schema, lazy pool, `dbReady()`), `src/lib/sync/` (merge, store, local, client, account state), `src/app/api/auth/[...all]`, `src/app/api/progress` (GET, PUT, DELETE), `src/app/login`, `src/app/account`, `src/components/layout/AccountEntry.tsx` and `AccountSync.tsx`, migration in `drizzle/`.

## 3. Releasing

1. Work on a branch. Run: `npx tsc --noEmit`, `npm run check:text`, ALL test scripts (`test-sync-merge`, `test-sync-store`, `test-sync-client`, `test-accounts-db`, `test-challenge`, `test-practice-summary`, `test-seeded-text`, `test-text-generator`, `test-ladder`, `test-number-row`, `test-audit-fixes`, `test-certificate`, `test-typing-target`; each as `node --import ./scripts/register-ts.mjs scripts/NAME.mjs`), lint on the changed files, `npm run build` (retry once on the known `next/font/google` fetch error).
2. Anything touching login, sync or the database: also run the real-server QA kit (47 checks) and click through the browser flows with a real session cookie.
3. Test BOTH builds: guest (set the five variables to empty on the command line) and deployment-like (set them). A local `.env.local` with placeholders switches login on in local builds too.
4. Fast-forward master, push, wait about 7 minutes, then check the live pages and the application log for `[migrate] database is up to date.`.
5. **Rollback:** Coolify, FreeTyper, Deployments, pick the previous deployment, Redeploy. The database keeps its tables (migrations only add).

## 4. Looking at the database

DBeaver: SSH tunnel (host 178.104.135.111, port 22, user root, public key with the PRIVATE key file) then PostgreSQL host `localhost` port `5433`, database and user `freetyper`, password from the Coolify database page, SSL off; set the connection to Production and Read-only. Or use Coolify, `freetyper-db`, Terminal, `psql -U freetyper -d freetyper`. Never switch on "Make it publicly available". The tables hold real emails: avoid screenshots. Handy queries: `select email, created_at from "user";` `select user_id, best_wpm, total_tests, version, updated_at from user_progress;` `select count(*) from session where expires_at > now();`.

## 5. Backups and restore

Daily dump on the server disk (Coolify, `freetyper-db`, Backups: list, Download). **Restore has not been tested yet**: do it once real data exists (download a dump, `pg_restore` into a throwaway Postgres, check the five tables). Off-server copy is NOT set up by decision (no spending): see the decisions list. Because the site is local-first, logged-in devices keep their own copy and refill an empty server at their next sync.

## 6. If something breaks

- **Login says "not available":** the five variables are missing at BUILD time (the entry is decided when the site is built); fix in Coolify and redeploy.
- **Database down:** the site stays up (checked: every page 200); accounts answer an error and clients retry after a minute; the log shows one `[db] migration check failed` line (30 second cooldown). Check `freetyper-db` in Coolify.
- **`State not found` lines in the log:** a Google return trip arrived with a one-time code already used (a repeated callback); harmless unless login fails every time.
- **Someone asks for deletion:** they can use Delete account on /account; otherwise delete their row in `user` (sessions, link and progress cascade).

## 7. Decisions (keep)

- Guest first, login optional and quiet ("login under settings in the left sidebar", Google button, nothing pushed in people's faces).
- Postgres with jsonb (full progress JSON plus summary columns); not MongoDB, not Firebase. Drizzle plus Better Auth.
- No password login, ever. Google tokens are never stored. Account deletion removes everything of theirs.
- Merge question only when both the device and the account already hold progress; otherwise silent.
- Own-origin check on every write; typed text never leaves the browser.
- No paid off-server backup for now (Ashiqur, 2026-11-27: "i don't want to spend money now"); revisit before many people sign up (Cloudflare R2 needs a subscription on the card on file, $0 due, billed only above free limits).
- Demo first, build after approval; all QA done by Claude with the tools.

## 7b. Leaderboard (added 2026-11-28)
- Tables: `typist` (public identity: username, status active/deleted, `archive` jsonb kept on deletion), `score` (one row per counted run, `hidden` flag), `score_report`. Look at them in DBeaver like the others.
- **Moderation by hand:** reports are in `score_report` (join to `score`). To remove a score from every board: `update score set hidden = true where id = '...'`. To change an offensive username: `update typist set username = '...' where id = '...'` (unique, lower case, 3 to 20 characters).
- **Deleted accounts:** the `typist` row stays with `status = 'deleted'`, `user_id` null and the person's data in `archive`. To erase on request: `update typist set archive = null where id = '...'` (the username and scores can stay or be removed too, as agreed with the person).
- Rules and numbers live in `src/lib/leaderboard/rules.ts`. The boards are computed on request from `score` (cached 30 s at the edge); nothing is stored per board.
- Release: the two migrations run by themselves at start (additive only). Rollback: the old image still works because it never reads the new tables; leave the tables in place.

## 8. Ideas and open items (for betterment)

- Email code (OTP) and magic link: needs a way to send mail (install Stalwart on the server or use an outside sending service); add a `rate_limit` table for the 15 minute lock and 60 second resend wait; mail DNS is already prepared; test inbox placement for Gmail, Yahoo and Outlook first.
- Sync mouse progress; "log out and clear this device" for shared computers; sync settings; leaderboards or public profiles only if wanted (new tables, privacy and abuse questions).
- Off-server backup and a restore test; two-factor authentication on the Hetzner account (the console shows a warning).
- Look at the log's `State not found` pattern after more real logins; re-read the privacy page against real behaviour (IP address and browser description are stored in session rows).
- GA4: look at the new `source` and `kind` fields on practice events a few days after release; other older guides may still mention "adaptive tab" or old text types.
- The 360 px sideways overflow of 3 px from the footer links row (existing, not from accounts).
- Coolify's real start command was never read (a terminal command in the live container was refused by the safety system); the app does not depend on it (`dbReady()` creates the tables on the first account request).
