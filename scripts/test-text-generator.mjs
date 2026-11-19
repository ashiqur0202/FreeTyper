// Run: node --experimental-strip-types --import ./scripts/register-ts.mjs scripts/test-text-generator.mjs
import assert from 'node:assert/strict';
import { generateSentences, generateWords, normalizeLevel, DEFAULT_TEXT_LEVEL, TEXT_LEVELS } from '../src/components/skills/typing/textGenerator.ts';
import { sentenceKeys, pickFreshSeed } from '../src/components/skills/typing/recentText.ts';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };
const LEVELS = [1, 2, 3, 4, 5];
const split = (text) => text.split(/(?<=[.!?"]) (?=[A-Z"])/);
const avgWord = (text) => {
  const w = text.split(/\s+/);
  return w.reduce((s, x) => s + x.replace(/[^A-Za-z]/g, '').length, 0) / w.length;
};

t('same seed, level and length give the same text; another seed or level gives another', () => {
  for (const lv of LEVELS) {
    assert.equal(generateSentences('k3x9aq', lv, 60), generateSentences('k3x9aq', lv, 60));
    assert.notEqual(generateSentences('k3x9aq', lv, 60), generateSentences('k3x9ar', lv, 60));
    assert.equal(generateWords('k3x9aq', lv, 40), generateWords('k3x9aq', lv, 40));
    assert.notEqual(generateWords('k3x9aq', lv, 40), generateWords('k3x9ar', lv, 40));
  }
  assert.notEqual(generateSentences('k3x9aq', 2, 60), generateSentences('k3x9aq', 3, 60));
});

// Version 1 is frozen: a challenge link sent today must give the same text next year. This hash covers a long
// sample of every level, so a change to any word group shows up here. Change the groups only in a NEW version.
const PIN = 'un8vg1';
t('version 1 text is frozen', () => {
  let h = 5381;
  for (const lv of LEVELS) for (let i = 0; i < 300; i++) for (const ch of generateSentences('pin' + i, lv, 60) + generateWords('pin' + i, lv, 30)) h = (Math.imul(h, 33) ^ ch.charCodeAt(0)) >>> 0;
  assert.equal(h.toString(36), PIN, 'version 1 text changed (hash ' + h.toString(36) + '). Change the word groups only in a NEW version.');
});

t('plain ASCII, no double spaces, a proper start and end, at least the words asked for', () => {
  for (const lv of LEVELS) {
    for (let i = 0; i < 400; i++) {
      const s = generateSentences('a' + i, lv, 120);
      assert.ok(!/[^\x20-\x7e]/.test(s), 'non-ASCII character');
      assert.ok(!/ {2}/.test(s), 'double space');
      assert.ok(/^[A-Z"]/.test(s), 'bad start: ' + s.slice(0, 20));
      assert.ok(/[.]$/.test(s), 'does not end with a full stop');
      assert.ok(s.split(/\s+/).length >= 120);
      assert.ok(!/(^|\s)i(\s|$)/.test(s), 'lower-case I');
    }
  }
});

t('"a" and "an" agree with the next word, and no word is doubled', () => {
  for (const lv of LEVELS) {
    for (let i = 0; i < 1500; i++) {
      const s = generateSentences('g' + i, lv, 120);
      for (const m of s.matchAll(/\b(a|an) ([A-Za-z]+)/g)) {
        const vowel = /^[aeiou]/i.test(m[2]) && !/^(unique|university|one|useful|user)/i.test(m[2]);
        const silentH = /^(hour|honest|heir)/i.test(m[2]);
        if (m[1] === 'a') assert.ok(!vowel && !silentH, 'a before a vowel sound: ' + m[0]);
        else assert.ok(vowel || silentH, 'an before a consonant sound: ' + m[0]);
      }
      assert.ok(!/\b([A-Za-z]+) \1\b/i.test(s.replace(/[.,"]/g, ' ')), 'doubled word');
    }
  }
});

t('a time of day never contradicts the rest of the sentence', () => {
  const morning = /^(This morning|Early in the morning|Just before sunrise|On a cold winter morning|At exactly 8:15)/;
  const evening = /^(Late in the evening|Late on Sunday night|Once the sun had set|At 6 p\.m\.)/;
  for (const lv of [2, 3, 4, 5]) {
    for (let i = 0; i < 2000; i++) {
      for (const x of split(generateSentences('c' + i, lv, 120))) {
        const comma = x.indexOf(',');
        const rest = comma < 0 ? x : x.slice(comma + 1);
        if (morning.test(x)) assert.ok(!/evening|sunset|sun went down|\bdinner\b/i.test(rest), x);
        if (evening.test(x)) assert.ok(!/morning|sunrise|breakfast/i.test(rest), x);
        if (/^Just after the rain stopped/.test(x)) assert.ok(!/rain/i.test(rest), x);
      }
    }
  }
});

t('harder levels use longer words, for sentences and for words', () => {
  const avg = (fn) => LEVELS.map((lv) => { let s = 0; for (let i = 0; i < 300; i++) s += avgWord(fn(lv, i)); return s / 300; });
  const sen = avg((lv, i) => generateSentences('d' + i, lv, 120));
  const wrd = avg((lv, i) => generateWords('d' + i, lv, 60));
  for (let i = 1; i < 5; i++) {
    assert.ok(sen[i] > sen[i - 1], 'sentences: level ' + (i + 1) + ' is not harder than ' + i + ' ' + sen.map((x) => x.toFixed(2)));
    assert.ok(wrd[i] > wrd[i - 1], 'words: level ' + (i + 1) + ' is not harder than ' + i + ' ' + wrd.map((x) => x.toFixed(2)));
  }
  assert.ok(sen[0] < 4 && sen[4] > 4.6, 'sentence range ' + sen.map((x) => x.toFixed(2)));
});

t('lots of different sentences, and none twice in one passage', () => {
  const need = { 1: 2000, 2: 5000, 3: 5000, 4: 5000, 5: 5000 };
  for (const lv of LEVELS) {
    const seen = new Set();
    for (let i = 0; i < 3000; i++) {
      const parts = split(generateSentences('v' + i, lv, 300));
      assert.equal(new Set(parts).size, parts.length, 'a sentence repeats inside one passage');
      for (const p of parts) seen.add(p);
    }
    assert.ok(seen.size >= need[lv], `level ${lv}: only ${seen.size} different sentences`);
  }
});

t('words: the exact count, no word twice within 12, and only letters', () => {
  for (const lv of LEVELS) {
    for (let i = 0; i < 300; i++) {
      const w = generateWords('w' + i, lv, 90).split(' ');
      assert.equal(w.length, 90);
      assert.ok(w.every((x) => /^[a-z]+$/.test(x)));
      for (let j = 0; j < w.length; j++) assert.ok(!w.slice(Math.max(0, j - 12), j).includes(w[j]), 'word repeated too soon: ' + w[j]);
    }
  }
});

t('normalizeLevel: a whole number 1 to 5 (also from text), anything else is the default', () => {
  assert.equal(normalizeLevel(1), 1);
  assert.equal(normalizeLevel('5'), 5);
  assert.equal(normalizeLevel(3), 3);
  for (const bad of [0, 6, -1, 2.5, 'x', '', null, undefined, '10', NaN]) assert.equal(normalizeLevel(bad), DEFAULT_TEXT_LEVEL);
  assert.equal(TEXT_LEVELS.length, 5);
  assert.equal(DEFAULT_TEXT_LEVEL, 3);
});

t('no repeats: choosing the seed cuts how often a new test opens with a sentence seen lately', () => {
  // Like a real visitor: 300 tests in a row, the last 400 sentence fingerprints remembered.
  const run = (avoid) => {
    let recent = [];
    let repeats = 0;
    let counter = 0;
    for (let i = 0; i < 300; i++) {
      const known = new Set(recent);
      const make = () => (avoid ? 'a' : 'b') + Math.random().toString(36).slice(2, 8) + counter++;
      const { text } = avoid
        ? pickFreshSeed(make, (s) => generateSentences(s, 3, 120), known, 12)
        : { text: generateSentences(make(), 3, 120) };
      const keys = sentenceKeys(text);
      if (keys.some((k) => known.has(k))) repeats++;
      recent = [...recent, ...keys].slice(-400);
    }
    return repeats;
  };
  const without = run(false);
  const withAvoid = run(true);
  console.log('   tests that opened with a recent sentence, out of 300: ' + without + ' without avoiding, ' + withAvoid + ' with it');
  assert.ok(withAvoid <= without * 0.4, 'avoiding did not help enough: ' + withAvoid + ' against ' + without);
  assert.ok(withAvoid < 60, 'too many repeats even when avoiding: ' + withAvoid + ' of 300');
  // a pool too small to avoid anything still gives a text
  const all = pickFreshSeed(() => 'x', () => 'Same sentence. Same sentence.', new Set(sentenceKeys('Same sentence. Same sentence.')));
  assert.equal(all.text, 'Same sentence. Same sentence.');
});

console.log(`\n${n} tests passed`);
