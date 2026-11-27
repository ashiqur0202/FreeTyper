// QA suite for accounts (see README.md in this folder): the real built server, the real /api routes,
// real signed login cookies, a real Postgres wire connection. Expects the rig running and the site
// started on http://localhost:3120 with the rig's settings. Run from the repo root: node scripts/qa-accounts/api.mjs
import { readFileSync } from 'node:fs';
import pg from 'pg';

const rig = JSON.parse(readFileSync(process.env.RIG_OUT || '.qa-rig.json', 'utf8'));
const SITE = 'http://localhost:3120';
const U = rig.users;
let pass = 0, fail = 0;
const fails = [];
const check = (name, cond, extra = '') => { if (cond) { pass++; console.log('PASS ' + name); } else { fail++; fails.push(name); console.log('FAIL ' + name + (extra ? '  -> ' + extra : '')); } };

const db = new pg.Client({ connectionString: rig.dbUrl });
await db.connect();
const q = async (sql, args = []) => (await db.query(sql, args)).rows;

const call = async (method, path, { user, cookie, origin = SITE, body, raw } = {}) => {
  const headers = {};
  const c = cookie ?? (user ? U[user].cookie : null);
  if (c) headers.Cookie = c;
  if (origin) headers.Origin = origin;
  if (body !== undefined || raw !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(SITE + path, { method, headers, body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined), redirect: 'manual' });
  const text = await res.text();
  let json = null; try { json = JSON.parse(text); } catch {}
  return { status: res.status, json, text, headers: res.headers };
};

const session = (id, date, wpm) => ({ id, date, wpm, accuracy: 95, correctChars: 250, incorrectChars: 5, totalChars: 255, duration: 60, mode: 'speed-test' });
const data = (sessions, over = {}) => ({
  schemaVersion: 1,
  progress: { sessions, achievements: [], keyStats: {}, streak: { current: 2, best: 2, lastPracticeDate: '2026-11-26' }, totalTypingTime: 60 * sessions.length, wordsTyped: 50, bestWpm: Math.max(...sessions.map((s) => s.wpm)), bestAccuracy: 95, ...over },
  course: { completed: ['lesson-1'], skipped: [], attempts: {} }, smart: null, daily: null,
});
const ids = (r) => (r.json?.data?.progress?.sessions ?? []).map((s) => s.id);

console.log('--- login session');
let r = await call('GET', '/api/auth/get-session');
check('get-session without a cookie: no session (null)', r.status === 200 && (r.json === null || r.text === 'null'));
r = await call('GET', '/api/auth/get-session', { user: 'sam' });
check('get-session with a real signed cookie: the right user', r.status === 200 && r.json?.user?.email === 'sam@example.com', r.text.slice(0, 80));
r = await call('GET', '/api/auth/get-session', { cookie: U.sam.cookie.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A')) });
check('get-session with a tampered cookie: no session', r.status === 200 && (r.json === null || r.text === 'null'));
r = await call('GET', '/api/auth/get-session', { cookie: rig.cookieName + '=forged.token' });
check('get-session with a forged cookie: no session', r.status === 200 && (r.json === null || r.text === 'null'));

console.log('--- /api/progress access rules');
r = await call('GET', '/api/progress');
check('GET without a login: 401 signed_out', r.status === 401 && r.json?.error === 'signed_out');
r = await call('GET', '/api/progress', { user: 'sam' });
check('GET as Sam (new account): empty, version 0, never cached', r.status === 200 && r.json.version === 0 && r.json.data.progress === null && /no-store/.test(r.headers.get('cache-control') ?? ''), r.text.slice(0, 100));
r = await call('PUT', '/api/progress', { user: 'sam', body: { data: data([session('x', 1, 50)]) }, origin: null });
check('PUT with no Origin header: 403', r.status === 403 && r.json?.error === 'bad_origin');
r = await call('PUT', '/api/progress', { user: 'sam', body: { data: data([session('x', 1, 50)]) }, origin: 'https://evil.example' });
check('PUT from another website: 403', r.status === 403);
r = await call('PUT', '/api/progress', { body: { data: data([session('x', 1, 50)]) } });
check('PUT without a login: 401', r.status === 401);
r = await call('DELETE', '/api/progress', { user: 'sam', origin: 'https://evil.example' });
check('DELETE from another website: 403', r.status === 403);
r = await call('DELETE', '/api/progress', { user: 'sam', origin: null });
check('DELETE with no Origin: 403', r.status === 403);
r = await call('GET', '/api/progress', { user: 'sam' });
check('nothing was saved by any refused request', r.json.version === 0 && r.json.data.progress === null);

console.log('--- saving and merging');
r = await call('PUT', '/api/progress', { user: 'sam', body: { data: data([session('p1', 1000, 62)]) } });
check('PUT from device A: saved, version 1', r.status === 200 && r.json.version === 1 && ids(r).join() === 'p1', r.text.slice(0, 100));
r = await call('PUT', '/api/progress', { user: 'sam', body: { data: data([session('p1', 1000, 62)]) } });
check('same data again: nothing changes, version stays 1', r.status === 200 && r.json.version === 1);
r = await call('PUT', '/api/progress', { user: 'sam', body: { data: data([session('l1', 2000, 71)], { bestWpm: 71 }) } });
check('PUT from device B: both devices kept, version 2', r.status === 200 && r.json.version === 2 && ids(r).join() === 'p1,l1');
check('merged best speed is the higher one', r.json.data.progress.bestWpm === 71);
r = await call('GET', '/api/progress', { user: 'sam' });
check('GET returns the combined progress', r.json.version === 2 && ids(r).join() === 'p1,l1');
let [row] = await q('select best_wpm, total_tests, lessons_completed, current_lesson, version, schema_version from user_progress where user_id = $1', [U.sam.id]);
check('summary columns in the database follow the data', row && row.best_wpm === 71 && row.total_tests === 2 && row.lessons_completed === 1 && row.current_lesson === 2 && row.version === 2, JSON.stringify(row));
r = await call('GET', '/api/progress', { user: 'alex' });
check('another account (Alex) sees none of it', r.json.version === 0 && r.json.data.progress === null);
r = await call('PUT', '/api/progress', { user: 'alex', body: { data: data([session('a1', 5000, 40)]) } });
r = await call('GET', '/api/progress', { user: 'sam' });
check("Alex's save did not touch Sam's data", ids(r).join() === 'p1,l1');

console.log('--- bad input');
r = await call('PUT', '/api/progress', { user: 'sam', raw: '{not json' });
check('invalid JSON: 400', r.status === 400 && r.json?.error === 'bad_json');
r = await call('PUT', '/api/progress', { user: 'sam', body: { data: { schemaVersion: 2 } } });
check('unknown data version: 400', r.status === 400 && r.json?.error === 'bad_data');
r = await call('PUT', '/api/progress', { user: 'sam', body: { nothing: true } });
check('no data field: 400', r.status === 400);
r = await call('PUT', '/api/progress', { user: 'sam', raw: JSON.stringify({ data: data([session('big', 9, 50)]), pad: 'x'.repeat(1_600_000) }) });
check('body over 1.5 MB: 413', r.status === 413 && r.json?.error === 'too_large');
const dirty = data([{ ...session('d1', 3000, 9999), typedText: 'my secret sentence', text: 'more secret' }], { bestWpm: 1e9 });
dirty.progress.typed = 'secret keystrokes';
r = await call('PUT', '/api/progress', { user: 'sam', body: { data: dirty } });
const stored = JSON.stringify((await call('GET', '/api/progress', { user: 'sam' })).json);
check('typed text and unknown fields never reach the account', r.status === 200 && !stored.includes('secret') && !stored.includes('typedText'));
check('absurd numbers are clamped (9999 wpm stored as 500)', r.json.data.progress.sessions.find((s) => s.id === 'd1')?.wpm === 500 && r.json.data.progress.bestWpm <= 500);
[row] = await q('select data::text as d from user_progress where user_id = $1', [U.sam.id]);
check('and the raw database row holds no typed text either', !row.d.includes('secret'));

console.log('--- concurrency (12 devices saving at the same moment)');
const burst = await Promise.all(Array.from({ length: 12 }, (_, i) => call('PUT', '/api/progress', { user: 'sam', body: { data: data([session('c' + i, 6000 + i, 30 + i)]) } })));
check('every simultaneous save succeeded', burst.every((x) => x.status === 200), burst.map((x) => x.status).join());
r = await call('GET', '/api/progress', { user: 'sam' });
const got = new Set(ids(r));
check('every device\'s data is in the account (no lost update)', Array.from({ length: 12 }, (_, i) => 'c' + i).every((id) => got.has(id)), [...got].join());

console.log('--- reset (the reset buttons)');
r = await call('DELETE', '/api/progress', { user: 'sam' });
check('DELETE as Sam: ok', r.status === 200 && r.json?.ok === true);
r = await call('GET', '/api/progress', { user: 'sam' });
check('Sam\'s saved progress is gone', r.json.version === 0 && r.json.data.progress === null);
r = await call('GET', '/api/progress', { user: 'alex' });
check("Alex's progress is untouched by Sam's reset", ids(r).join() === 'a1');
const [acct] = await q('select count(*)::int n from "user" where id = $1', [U.sam.id]);
check('the account itself stays after a reset', acct.n === 1);
r = await call('PUT', '/api/progress', { user: 'sam', body: { data: data([session('n1', 7000, 33)]) } });
check('saving after a reset starts clean', r.status === 200 && ids(r).join() === 'n1');

console.log('--- log out and delete account');
r = await call('POST', '/api/auth/sign-out', { user: 'carol', body: {} });
check('sign-out: ok', r.status === 200, r.text.slice(0, 80));
const setCookie = (r.headers.getSetCookie?.() ?? []).join(' | ');
check('sign-out clears the cookie (Max-Age=0)', /Max-Age=0/i.test(setCookie), setCookie.slice(0, 140));
r = await call('GET', '/api/progress', { user: 'carol' });
check('after sign-out the old cookie no longer works (401)', r.status === 401);
r = await call('GET', '/api/auth/get-session', { user: 'carol' });
check('and the session is gone from the database', r.status === 200 && (r.json === null || r.text === 'null'));
const [sess] = await q('select count(*)::int n from session where user_id = $1', [U.carol.id]);
check('session row deleted', sess.n === 0);

await call('PUT', '/api/progress', { user: 'dave', body: { data: data([session('dv1', 8000, 45)]) } });
await call('PUT', '/api/progress', { user: 'alex', body: { data: data([session('a2', 5500, 41)]) } });
r = await call('POST', '/api/auth/delete-user', { user: 'dave', body: {}, origin: 'https://evil.example' });
const [stillThere] = await q('select count(*)::int n from "user" where id = $1', [U.dave.id]);
check('delete account from another website is refused', r.status >= 400 && stillThere.n === 1, 'status ' + r.status);
r = await call('POST', '/api/auth/delete-user', { user: 'dave', body: {} });
check('delete account (own site, logged in): ok', r.status === 200, r.status + ' ' + r.text.slice(0, 120));
const gone = await q('select (select count(*)::int from "user" where id=$1) u, (select count(*)::int from session where user_id=$1) s, (select count(*)::int from account where user_id=$1) a, (select count(*)::int from user_progress where user_id=$1) p', [U.dave.id]);
check('deleted: user, sessions, Google link and saved progress are all gone', gone[0].u === 0 && gone[0].s === 0 && gone[0].a === 0 && gone[0].p === 0, JSON.stringify(gone[0]));
r = await call('GET', '/api/progress', { user: 'dave' });
check('deleted account: old cookie is refused', r.status === 401);
r = await call('GET', '/api/progress', { user: 'alex' });
check("other accounts keep their data after Dave's deletion", ids(r).includes('a1') && ids(r).includes('a2'));
const [tokens] = await q('select count(*)::int n from account where access_token is not null or refresh_token is not null or id_token is not null');
check('no Google sign-in tokens are stored anywhere', tokens.n === 0);

console.log('--- misc');
r = await call('GET', '/api/auth/unknown-thing');
check('an unknown auth path is a clean 404, not a crash', r.status === 404 || r.status === 400, String(r.status));
r = await fetch(SITE + '/login');
check('/login page: 200 and noindex', r.status === 200 && /noindex/.test(await r.text()));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) console.log('FAILED: ' + fails.join(' | '));
await db.end();
process.exit(fail ? 1 : 0);
