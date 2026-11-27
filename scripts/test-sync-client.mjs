// Run: npm run test:sync-client (a fake browser storage and a fake server; nothing real is touched)
import assert from 'node:assert/strict';

// --- a tiny browser: storage, window, and a fetch we control
const store = new Map();
let sets = 0;
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => { sets++; store.set(k, String(v)); }, removeItem: (k) => store.delete(k) };
const events = [];
globalThis.window = { dispatchEvent: (e) => events.push(e.type) };
globalThis.Event = class { constructor(t) { this.type = t; } };
let calls = [];
let handler = async () => new Response('{}', { status: 500 });
globalThis.fetch = async (url, init) => { calls.push({ url, init }); return handler(url, init); };

const { syncNow, checkMergeChoice } = await import('../src/lib/sync/client.ts');
const { readLocal, LOCAL_KEYS } = await import('../src/lib/sync/local.ts');
const { emptySyncData, mergeSyncData, parseSyncData } = await import('../src/lib/sync/merge.ts');
const { saveMerged } = await import('../src/lib/sync/store.ts').catch(() => ({}));

let n = 0;
const t = async (name, fn) => { store.clear(); sets = 0; events.length = 0; calls = []; await fn(); n++; console.log('ok -', name); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const session = (id, date, wpm) => ({ id, date, wpm, accuracy: 95, correctChars: 250, incorrectChars: 5, totalChars: 255, duration: 60, mode: 'speed-test' });
const progress = (sessions, over = {}) => ({ sessions, achievements: [], keyStats: {}, streak: { current: 1, best: 1, lastPracticeDate: '2026-11-26' }, totalTypingTime: 60, wordsTyped: 50, bestWpm: Math.max(0, ...sessions.map((s) => s.wpm)), bestAccuracy: 95, ...over });
// A server that merges like the real one, with its own stored copy.
const serverWith = (stored) => async (url, init) => {
  const incoming = parseSyncData(JSON.parse(init.body).data);
  const merged = mergeSyncData(stored.data, incoming);
  stored.data = merged;
  return Response.json({ data: merged, version: 1 });
};

await t('signed out (401): nothing is written, the browser is left alone', async () => {
  store.set(LOCAL_KEYS.progress, JSON.stringify(progress([session('a', 1, 40)])));
  handler = async () => new Response('{"error":"signed_out"}', { status: 401 });
  assert.equal(await syncNow(), 'signed-out');
  assert.equal(sets, 0);
});
await t('accounts switched off (503): reported, nothing written', async () => {
  handler = async () => new Response('{"error":"accounts_unavailable"}', { status: 503 });
  assert.equal(await syncNow(), 'unavailable');
  assert.equal(sets, 0);
});
await t('server down or no network: reported as offline, never throws, nothing written', async () => {
  handler = async () => { throw new TypeError('Failed to fetch'); };
  assert.equal(await syncNow(), 'offline');
  assert.equal(sets, 0);
  handler = async () => new Response('oops', { status: 500 });
  assert.equal(await syncNow(), 'error');
  handler = async () => new Response('<html>not json</html>', { status: 200 });
  assert.equal(await syncNow(), 'error');
  assert.equal(sets, 0);
});
await t('a browser with progress gets the account\'s progress added, and keeps its own', async () => {
  store.set(LOCAL_KEYS.progress, JSON.stringify(progress([session('phone', 1000, 40)])));
  const stored = { data: { ...emptySyncData(), progress: progress([session('laptop', 2000, 71)]) } };
  handler = serverWith(stored);
  assert.equal(await syncNow(), 'synced');
  const local = readLocal();
  assert.deepEqual(local.progress.sessions.map((s) => s.id), ['phone', 'laptop']);
  assert.equal(local.progress.bestWpm, 71);
  await wait(5);
  assert.ok(events.includes('freetyper-progress-updated'), 'the page is told its progress changed');
  assert.deepEqual(stored.data.progress.sessions.map((s) => s.id), ['phone', 'laptop']);
});
await t('a fresh browser after clearing data gets everything back from the account', async () => {
  const stored = { data: { ...emptySyncData(), progress: progress([session('x', 1, 50), session('y', 2, 60)]), course: { completed: ['lesson-1'], skipped: [], attempts: {} } } };
  handler = serverWith(stored);
  assert.equal(await syncNow(), 'synced');
  assert.equal(readLocal().progress.sessions.length, 2);
  assert.deepEqual(readLocal().course.completed, ['lesson-1']);
});
await t('in step already: a second sync writes nothing and sends no change event (no loop)', async () => {
  const stored = { data: { ...emptySyncData(), progress: progress([session('x', 1, 50)]) } };
  handler = serverWith(stored);
  await syncNow();
  await wait(5);
  const writes = sets;
  events.length = 0;
  assert.equal(await syncNow(), 'synced');
  await wait(5);
  assert.equal(sets, writes);
  assert.equal(events.length, 0);
});
await t('two syncs at once share one request', async () => {
  handler = async () => { await wait(20); return Response.json({ data: emptySyncData(), version: 0 }); };
  const [a, b] = await Promise.all([syncNow(), syncNow()]);
  assert.equal(a, 'synced');
  assert.equal(b, 'synced');
  assert.equal(calls.length, 1);
});
await t('only progress numbers are sent: no typed text, no other storage keys', async () => {
  store.set(LOCAL_KEYS.progress, JSON.stringify({ ...progress([{ ...session('a', 1, 40), typedText: 'my secret sentence' }]), typed: 'more secrets' }));
  store.set('freetyper-settings', JSON.stringify({ font: 'x' }));
  store.set('freetyper-certificate-name', 'Jane Doe');
  store.set('freetyper-recent-text', 'abc');
  handler = async () => Response.json({ data: emptySyncData(), version: 0 });
  await syncNow();
  const sent = calls[0].init.body;
  assert.ok(!sent.includes('secret'));
  assert.ok(!sent.includes('Jane Doe'));
  assert.ok(!sent.includes('freetyper-settings'));
  assert.deepEqual(Object.keys(JSON.parse(sent)), ['data']);
});
await t('broken or hostile storage content does not stop the sync', async () => {
  store.set(LOCAL_KEYS.progress, '{not json');
  store.set(LOCAL_KEYS.course, '"a string"');
  store.set(LOCAL_KEYS.smart, 'null');
  handler = async () => Response.json({ data: emptySyncData(), version: 0 });
  assert.equal(await syncNow(), 'synced');
});

await t('first login question: asked only when this browser AND the account both hold progress', async () => {
  const withProgress = { ...emptySyncData(), progress: progress([session('s', 1, 50)]) };
  // both have progress: ask
  store.set(LOCAL_KEYS.progress, JSON.stringify(progress([session('mine', 1, 40)])));
  handler = async () => Response.json({ data: withProgress, version: 3 });
  const r = await checkMergeChoice();
  assert.equal(r.needed, true);
  assert.equal(r.local.totalTests, 1);
  assert.equal(r.server.bestWpm, 50);
  // the account is empty: just fill it, no question
  handler = async () => Response.json({ data: emptySyncData(), version: 0 });
  assert.equal((await checkMergeChoice()).needed, false);
  // this browser is empty (cleared data): just restore, no question
  store.clear();
  handler = async () => Response.json({ data: withProgress, version: 3 });
  assert.equal((await checkMergeChoice()).needed, false);
  assert.equal(sets, 0, 'asking never writes anything');
});
await t('first login question: signed out, accounts off, offline and garbled answers are told apart and never throw', async () => {
  handler = async () => new Response('{}', { status: 401 });
  assert.equal(await checkMergeChoice(), 'signed-out');
  handler = async () => new Response('{}', { status: 503 });
  assert.equal(await checkMergeChoice(), 'unavailable');
  handler = async () => { throw new TypeError('Failed to fetch'); };
  assert.equal(await checkMergeChoice(), 'error');
  handler = async () => new Response('nope', { status: 200 });
  assert.equal(await checkMergeChoice(), 'error');
});
console.log(`\n${n} passed`);
