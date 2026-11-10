// Run: node --experimental-strip-types scripts/test-certificate.mjs
import assert from 'node:assert/strict';
import {
  CERT_MIN_SECONDS,
  CERT_MIN_ACCURACY,
  canIssueCertificate,
  cleanCertificateName,
  durationWords,
  certificateFileName,
  usesScriptFont,
} from '../src/components/skills/typing/certificateRules.ts';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };
const run = (over = {}) => ({ mode: 'speed-test', duration: 60, accuracy: 96, wpm: 68, ...over });

t('the thresholds are 30 seconds and 90 percent', () => {
  assert.equal(CERT_MIN_SECONDS, 30);
  assert.equal(CERT_MIN_ACCURACY, 90);
});

t('a 60 s speed test at 96% qualifies', () => assert.equal(canIssueCertificate(run()), true));

t('the limits are inclusive: exactly 30 s and exactly 90% qualify', () => {
  assert.equal(canIssueCertificate(run({ duration: 30, accuracy: 90 })), true);
});

t('just under either limit does not qualify', () => {
  assert.equal(canIssueCertificate(run({ duration: 29 })), false);
  assert.equal(canIssueCertificate(run({ accuracy: 89 })), false);
});

t('only speed tests qualify, not lessons, practice or games', () => {
  for (const mode of ['lesson', 'practice', 'game']) assert.equal(canIssueCertificate(run({ mode })), false);
});

t('a zero-speed run does not qualify', () => assert.equal(canIssueCertificate(run({ wpm: 0 })), false));

t('names: spaces collapse, edges trim, control characters go', () => {
  assert.equal(cleanCertificateName('  Ashiqur   Rahman \n'), 'Ashiqur Rahman');
  assert.equal(cleanCertificateName('Ana\u0000\u0007 Lee'), 'Ana Lee');
});

t('names: at most 40 characters, and an empty name becomes Typist', () => {
  assert.equal(cleanCertificateName('x'.repeat(60)).length, 40);
  assert.equal(cleanCertificateName('   '), 'Typist');
  assert.equal(cleanCertificateName(''), 'Typist');
});

t('durationWords reads naturally', () => {
  assert.equal(durationWords(15), '15-second');
  assert.equal(durationWords(60), '1-minute');
  assert.equal(durationWords(300), '5-minute');
  assert.equal(durationWords(90), '1 min 30 s');
});

t('file name: speed and a safe name slug', () => {
  assert.equal(certificateFileName('Ashiqur Rahman', 68), 'freetyper-certificate-ashiqur-rahman-68wpm.png');
  assert.equal(certificateFileName('Typist', 41), 'freetyper-certificate-typist-41wpm.png');
  assert.equal(certificateFileName('***', 50), 'freetyper-certificate-50wpm.png');
});

t('script font is for Latin names only; other alphabets use the device font', () => {
  assert.equal(usesScriptFont('Ashiqur Rahman'), true);
  assert.equal(usesScriptFont("Zoë O'Neil-Smith"), true);
  assert.equal(usesScriptFont('আশিকুর রহমান'), false);
  assert.equal(usesScriptFont('Ana Ж'), false);
});


t('a number row run never qualifies, however good', () => {
  assert.equal(canIssueCertificate(run({ modeDetail: 'number row · digits · 30s', accuracy: 100 })), false);
  assert.equal(canIssueCertificate(run({ modeDetail: 'number row · symbols · 60s' })), false);
});

t('an ordinary run with a modeDetail still qualifies', () => {
  assert.equal(canIssueCertificate(run({ modeDetail: 'sentences' })), true);
});
console.log(`${n} tests passed`);
