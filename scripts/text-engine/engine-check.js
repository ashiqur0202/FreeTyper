// Text engine check: makes thousands of texts across key counts and difficulties and checks that no locked key appears,
// the quality gates hold and the same seed gives the same text. Run: node scripts/text-engine/engine-check.js
process.argv[2] = process.argv[2] || require('os').tmpdir() + '/freetyper-text-engine';
require('fs').mkdirSync(process.argv[2], { recursive: true });
const ts = require('typescript'), fs = require('fs'), path = require('path');
const root = require('path').join(__dirname, '..', '..', 'src', 'components', 'skills', 'typing') + '/';
const out = process.argv[2] + '/eng/';
function build(rel) {
  const src = fs.readFileSync(root + rel + '.ts', 'utf8');
  const dest = out + rel + '.js';
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, ts.transpileModule(src, { compilerOptions: { module: 'commonjs', target: 'es2019' } }).outputText);
}
['smartEngine', 'courseWords', 'engine/levels', 'engine/rng', 'engine/rating', 'engine/quality', 'engine/lexicon', 'engine/sentences', 'engine/words', 'engine/adaptive'].forEach(build);
const E = require(out + 'smartEngine.js');
const Q = require(out + 'engine/quality.js');
const S = require(out + 'engine/sentences.js');
const R = require(out + 'engine/rng.js');
const W = require(out + 'engine/words.js');

let failures = 0;
function fail(msg) { failures++; if (failures < 15) console.log('FAIL', msg); }

// 1. word pool has no blocked words
for (const w of W.allWords()) if (Q.isBlockedWord(w)) fail('blocked word in pool: ' + w);
console.log('word pool size', W.allWords().length);

// 2. generate across key counts and difficulties; no locked keys; quality gates
const order = E.KEY_ORDER;
let made = 0, sentenceTexts = 0;
for (let u = 1; u <= 26; u++) {
  for (const d of [1, 3, 5, 7, 9]) {
    for (let n = 0; n < 40; n++) {
      const state = { ...E.emptyState(), unlocked: u, difficulty: d, rounds: 3 };
      const plan = E.planOf(state);
      const lines = E.segmentLines(state);
      const r = E.generatePracticeSegment(state, plan, Math.round(90 * lines * 0.9), R.seeded('t' + u + d + n));
      made++;
      const open = new Set(order.slice(0, u).split(''));
      const problems = Q.checkText(r.text, { open, minChars: 2, maxChars: 400, allowRepeats: u <= 2 });
      if (problems.length) fail(`u=${u} d=${d}: ${problems.join(', ')} :: ${r.text.slice(0, 80)}`);
      if (/[A-Z]/.test(r.text) && d < 5) fail('capital below difficulty 5: ' + r.text.slice(0, 60));
      if (/[?]/.test(r.text)) sentenceTexts++;
    }
  }
}
console.log('texts checked', made, '| failures', failures);

// 3. determinism: the same seed gives the same text
const st = { ...E.emptyState(), unlocked: 20, difficulty: 6, rounds: 3 };
const a = E.generatePracticeSegment(st, E.planOf(st), 200, R.seeded('same'));
const b = E.generatePracticeSegment(st, E.planOf(st), 200, R.seeded('same'));
if (a.text !== b.text) fail('not deterministic');
else console.log('deterministic: ok');

// 4. samples at each level
for (const [u, d] of [[1, 1], [4, 2], [9, 3], [12, 4], [16, 5], [20, 6], [26, 8]]) {
  const state = { ...E.emptyState(), unlocked: u, difficulty: d, rounds: 3 };
  const lines = E.segmentLines(state);
  console.log(`\n[${E.LEVELS[E.levelIndex(u)].name}, ${u} keys, difficulty ${d}, ${lines} line(s)]`);
  for (let i = 0; i < 2; i++) console.log('  ' + E.generatePracticeSegment(state, E.planOf(state), Math.round(90 * lines * 0.9), R.seeded('s' + u + i)).text);
}
console.log('\nTOTAL FAILURES', failures);
process.exit(failures ? 1 : 0);
