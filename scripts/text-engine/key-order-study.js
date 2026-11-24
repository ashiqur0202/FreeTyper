// How the key unlock order was chosen: compares candidate orders on real-word coverage and reach cost (see engine/levels.ts).
// Needs engine-check.js to have run first (it builds the engine into the work folder). Run: node scripts/text-engine/key-order-study.js
process.argv[2] = process.argv[2] || require('os').tmpdir() + '/freetyper-text-engine';
require('fs').mkdirSync(process.argv[2], { recursive: true });
// and reach ease (cost of the keys opened so far). Run after engine-test.js has built eng/.
const out = process.argv[2] + '/eng/';
const W = require(out + 'engine/words.js');
const words = W.allWords();

// Reach cost on a QWERTY laptop: row (home 1, other rows 2) x finger (index/middle 1, ring 1.2, little 1.5), +0.3 for the inner index column.
const COST = {};
const rows = { home: 'asdfghjkl', top: 'qwertyuiop', bottom: 'zxcvbnm' };
const finger = { q: 1.5, a: 1.5, z: 1.5, w: 1.2, s: 1.2, x: 1.2, e: 1, d: 1, c: 1, r: 1, f: 1, v: 1, t: 1, g: 1, b: 1, y: 1, h: 1, n: 1, u: 1, j: 1, m: 1, i: 1, k: 1, o: 1.2, l: 1.2, p: 1.5 };
const inner = new Set('tgbyhn');
for (const [row, letters] of Object.entries(rows)) for (const k of letters) COST[k] = (row === 'home' ? 1 : 2) * finger[k] + (inner.has(k) ? 0.3 : 0);
const HAND = {}; for (const k of 'qwertasdfgzxcvb') HAND[k] = 'L'; for (const k of 'yuiophjklnm') HAND[k] = 'R';

function coverage(order, k) {
  const set = new Set(order.slice(0, k));
  return words.filter((w) => [...w].every((c) => set.has(c))).length;
}
function stats(name, order) {
  const cov = [4, 6, 8, 10, 12, 14, 16, 20].map((k) => coverage(order, k));
  let area = 0; for (let k = 1; k <= 26; k++) area += coverage(order, k);
  const ease = [6, 12, 20].map((k) => (order.slice(0, k).split('').reduce((a, c) => a + COST[c], 0) / k).toFixed(2));
  const left = order.slice(0, 14).split('').filter((c) => HAND[c] === 'L').length;
  console.log(name.padEnd(10), order);
  console.log('  words typeable with first 4/6/8/10/12/14/16/20 keys:', cov.join(' / '), '| area', area, '| avg reach cost (first 6/12/20):', ease.join(' / '), '| left hand in first 14:', left + '/14');
}

const candidates = {
  current: 'fjdkslaeghiortunmcbwypvqxz',
  frequency: 'etaoinshrdlcumwfgypbvkjxqz',
  lessons: 'asdfjklghqwertyuiopzxcvbnm',
};

// Greedy: start at the index fingers, then always take the key with the best (new words + a little for future) per unit of reach cost,
// alternating hands when the choice is close.
function greedy(alpha, beta) {
  const order = ['f', 'j'];
  const left = new Set('abcdefghijklmnopqrstuvwxyz'.split('').filter((c) => !order.includes(c)));
  while (left.size) {
    const base = coverage(order.join(''), order.length);
    let best = null, bestScore = -1;
    for (const c of left) {
      const next = order.concat(c);
      const gain = coverage(next.join(''), next.length) - base;
      const lastHand = HAND[order[order.length - 1]];
      const balance = HAND[c] !== lastHand ? 1.15 : 1;
      const score = ((gain + 1) / Math.pow(COST[c], alpha)) * balance * (1 + beta * 0);
      if (score > bestScore) { bestScore = score; best = c; }
    }
    order.push(best); left.delete(best);
  }
  return order.join('');
}
candidates.greedy1 = greedy(1, 0);
candidates.greedy15 = greedy(1.5, 0);
candidates.greedy2 = greedy(2, 0);

for (const [name, order] of Object.entries(candidates)) stats(name, order);

// ---- Beam search under an explicit "easy first" rule: the reach cost of the key opened at step k may not exceed cap(k).
function cap(k) { return k <= 7 ? 1.5 : k <= 14 ? 2.1 : k <= 20 ? 2.7 : 3.1; }
function beam(width, firstTwo) {
  let beamList = [{ order: firstTwo.split(''), score: 0 }];
  for (let k = 3; k <= 26; k++) {
    const next = [];
    for (const b of beamList) {
      const used = new Set(b.order);
      for (const c of 'abcdefghijklmnopqrstuvwxyz') {
        if (used.has(c) || COST[c] > cap(k)) continue;
        const order = b.order.concat(c);
        // value of this step: real words made possible, weighted most for the early keys (beginners need words soonest)
        const cov = coverage(order.join(''), k);
        const weight = k <= 10 ? 3 : k <= 16 ? 2 : 1;
        const balance = HAND[c] !== HAND[b.order[b.order.length - 1]] ? 0.15 : 0;
        next.push({ order, score: b.score + weight * (Math.log(1 + cov) + balance) });
      }
    }
    // when a cap leaves no choice, relax it
    if (!next.length) { for (const b of beamList) { const used = new Set(b.order); for (const c of 'abcdefghijklmnopqrstuvwxyz') if (!used.has(c)) next.push({ order: b.order.concat(c), score: b.score }); } }
    next.sort((a, b) => b.score - a.score);
    // keep the beam diverse: unique prefixes only
    const seen = new Set(); beamList = [];
    for (const n of next) { const key = n.order.join(''); if (!seen.has(key)) { seen.add(key); beamList.push(n); } if (beamList.length >= width) break; }
  }
  return beamList[0].order.join('');
}
console.log('\nBeam search with "easy first" caps:');
const beamOrder = beam(300, 'fj');
stats('beam', beamOrder);
candidates.beam = beamOrder;
for (const name of ['current', 'greedy15', 'beam']) {
  const o = candidates[name];
  console.log(name.padEnd(9), 'keys 1-7:', o.slice(0, 7), '| 8-14:', o.slice(7, 14), '| 15-20:', o.slice(14, 20), '| 21-26:', o.slice(20));
}

// ---- Tiered: three bands by reach cost, words decide the order inside a band.
function tiered(capFn, width) {
  let beamList = [{ order: ['f', 'j'], score: 0 }];
  for (let k = 3; k <= 26; k++) {
    const next = [];
    for (const b of beamList) {
      const used = new Set(b.order);
      for (const c of 'abcdefghijklmnopqrstuvwxyz') {
        if (used.has(c) || COST[c] > capFn(k)) continue;
        const order = b.order.concat(c);
        const cov = coverage(order.join(''), k);
        const weight = k <= 10 ? 3 : k <= 16 ? 2 : 1;
        next.push({ order, score: b.score + weight * Math.log(1 + cov) + (HAND[c] !== HAND[b.order[b.order.length - 1]] ? 0.15 : 0) });
      }
    }
    if (!next.length) { for (const b of beamList) { const used = new Set(b.order); for (const c of 'abcdefghijklmnopqrstuvwxyz') if (!used.has(c)) next.push({ order: b.order.concat(c), score: b.score }); } }
    next.sort((a, b) => b.score - a.score);
    const seen = new Set(); beamList = [];
    for (const n of next) { const key = n.order.join(''); if (!seen.has(key)) { seen.add(key); beamList.push(n); } if (beamList.length >= width) break; }
  }
  return beamList[0].order.join('');
}
console.log('\nTiered bands:');
const t1 = tiered((k) => (k <= 9 ? 1.5 : k <= 16 ? 2.1 : k <= 22 ? 2.7 : 3.1), 400);
stats('tiered9', t1);
const t2 = tiered((k) => (k <= 7 ? 1.5 : k <= 16 ? 2.1 : k <= 22 ? 2.7 : 3.1), 400);
stats('tiered7', t2);
// hand-made: home row with a early, then vowels
for (const [n, o] of Object.entries({ hand1: 'fjdaslkghe' + 'irutocmnwbypvxqz', hand2: 'fjdasle' + 'kghirutnocmwbypvxqz' })) stats(n, o.length === 26 ? o : o);
