// Run: node --experimental-strip-types scripts/test-number-row.mjs
import assert from 'node:assert/strict';
import { fingerMap } from '../src/components/skills/typing/typingData.ts';
import {
  numberRowText,
  numberRowBudget,
  nextKeyHint,
  digitSpeeds,
  digitOfKey,
  isNumberRowDetail,
  MIN_DIGIT_SAMPLES,
} from '../src/components/skills/typing/numberRow.ts';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };

// A repeatable random source, so a failing text can be reproduced.
const seeded = (seed) => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

t('budget: at least 300 characters, grows with the time, capped', () => {
  assert.equal(numberRowBudget(15), 300);
  assert.equal(numberRowBudget(60), 600);
  assert.ok(numberRowBudget(120) > numberRowBudget(60));
  assert.equal(numberRowBudget(3600), 2400);
});

t('digits mode: only digits and single spaces, no leading or trailing space', () => {
  const s = numberRowText('digits', 60, seeded(1));
  assert.match(s, /^[0-9]+( [0-9]+)*$/);
  assert.ok(s.length >= numberRowBudget(60));
});

t('digits mode: every group has 2 to 6 digits and never starts with 0', () => {
  for (const g of numberRowText('digits', 120, seeded(2)).split(' ')) {
    assert.ok(g.length >= 2 && g.length <= 6, `group ${g}`);
    assert.notEqual(g[0], '0', `group ${g}`);
  }
});

t('digits mode: every digit 0 to 9 shows up in a long text', () => {
  const s = numberRowText('digits', 300, seeded(3));
  for (const d of '0123456789') assert.ok(s.includes(d), `missing ${d}`);
});

t('symbols mode: only digits, the ten shifted number-row symbols and spaces', () => {
  const s = numberRowText('symbols', 120, seeded(4));
  assert.match(s, /^[0-9!@#$%^&*() ]+$/);
});

t('symbols mode: all ten shifted symbols appear in a long text', () => {
  const s = numberRowText('symbols', 600, seeded(5));
  for (const c of '!@#$%^&*()') assert.ok(s.includes(c), `missing ${c}`);
});

t('symbols mode: a group never has two symbols in a row, and every group has a digit', () => {
  for (const g of numberRowText('symbols', 300, seeded(6)).split(' ')) {
    assert.doesNotMatch(g, /[!@#$%^&*()]{2}/, `group ${g}`);
    assert.match(g, /[0-9]/, `group ${g}`);
  }
});

t('symbols mode: a ( always has its ) and the text never starts or ends with a space', () => {
  const s = numberRowText('symbols', 300, seeded(7));
  assert.equal(s.split('(').length, s.split(')').length);
  assert.equal(s, s.trim());
});

t('the same random source gives the same text', () => {
  assert.equal(numberRowText('digits', 60, seeded(9)), numberRowText('digits', 60, seeded(9)));
  assert.notEqual(numberRowText('digits', 60, seeded(9)), numberRowText('digits', 60, seeded(10)));
});

t('hint: names the finger for a digit, matching the site finger map', () => {
  const names = ['little', 'ring', 'middle', 'index'];
  for (const d of '1234567890') {
    const f = fingerMap[d];
    assert.equal(nextKeyHint(d), `${f.hand} ${names[f.finger]} finger`, `digit ${d}`);
  }
});

t('hint: a shifted symbol names the digit finger and the Shift on the other hand', () => {
  assert.equal(nextKeyHint('%'), 'left index finger with right Shift'); // 5 is a left-hand key
  assert.equal(nextKeyHint('&'), 'right index finger with left Shift'); // 7 is a right-hand key
  assert.equal(nextKeyHint(')'), 'right little finger with left Shift'); // 0
});

t('hint: space is the thumb, anything else has no hint', () => {
  assert.equal(nextKeyHint(' '), 'thumb');
  assert.equal(nextKeyHint('a'), null);
  assert.equal(nextKeyHint(undefined), null);
});

t('digitOfKey: digits map to themselves, shifted symbols to their key, others to null', () => {
  assert.equal(digitOfKey('7'), '7');
  assert.equal(digitOfKey('&'), '7');
  assert.equal(digitOfKey(')'), '0');
  assert.equal(digitOfKey(' '), null);
  assert.equal(digitOfKey('a'), null);
});

t('digitSpeeds: averages per digit, slowest marked, in order 0 to 9', () => {
  const r = digitSpeeds({ 3: [200, 220], 8: [400, 500, 450], 1: [150, 170] });
  assert.equal(r.speeds.length, 10);
  assert.deepEqual(r.speeds.map((s) => s.digit).join(''), '0123456789');
  assert.equal(r.speeds[3].avgMs, 210);
  assert.equal(r.speeds[8].avgMs, 450);
  assert.equal(r.slowest, '8');
});

t(`digitSpeeds: a digit needs ${MIN_DIGIT_SAMPLES} presses to count; with none, slowest is null`, () => {
  const r = digitSpeeds({ 5: [300] });
  assert.equal(r.speeds[5].avgMs, null);
  assert.equal(r.slowest, null);
  assert.equal(digitSpeeds({}).slowest, null);
});

t('digitSpeeds: pauses of 2.5 s or more and non-positive gaps are ignored', () => {
  const r = digitSpeeds({ 2: [200, 210, 9000, 0, -5] });
  assert.equal(r.speeds[2].avgMs, 205);
  assert.equal(r.speeds[2].count, 2);
});

t('isNumberRowDetail: recognises the run label the speed test writes', () => {
  assert.equal(isNumberRowDetail('number row · digits · 30s'), true);
  assert.equal(isNumberRowDetail('sentences · 60s'), false);
  assert.equal(isNumberRowDetail(undefined), false);
});

console.log(`${n} tests passed`);
