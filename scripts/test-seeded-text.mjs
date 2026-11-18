// Run: node --experimental-strip-types --import ./scripts/register-ts.mjs scripts/test-seeded-text.mjs
import assert from 'node:assert/strict';
import { seededTestText, generateTestText } from '../src/components/skills/typing/testText.ts';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };

t('seededTestText: same seed, mode and length give the same passage; changing any of them changes it', () => {
  for (const mode of ['words', 'sentences', 'code']) {
    const a = seededTestText(mode, 60, 'k3x9aq');
    assert.equal(a, seededTestText(mode, 60, 'k3x9aq'));
    assert.ok(a.split(/\s+/).length >= 150, mode);
    assert.notEqual(a, seededTestText(mode, 60, 'k3x9ar'));
  }
  assert.notEqual(seededTestText('words', 60, 'k3x9aq'), seededTestText('sentences', 60, 'k3x9aq'));
  assert.notEqual(seededTestText('words', 15, 'k3x9aq'), seededTestText('words', 120, 'k3x9aq'));
});
t('seededTestText: words mode builds the full word budget with only real words', () => {
  const words = seededTestText('words', 60, 'abc123').split(' ');
  assert.equal(words.length, 300);
  assert.ok(words.every((w) => /^[a-z']+$/i.test(w)));
});
t('generateTestText without a seed still varies between calls', () => {
  assert.notEqual(generateTestText('words', 60), generateTestText('words', 60));
});

console.log(`
${n} passed`);
