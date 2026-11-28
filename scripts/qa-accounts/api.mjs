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

console.log('--- leaderboard');
const run = (id, wpm, over = {}) => ({ runId: id, wpm, accuracy: 97, seconds: 60, textMode: 'standard', textLevel: 3, ...over });
const entries = (x) => x.json?.entries ?? [];
r = await call('GET', '/api/leaderboard');
check('the public board needs no login, and may be cached for a short time', r.status === 200 && Array.isArray(r.json?.entries) && /s-maxage=30/.test(r.headers.get('cache-control') ?? ''), r.headers.get('cache-control') ?? '');
check('an empty board is empty (not an error)', r.json.entries.length === 0);
r = await call('GET', "/api/leaderboard?period=%27%3Bdrop%20table%20score%3B--&top=1000&mode=x%27&length=-5");
check('hostile query parameters fall back to safe defaults and break nothing', r.status === 200 && r.json.period === 'daily' && r.json.top === 10 && r.json.mode === null && r.json.length === null);
r = await call('POST', '/api/scores', { body: run('x1', 70) });
check('submitting a score without a login: 401', r.status === 401);
r = await call('POST', '/api/scores', { user: 'sam', body: run('x1', 70), origin: 'https://evil.example' });
check('submitting from another website: 403', r.status === 403);
r = await call('POST', '/api/scores', { user: 'sam', raw: '{nope' });
check('a garbled body: 400', r.status === 400);
r = await call('POST', '/api/scores', { user: 'sam', body: run('big', 70, { pad: 'x'.repeat(5000) }) });
check('an oversized body: 413', r.status === 413);
r = await call('POST', '/api/scores', { user: 'sam', body: run('imp', 400) });
check('an impossible speed (400 WPM): 422 implausible, nothing stored', r.status === 422 && r.json?.reason === 'implausible');
r = await call('POST', '/api/scores', { user: 'sam', body: run('nr', 70, { textMode: 'number_row_digits' }) });
check('the number row test does not count: 422', r.status === 422);
r = await call('POST', '/api/scores', { user: 'sam', body: 'a string' });
check('a body that is not an object: refused, no crash', r.status === 422 || r.status === 400);
r = await call('POST', '/api/scores', { user: 'sam', body: run('low', 80, { accuracy: 94 }) });
check('below 95 percent accuracy: accepted but ignored (it still counts for progress, not the board)', r.status === 200 && r.json?.status === 'ignored');
r = await call('GET', '/api/leaderboard');
check('so far nothing is on the board', r.json.entries.length === 0);
r = await call('POST', '/api/scores', { user: 'sam', body: run('short1', 120, { seconds: 30 }) });
check('a 30 second run is valid but not ranked (ignored, too_short)', r.status === 200 && r.json?.status === 'ignored' && r.json?.reason === 'too_short', r.text);
r = await call('GET', '/api/leaderboard?length=30');
check('there is no 30 second board (an unknown length falls back to all, and the short run is on none)', r.status === 200 && r.json.length === null && entries(r).length === 0);

const first = { sam: run('s1', 72), alex: run('a1', 85, { seconds: 180, textMode: 'sentences', textLevel: 4 }), carol: run('c1', 64, { seconds: 120, textMode: 'words', textLevel: 2 }), dave: run('d1', 90, { textMode: 'quotes', textLevel: 3 }) };
for (const who of Object.keys(first)) {
  r = await call('POST', '/api/scores', { user: who, body: first[who] });
  check('a real score from ' + who + ' counts', r.status === 200 && r.json?.status === 'counted', r.text.slice(0, 80));
}
r = await call('POST', '/api/scores', { user: 'sam', body: first.sam });
check('the same run sent again is a duplicate, not a second entry', r.status === 200 && r.json?.status === 'duplicate');
check('and it returns the id of the first one (the result link uses it)', typeof r.json?.scoreId === 'string' && r.json.scoreId.length === 36, r.text);
r = await call('POST', '/api/scores', { user: 'sam', body: run('s2', 73) });
check('a second 60 s test right away is impossible: 422 too_fast', r.status === 422 && r.json?.reason === 'too_fast');
// Parallel bursts are covered by the in-process store test. The QA rig serves every connection from ONE PGlite session, so truly parallel transactions interleave there (not like real Postgres); send them back to back instead.
const burst2 = [];
for (let i = 0; i < 6; i++) burst2.push(await call('POST', '/api/scores', { user: 'alex', body: run('burst' + i, 80, { seconds: 60 }) }));
check('rapid repeated submissions: no server errors, none counted this soon after the last test', burst2.every((x) => x.status !== 500) && burst2.every((x) => x.json?.status !== 'counted'), burst2.map((x) => x.status).join());

r = await call('GET', '/api/leaderboard');
let rows = entries(r);
check('the board is ranked fastest first: dave 90, alex 85, sam 72, carol 64', rows.map((e) => e.wpm).join() === '90,85,72,64' && rows.map((e) => e.rank).join() === '1,2,3,4', rows.map((e) => e.wpm).join());
check('each entry shows the username and the Google name of an active account', rows[0].username === 'dave' && rows[0].name === 'Dave' && rows[0].deleted === false, JSON.stringify(rows[0]));
check('an entry carries exactly the public fields (no email, no user id, no tokens)', Object.keys(rows[0]).sort().join() === 'accuracy,at,deleted,name,rank,scoreId,seconds,textLevel,textMode,username,wpm' && !r.text.includes('@example.com') && !r.text.includes(U.sam.id) && !r.text.includes(U.dave.id), Object.keys(rows[0]).join());
for (const [q, want, label] of [['length=180', 'alex', 'a test length (3 min)'], ['mode=quotes', 'dave', 'a text type (quotes)'], ['length=120', 'carol', 'a test length (2 min)'], ['length=60&mode=standard', 'sam', 'length and type together']]) {
  r = await call('GET', '/api/leaderboard?' + q);
  check('filter by ' + label, entries(r).length === 1 && entries(r)[0].username === want, JSON.stringify(entries(r).map((e) => e.username)));
}
r = await call('GET', '/api/leaderboard?mode=daily');
check('a filter nobody fits gives an empty board', entries(r).length === 0);
for (const period of ['daily', 'weekly', 'monthly', 'lifetime']) {
  r = await call('GET', '/api/leaderboard?period=' + period + '&top=50');
  check(period + ' board (top 50) shows all four typists', r.status === 200 && entries(r).length === 4);
}
r = await call('GET', '/api/leaderboard?top=10');
check('top 10 never returns more than 10', entries(r).length <= 10);

console.log('--- result popup: rank block and shared result');
r = await call('GET', '/api/leaderboard/card');
check('the rank block needs a login (401)', r.status === 401);
r = await call('GET', '/api/leaderboard/card', { user: 'sam' });
check('rank block for Sam: three boards, never cached, nothing private', r.status === 200 && /no-store/.test(r.headers.get('cache-control') ?? '') && r.json?.today && r.json?.week && r.json?.all && !r.text.includes('@example.com') && !r.text.includes(U.sam.id), r.text.slice(0, 160));
check('he is ranked #3 today with a row for the typist above and below', r.json.today.rank === 3 && r.json.today.rows.length === 3 && r.json.today.rows.filter((x) => x.me).length === 1 && r.json.today.total === 4, JSON.stringify(r.json.today));
check('the rows carry only rank, username and speed', Object.keys(r.json.today.rows[0]).sort().join() === 'me,rank,username,wpm');
r = await call('GET', '/api/leaderboard/card', { user: 'carol' });
check('Carol (last of four) has no row below her', r.json.today.rank === 4 && r.json.today.rows.length === 2, JSON.stringify(r.json.today));
const sharedId = entries(await call('GET', '/api/leaderboard')).find((e) => e.username === 'sam').scoreId;
r = await call('GET', '/r/' + sharedId);
check('the public result page opens without a login and shows only public things', r.status === 200 && r.text.includes('72') && r.text.includes('sam') && !r.text.includes('@example.com') && !r.text.includes(U.sam.id), String(r.status));
check('and it is kept out of search results', /noindex/.test(r.text));
check('and it carries a preview picture for chat apps', r.text.includes('/r/' + sharedId + '/og') && /twitter:card" content="summary_large_image/.test(r.text));
r = await call('GET', '/r/' + sharedId + '?p=today');
check('with a period, the page shows the current rank', r.status === 200 && r.text.includes('#3'), String(r.status));
const picture = await fetch(SITE + '/r/' + sharedId + '/og?p=today');
const bytes = new Uint8Array(await picture.arrayBuffer());
check('the preview picture is a real PNG', picture.status === 200 && picture.headers.get('content-type') === 'image/png' && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes.length > 5000, picture.status + ' ' + bytes.length);
r = await call('GET', '/r/not-a-real-id');
check('an unknown result id: 404', r.status === 404);
r = await call('GET', "/r/00000000-0000-0000-0000-000000000000?p='%3Bdrop");
check('an unknown id with a hostile period: 404, no crash', r.status === 404);
check('the picture of an unknown id: 404', (await fetch(SITE + '/r/00000000-0000-0000-0000-000000000000/og')).status === 404);
await q('update score set hidden = true where id = $1', [sharedId]);
check('a hidden score has no public page', (await call('GET', '/r/' + sharedId)).status === 404);
await q('update score set hidden = false where id = $1', [sharedId]);

console.log('--- leaderboard username');
r = await call('GET', '/api/typist');
check('username: needs a login (401)', r.status === 401);
r = await call('GET', '/api/typist', { user: 'sam' });
check('username starts as the Google name in plain letters', r.status === 200 && r.json?.username === 'sam' && r.json?.name === 'Sam', r.text);
r = await call('PUT', '/api/typist', { user: 'sam', body: { username: 'Sam_Speed' }, origin: null });
check('changing it from outside our site: 403', r.status === 403);
r = await call('PUT', '/api/typist', { user: 'sam', body: { username: 'Sam_Speed' } });
check('changing it works and is stored in lower case', r.status === 200 && r.json?.username === 'sam_speed');
r = await call('PUT', '/api/typist', { user: 'alex', body: { username: 'SAM_SPEED' } });
check('taking someone else\'s username, whatever the capital letters: 409', r.status === 409);
for (const bad of ['a', 'admin', 'bad name', '<script>', 'x'.repeat(21), 123]) {
  r = await call('PUT', '/api/typist', { user: 'alex', body: { username: bad } });
  check('invalid or reserved username refused (400): ' + String(bad).slice(0, 12), r.status === 400, String(r.status));
}
r = await call('GET', '/api/leaderboard');
check('the board shows the new username straight away', entries(r).some((e) => e.username === 'sam_speed' && e.wpm === 72));

console.log('--- my position and reports');
r = await call('GET', '/api/leaderboard/me');
check('my position needs a login (401)', r.status === 401);
r = await call('GET', '/api/leaderboard/me?period=lifetime', { user: 'sam' });
check('my position: #3 with 72 WPM, never cached', r.status === 200 && r.json?.position?.rank === 3 && r.json?.position?.wpm === 72 && /no-store/.test(r.headers.get('cache-control') ?? ''), r.text.slice(0, 120));
r = await call('GET', '/api/leaderboard/me?length=180', { user: 'carol' });
check('no counted score on that board: position null', r.status === 200 && r.json?.position === null);
const target = entries(await call('GET', '/api/leaderboard')).find((e) => e.username === 'alex');
r = await call('POST', '/api/scores/report', { body: { scoreId: target.scoreId, reason: 'x' } });
check('reporting needs a login (401)', r.status === 401);
r = await call('POST', '/api/scores/report', { user: 'carol', body: { scoreId: target.scoreId, reason: 'looks impossible' }, origin: 'https://evil.example' });
check('reporting from another website: 403', r.status === 403);
r = await call('POST', '/api/scores/report', { user: 'carol', body: { scoreId: 'no-such-score', reason: 'x' } });
check('reporting an unknown score: 404', r.status === 404);
r = await call('POST', '/api/scores/report', { user: 'carol', body: { scoreId: target.scoreId, reason: '   ' } });
check('reporting with no reason: 400', r.status === 400);
r = await call('POST', '/api/scores/report', { user: 'carol', body: { scoreId: target.scoreId, reason: 'Impossible score' } });
check('a real report is stored', r.status === 200 && r.json?.ok === true);
let lastReport = r;
for (let i = 0; i < 9; i++) lastReport = await call('POST', '/api/scores/report', { user: 'carol', body: { scoreId: target.scoreId, reason: 'again ' + i } });
check('ten reports a day are allowed', lastReport.status === 200);
r = await call('POST', '/api/scores/report', { user: 'carol', body: { scoreId: target.scoreId, reason: 'one too many' } });
check('the eleventh report in a day: 429', r.status === 429);
const [rep] = await q('select count(*)::int n from score_report');
check('reports are in the database', rep.n === 10);

console.log('--- hiding a score (moderation by hand)');
await q('update score set hidden = true where id = $1', [target.scoreId]);
rows = entries(await call('GET', '/api/leaderboard'));
check('a hidden score is on no board', !rows.some((e) => e.username === 'alex'));
await q('update score set hidden = false where id = $1', [target.scoreId]);
rows = entries(await call('GET', '/api/leaderboard'));
check('and it comes back when unhidden', rows.some((e) => e.username === 'alex'));

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
console.log('--- the leaderboard after an account is deleted');
{
  const [tp] = await q('select status, user_id, deleted_at from typist where username = $1', ['dave']);
  check('Dave\'s typist row is marked deleted, with no user link and a deletion time', tp && tp.status === 'deleted' && tp.user_id === null && tp.deleted_at !== null, JSON.stringify(tp));
  const [sc] = await q('select count(*)::int n from score s join typist t on t.id = s.typist_id where t.username = $1', ['dave']);
  check('Dave\'s scores are kept', sc.n === 1);
  const board2 = await call('GET', '/api/leaderboard');
  const dave = entries(board2).find((e) => e.username === 'dave');
  check('the board still shows Dave, ranked #1, marked deleted', !!dave && dave.deleted === true && dave.rank === 1 && dave.wpm === 90, JSON.stringify(dave));
  check('with no name, no email and nothing personal', dave && dave.name === null && !board2.text.includes('dave@example.com') && !board2.text.includes(U.dave.id) && !/"name":"Dave"/.test(board2.text));
  const [left] = await q('select (select count(*)::int from "user" where id = $1) u, (select count(*)::int from account where user_id = $1) a, (select count(*)::int from user_progress where user_id = $1) p', [U.dave.id]);
  check('the live rows (user, Google link, saved progress, sessions) are gone: the login is ended', left.u === 0 && left.a === 0 && left.p === 0);
  const [arch] = await q('select archive from typist where username = $1', ['dave']);
  check('but the data is archived on the typist row: email, name, Google id, progress', arch.archive?.email === 'dave@example.com' && arch.archive?.name === 'Dave' && Array.isArray(arch.archive?.logins) && arch.archive.logins.length === 1 && 'progress' in arch.archive, JSON.stringify(Object.keys(arch.archive ?? {})));
  check('no login credentials are in the archive (tokens, password)', !/accessToken|refreshToken|idToken|"password"|"token"/.test(JSON.stringify(arch.archive)));
  r = await call('PUT', '/api/typist', { user: 'alex', body: { username: 'dave' } });
  check('a deleted person\'s username stays reserved: 409', r.status === 409);
}
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
