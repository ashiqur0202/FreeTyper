// Simulation of typists learning through the REAL adaptive engine, to compare engine settings (engine/tuning.ts).
//
// The typist model is the power law of practice (keystroke time falls with the number of presses of a key, which is
// well supported for typing): time_k = floor_k + (start_k - floor_k) * (1 + n_k / TAU) ^ -B, and the error rate falls
// the same way. Keys further from the home row start slower and more error-prone. It is a MODEL, not real learners: it
// says whether an engine setting gets stuck, frustrates or bores a typist like this, and how quickly such a typist
// would progress, not how real people would. Learning here depends on how often a key is pressed, so a setting that
// puts the right keys in front of the typist more often learns faster.
//
// Run: node scripts/text-engine/simulate.js [runsPerProfile] [minutes]
const os = require('os'), fs = require('fs'), path = require('path');
const ts = require('typescript');
const root = path.join(__dirname, '..', '..', 'src', 'components', 'skills', 'typing') + '/';
const out = os.tmpdir() + '/freetyper-text-engine-sim/eng/';
for (const rel of ['smartEngine', 'courseWords', 'engine/levels', 'engine/tuning', 'engine/rng', 'engine/rating', 'engine/quality', 'engine/lexicon', 'engine/sentences', 'engine/words', 'engine/adaptive']) {
  const dest = out + rel + '.js'; fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, ts.transpileModule(fs.readFileSync(root + rel + '.ts', 'utf8'), { compilerOptions: { module: 'commonjs', target: 'es2019' } }).outputText);
}
const E = require(out + 'smartEngine.js');
const { TUNING, DEFAULT_TUNING } = require(out + 'engine/tuning.js');
const { seeded } = require(out + 'engine/rng.js');

const RUNS = Number(process.argv[2] || 8);
const MINUTES = Number(process.argv[3] || 120);
const CHECKPOINTS = [15, 30, 60, 120].filter((m) => m <= MINUTES);

// Reach cost of a key on a QWERTY laptop (see key-order-study.js): home row 1, other rows 2, little finger 1.5, ring 1.2, inner index +0.3.
const COST = {};
const finger = { q: 1.5, a: 1.5, z: 1.5, w: 1.2, s: 1.2, x: 1.2, o: 1.2, l: 1.2, p: 1.5 };
const home = new Set('asdfghjkl'), inner = new Set('tgbyhn');
for (const k of 'abcdefghijklmnopqrstuvwxyz') COST[k] = (home.has(k) ? 1 : 2) * (finger[k] || 1) + (inner.has(k) ? 0.3 : 0);
const mult = (k) => 0.8 + 0.25 * (COST[k] ?? 2);

const PROFILES = {
  slow:    { startMs: 900, floorMs: 260, startErr: 0.22, floorErr: 0.03, B: 0.35, errB: 0.5, TAU: 25 },
  average: { startMs: 600, floorMs: 210, startErr: 0.12, floorErr: 0.02, B: 0.40, errB: 0.5, TAU: 25 },
  fast:    { startMs: 380, floorMs: 150, startErr: 0.07, floorErr: 0.012, B: 0.45, errB: 0.5, TAU: 25 },
  sloppy:  { startMs: 420, floorMs: 170, startErr: 0.20, floorErr: 0.06, B: 0.40, errB: 0.3, TAU: 25 },
};

function typist(profile, seed) {
  const P = PROFILES[profile];
  const rand = seeded('typist' + profile + seed);
  const n = {};
  const gauss = () => { let u = 0; while (!u) u = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand()); };
  return {
    n,
    ms(k) { const m = mult(k), c = Math.pow(1 + (n[k] || 0) / P.TAU, -P.B); return P.floorMs * m + (P.startMs * m - P.floorMs * m) * c; },
    err(k) { const m = mult(k), c = Math.pow(1 + (n[k] || 0) / P.TAU, -P.errB); return Math.min(0.6, P.floorErr * m + (P.startErr * m - P.floorErr * m) * c); },
    press(ch) {
      const k = ch.toLowerCase();
      const letter = k >= 'a' && k <= 'z';
      const upper = ch !== k;
      const base = letter ? this.ms(k) : P.floorMs * 1.15 * (k === ' ' ? 1 : 1.6);
      const e = (letter ? this.err(k) : k === ' ' ? 0.01 : 0.05) * (upper ? 1.3 : 1);
      const dt = Math.max(60, (base + (upper ? 90 : 0)) * Math.exp(0.22 * gauss()));
      const correct = rand() > e;
      if (letter) n[k] = (n[k] || 0) + 1;
      return { key: ch, correct, dt: correct ? dt : dt * 1.6 };
    },
    skill(k) { return (P.floorMs * mult(k)) / this.ms(k); },
  };
}

function run(profile, seed, overrides) {
  Object.assign(TUNING, DEFAULT_TUNING, overrides);
  const t = typist(profile, seed);
  const rand = seeded('engine' + profile + seed);
  let state = E.emptyState();
  let clock = 0; // seconds
  const res = { checkpoints: {}, texts: 0, low: 0, high: 0, lastUnlockAt: 0, keyAt: {} };
  let cp = 0;
  while (clock < MINUTES * 60 && res.texts < 4000) {
    const lines = E.segmentLines(state);
    const plan = E.planOf(state);
    const target = Math.round(Math.max(60, 90 * lines * 0.9));
    const text = E.generatePracticeSegment(state, plan, target, rand).text;
    const start = {};
    for (const k of E.openKeys(state)) start[k] = E.mastery(state, k);
    const samples = [];
    let ok = 0, sum = 0, timed = 0;
    for (let i = 0; i < text.length; i++) {
      const p = t.press(text[i]);
      samples.push({ key: p.key, correct: p.correct, gapMs: i === 0 ? undefined : p.dt });
      if (p.correct) ok++;
      if (i > 0) { sum += p.dt; timed++; }
    }
    const acc = (ok / text.length) * 100;
    const wpm = timed ? Math.round((timed / 5) / (sum / 60000)) : 0;
    clock += sum / 1000 + 2; // two seconds between texts
    const before = state.unlocked;
    const o = E.applySegment(state, samples, acc, wpm, state.difficulty, null);
    state = E.finishSession(o.state, start, null).state;
    res.texts++;
    if (acc < 85) res.low++;
    if (acc >= 98) res.high++;
    if (state.unlocked > before) { res.lastUnlockAt = clock; if (!res.keyAt[state.unlocked]) res.keyAt[state.unlocked] = clock / 60; }
    while (cp < CHECKPOINTS.length && clock >= CHECKPOINTS[cp] * 60) {
      const open = E.openKeys(state);
      const total = open.reduce((a, k) => a + t.skill(k), 0) / 26;
      const mastered = open.filter((k) => t.skill(k) >= 0.6).length;
      res.checkpoints[CHECKPOINTS[cp]] = { keys: state.unlocked, skill: total, diff: state.difficulty, mastered, quality: open.reduce((a, k) => a + t.skill(k), 0) / open.length };
      cp++;
    }
  }
  res.stuckMinutes = (clock - res.lastUnlockAt) / 60;
  res.minutes = clock / 60;
  return res;
}

// The first row is the rule the site used before 2026-11-24 (every open key must reach the bar). The second row is the
// default now (see engine/tuning.ts). The rest change ONE thing from the default.
const OLD_RULE = { unlockByAverage: false, unlockScoreFirst: 0.65, unlockScoreLast: 0.75, unlockPressesFirst: 6, unlockPressesLast: 10, unlockFloorGap: 0.15 };
const VARIANTS = {
  'old rule: every key (0.65-0.75, 6-10)': OLD_RULE,
  'DEFAULT: average (0.60-0.70, 5-8, gap .10)': {},
  'default, scores follow slower (ema 0.2)': { emaText: 0.2 },
  'default, scores follow faster (ema 0.5)': { emaText: 0.5 },
  'default, stronger focus (8/3/2.5, new 6)': { focusWeight: 8, almostWeight: 3, reviewWeight: 2.5, freshWeight: 6 },
  'default, flatter focus (3/2/1.5, new 3)': { focusWeight: 3, almostWeight: 2, reviewWeight: 1.5, freshWeight: 3 },
  'default, harder text (up 92, down 85)': { upAccuracy: 92, upHighAccuracy: 96, downAccuracy: 85 },
  'default, gentler text (up 97, down 90)': { upAccuracy: 97, upHighAccuracy: 99, downAccuracy: 90 },
  'default, stricter unlock (0.70-0.80, 7-12)': { unlockScoreFirst: 0.7, unlockScoreLast: 0.8, unlockPressesFirst: 7, unlockPressesLast: 12 },
};
if (process.argv[4]) { // a custom variant: node simulate.js runs minutes '{"emaText":0.3}'
  const custom = JSON.parse(process.argv[4]);
  for (const k of Object.keys(VARIANTS)) delete VARIANTS[k];
  VARIANTS['custom'] = custom; VARIANTS['current (default)'] = {};
}

const mean = (a) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
const names = Object.keys(PROFILES);
const rows = [];
for (const [vname, over] of Object.entries(VARIANTS)) {
  const all = [];
  for (const p of names) for (let s = 0; s < RUNS; s++) all.push({ p, r: run(p, s, over) });
  const at = (m, f) => mean(all.filter((x) => x.r.checkpoints[m]).map((x) => f(x.r.checkpoints[m])));
  const perProfile = names.map((p) => mean(all.filter((x) => x.p === p && x.r.checkpoints[60]).map((x) => x.r.checkpoints[60].skill)));
  rows.push({
    name: vname,
    keys30: at(30, (c) => c.keys), keys60: at(60, (c) => c.keys),
    skill60: at(60, (c) => c.skill), skill120: MINUTES >= 120 ? at(120, (c) => c.skill) : NaN,
    mastered60: at(60, (c) => c.mastered), mastered120: MINUTES >= 120 ? at(120, (c) => c.mastered) : NaN, quality60: at(60, (c) => c.quality),
    worstProfile60: Math.min(...perProfile),
    low: mean(all.map((x) => x.r.low / x.r.texts)) * 100, high: mean(all.map((x) => x.r.high / x.r.texts)) * 100,
    stuck: mean(all.map((x) => x.r.stuckMinutes)),
    t12: mean(all.filter((x) => x.r.keyAt[12]).map((x) => x.r.keyAt[12])),
  });
}
Object.assign(TUNING, DEFAULT_TUNING);
const f = (x, d = 1) => (Number.isFinite(x) ? x.toFixed(d) : '-');
console.log(`\n${names.length} typist profiles x ${RUNS} runs, ${MINUTES} simulated minutes each. skill = share of the full 26-key skill reached (open keys only count).\n`);
console.log('variant'.padEnd(44), 'keys@30'.padStart(8), 'keys@60'.padStart(8), 'skill@60'.padStart(9), 'skill@120'.padStart(10), 'worst@60'.padStart(9), 'learned@60'.padStart(11), 'learned@120'.padStart(12), 'avg skill of open@60'.padStart(21), 'too hard%'.padStart(10), 'too easy%'.padStart(10), 'stuck min'.padStart(10), 'min to 12'.padStart(10));
for (const r of rows) console.log(r.name.padEnd(44), f(r.keys30).padStart(8), f(r.keys60).padStart(8), f(r.skill60, 3).padStart(9), f(r.skill120, 3).padStart(10), f(r.worstProfile60, 3).padStart(9), f(r.mastered60).padStart(11), f(r.mastered120).padStart(12), f(r.quality60, 3).padStart(21), f(r.low).padStart(10), f(r.high).padStart(10), f(r.stuck).padStart(10), f(r.t12).padStart(10));

if (process.env.PER_PROFILE) {
  console.log('\nPer typist type at 120 minutes: keys open / well-learned keys / too-hard texts %');
  for (const [vname, over] of Object.entries(VARIANTS)) {
    const line = names.map((p) => { const rs = []; for (let i = 0; i < RUNS; i++) rs.push(run(p, i, over)); const c = rs.filter((r) => r.checkpoints[120]).map((r) => r.checkpoints[120]); return p + " " + mean(c.map((x) => x.keys)).toFixed(1) + "/" + mean(c.map((x) => x.mastered)).toFixed(1) + "/" + (mean(rs.map((r) => r.low / r.texts)) * 100).toFixed(1) + "%"; });
    console.log(vname.padEnd(46), line.join("   "));
  }
  Object.assign(TUNING, DEFAULT_TUNING);
}
