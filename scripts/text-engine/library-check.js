// Library check: quotes and facts have unique ids, plain ASCII and sane lengths, and the picker follows level and focus keys.
// Run: node scripts/text-engine/library-check.js
process.argv[2] = process.argv[2] || require('os').tmpdir() + '/freetyper-text-engine';
require('fs').mkdirSync(process.argv[2], { recursive: true });
const ts = require('typescript');
const fs = require('fs'), path = require('path');
const root = require('path').join(__dirname, '..', '..', 'src', 'components', 'skills', 'typing') + '/';
const out = process.argv[2] + '/eng/';
for (const rel of ['smartEngine', 'courseWords', 'engine/levels', 'engine/rng', 'engine/rating', 'engine/quality', 'engine/lexicon', 'engine/sentences', 'engine/words', 'engine/adaptive', 'engine/library', 'engine/library/quotes', 'engine/library/facts']) {
  const src = fs.readFileSync(root + rel + '.ts', 'utf8');
  const dest = out + rel + '.js'; fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, ts.transpileModule(src, { compilerOptions: { module: 'commonjs', target: 'es2019' } }).outputText);
}
const L = require(out + 'engine/library.js'), E = require(out + 'smartEngine.js'), R = require(out + 'engine/rating.js'), Q = require(out + 'engine/rng.js');
let bad = 0; const fail = (m) => { bad++; console.log('FAIL', m); };
for (const [name, items] of [['quotes', L.quoteItems()], ['facts', L.factItems()]]) {
  const ids = new Set();
  const lens = [], rates = [];
  for (const it of items) {
    if (ids.has(it.id)) fail('duplicate id ' + it.id); ids.add(it.id);
    if (!/^[\x20-\x7e]+$/.test(it.text)) fail('not ascii ' + it.id);
    if (it.text.length < 30 || it.text.length > 260) fail('length ' + it.id + ' ' + it.text.length);
    if (/\s{2}/.test(it.text) || /^\s|\s$/.test(it.text)) fail('whitespace ' + it.id);
    lens.push(it.text.length); rates.push(R.rateDifficulty(it.text));
  }
  lens.sort((a, b) => a - b); rates.sort((a, b) => a - b);
  console.log(name, items.length, '| length min/median/max', lens[0], lens[lens.length >> 1], lens[lens.length - 1], '| difficulty min/median/max', rates[0], rates[rates.length >> 1], rates[rates.length - 1]);
}
// the picker favours short texts for Beginner and longer for Advanced
function avgLen(unlocked, d, items) {
  const st = { ...E.emptyState(), unlocked, difficulty: d, rounds: 4 };
  const target = Math.round(90 * E.segmentLines(st) * 0.9);
  let s = 0; for (let i = 0; i < 400; i++) s += L.pickPassage(items, st, target, [], Q.seeded('p' + unlocked + i)).text.length;
  return Math.round(s / 400);
}
const quotes = L.quoteItems(), facts = L.factItems();
console.log('average picked length  quotes: Beginner', avgLen(8, 2, quotes), '| Intermediate', avgLen(15, 5, quotes), '| Advanced', avgLen(24, 8, quotes));
console.log('average picked length  facts : Beginner', avgLen(8, 2, facts), '| Intermediate', avgLen(15, 5, facts), '| Advanced', avgLen(24, 8, facts));
const st = { ...E.emptyState(), unlocked: 15, difficulty: 5, rounds: 4 };
console.log('sample note:', L.pickPassage(facts, st, 160, [], Q.seeded('n')).note);
console.log('sample note:', L.pickPassage(quotes, st, 160, [], Q.seeded('m')).note);
console.log('FAILURES', bad); process.exit(bad ? 1 : 0);
