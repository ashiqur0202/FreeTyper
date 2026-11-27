// Run: node --experimental-strip-types --import ./scripts/register-ts.mjs scripts/test-challenge.mjs
import assert from 'node:assert/strict';
import { newSeed, parseChallenge, parseScore, parseSeconds, challengeCard, challengeImagePath, buildChallengeUrl, compareScores } from '../src/components/skills/typing/challengeLink.ts';
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };

t('newSeed: 6 lowercase letters or digits, from the given random source', () => {
  assert.match(newSeed(), /^[a-z0-9]{6}$/);
  assert.equal(newSeed(() => 0), '000000');
  assert.notEqual(newSeed(() => 0.5), newSeed(() => 0.1));
});
t('parseChallenge reads seed, score and accuracy', () => {
  assert.deepEqual(parseChallenge('?c=k3x9aq&w=62&a=96'), { seed: 'k3x9aq', mode: null, seconds: 60, level: 3, gen: 1, language: 'any', wpm: 62, accuracy: 96 });
});
t('parseChallenge: a seed alone is a challenge with no target', () => {
  assert.deepEqual(parseChallenge('?c=k3x9aq'), { seed: 'k3x9aq', mode: null, seconds: 60, level: 3, gen: 1, language: 'any', wpm: null, accuracy: null });
});
t('parseChallenge: no seed or a bad seed is not a challenge', () => {
  assert.equal(parseChallenge(''), null);
  assert.equal(parseChallenge('?w=62&a=96'), null);
  assert.equal(parseChallenge('?c=ab'), null);
  assert.equal(parseChallenge('?c=<script>'), null);
  assert.equal(parseChallenge('?c=' + 'a'.repeat(13)), null);
});
t('parseChallenge: out-of-range or odd scores are dropped, not trusted', () => {
  assert.deepEqual(parseChallenge('?c=k3x9aq&w=9999&a=96'), { seed: 'k3x9aq', mode: null, seconds: 60, level: 3, gen: 1, language: 'any', wpm: null, accuracy: null });
  assert.deepEqual(parseChallenge('?c=k3x9aq&w=0&a=96'), { seed: 'k3x9aq', mode: null, seconds: 60, level: 3, gen: 1, language: 'any', wpm: null, accuracy: null });
  assert.deepEqual(parseChallenge('?c=k3x9aq&w=62&a=140'), { seed: 'k3x9aq', mode: null, seconds: 60, level: 3, gen: 1, language: 'any', wpm: 62, accuracy: null });
  assert.deepEqual(parseChallenge('?c=k3x9aq&w=abc&a=x'), { seed: 'k3x9aq', mode: null, seconds: 60, level: 3, gen: 1, language: 'any', wpm: null, accuracy: null });
  assert.deepEqual(parseChallenge('?c=k3x9aq&w=62.7&a=96'), { seed: 'k3x9aq', mode: null, seconds: 60, level: 3, gen: 1, language: 'any', wpm: null, accuracy: null });
});
t('buildChallengeUrl rounds the score and round-trips through parseChallenge', () => {
  const url = buildChallengeUrl('https://freetyper.com', 'k3x9aq', 61.6, 95.4);
  assert.equal(url, 'https://freetyper.com/typing-challenge?c=k3x9aq&w=62&a=95');
  assert.deepEqual(parseChallenge(new URL(url).search), { seed: 'k3x9aq', mode: null, seconds: 60, level: 3, gen: 1, language: 'any', wpm: 62, accuracy: 95 });
});
t('compareScores: win, tie, behind by net WPM', () => {
  assert.deepEqual(compareScores(65, 62), { delta: 3, verdict: 'win' });
  assert.deepEqual(compareScores(62, 62), { delta: 0, verdict: 'tie' });
  assert.deepEqual(compareScores(58, 62), { delta: 4, verdict: 'behind' });
});

t('parseScore: reads w and a, drops out-of-range values, needs a score for accuracy', () => {
  assert.deepEqual(parseScore('?w=72&a=96'), { wpm: 72, accuracy: 96 });
  assert.deepEqual(parseScore('w=72'), { wpm: 72, accuracy: null });
  assert.deepEqual(parseScore('?w=9999&a=96'), { wpm: null, accuracy: null });
  assert.deepEqual(parseScore('?w=<b>&a=1'), { wpm: null, accuracy: null });
  assert.deepEqual(parseScore(''), { wpm: null, accuracy: null });
});
t('challengeCard: a score gives "Beat N WPM" and the friend line', () => {
  const c = challengeCard({ wpm: 72, accuracy: 96 });
  assert.equal(c.headline, 'Beat 72 WPM');
  assert.equal(c.title, 'Can you beat 72 WPM? | FreeTyper');
  assert.equal(c.sub, 'A friend typed 72 WPM at 96% accuracy. Same text, 60 seconds.');
  assert.match(c.description, /Free, no sign-up\.$/);
});
t('challengeCard: no accuracy leaves that part out; no score is the generic card', () => {
  assert.equal(challengeCard({ wpm: 72, accuracy: null }).sub, 'A friend typed 72 WPM. Same text, 60 seconds.');
  const g = challengeCard({ wpm: null, accuracy: null });
  assert.equal(g.headline, 'Typing challenge');
  assert.equal(g.title, 'Typing Challenge: Beat a Friend’s Score | FreeTyper');
});
t('challengeImagePath carries only the two numbers', () => {
  assert.equal(challengeImagePath({ wpm: 72, accuracy: 96 }), '/typing-challenge/og?w=72&a=96');
  assert.equal(challengeImagePath({ wpm: 72, accuracy: null }), '/typing-challenge/og?w=72');
  assert.equal(challengeImagePath({ wpm: null, accuracy: null }), '/typing-challenge/og');
});

t('parseChallenge: m and d together make a typed challenge; alone or odd they fall back to the older 60 s link', () => {
  assert.deepEqual(parseChallenge('?c=k3x9aq&w=72&a=96&m=words&d=30'), { seed: 'k3x9aq', mode: 'words', seconds: 30, level: 3, gen: 1, language: 'any', wpm: 72, accuracy: 96 });
  assert.deepEqual(parseChallenge('?c=k3x9aq&m=code&d=300'), { seed: 'k3x9aq', mode: 'code', seconds: 300, level: 3, gen: 1, language: 'any', wpm: null, accuracy: null });
  for (const odd of ['&m=words', '&d=30', '&m=words&d=45', '&m=<b>&d=30', '&m=words&d=9999', '&m=words&d=3.5']) {
    const c = parseChallenge('?c=k3x9aq&w=72&a=96' + odd);
    assert.equal(c.mode, null, odd);
    assert.equal(c.seconds, 60, odd);
  }
});
t('buildChallengeUrl adds m and d only for a typed run, and round-trips', () => {
  assert.equal(buildChallengeUrl('https://freetyper.com', 'k3x9aq', 72, 96), 'https://freetyper.com/typing-challenge?c=k3x9aq&w=72&a=96');
  const url = buildChallengeUrl('https://freetyper.com', 'k3x9aq', 71.6, 95.4, 'sentences', 120);
  assert.equal(url, 'https://freetyper.com/typing-challenge?c=k3x9aq&w=72&a=95&m=sentences&d=120&l=3');
  assert.deepEqual(parseChallenge(new URL(url).search), { seed: 'k3x9aq', mode: 'sentences', seconds: 120, level: 3, gen: 1, language: 'any', wpm: 72, accuracy: 95 });
});
t('the difficulty rides in the link: l=1 to 5, and a missing or odd l is standard (3) forever', () => {
  for (const lv of [1, 2, 3, 4, 5]) {
    const url = buildChallengeUrl('https://freetyper.com', 'k3x9aq', 60, 97, 'words', 30, lv);
    assert.ok(url.endsWith('&m=words&d=30&l=' + lv));
    assert.equal(parseChallenge(new URL(url).search).level, lv);
  }
  const base = '?c=k3x9aq&w=72&a=96&m=sentences&d=60';
  assert.equal(parseChallenge(base).level, 3);
  for (const odd of ['&l=0', '&l=6', '&l=x', '&l=', '&l=2.5', '&l=-1', '&l=33']) assert.equal(parseChallenge(base + odd).level, 3, odd);
  // an older link (no m and d) is the fixed-passage kind and has no level of its own
  assert.equal(parseChallenge('?c=k3x9aq&w=72&a=96&l=5').mode, null);
  assert.equal(parseChallenge('?c=k3x9aq&w=72&a=96&l=5').level, 3);
});
t('parseSeconds: an allowed d, else 60', () => {
  assert.equal(parseSeconds('?d=30'), 30);
  assert.equal(parseSeconds('?d=45'), 60);
  assert.equal(parseSeconds(''), 60);
});
t('challengeCard and image path follow the run length', () => {
  assert.equal(challengeCard({ wpm: 72, accuracy: 96 }, 30).sub, 'A friend typed 72 WPM at 96% accuracy. Same text, 30 seconds.');
  assert.equal(challengeCard({ wpm: 72, accuracy: 96 }, 120).sub, 'A friend typed 72 WPM at 96% accuracy. Same text, 2 minutes.');
  assert.equal(challengeCard({ wpm: null, accuracy: null }, 30).footer, 'Free · No sign-up · Takes 30 seconds');
  assert.equal(challengeImagePath({ wpm: 72, accuracy: 96 }, 30), '/typing-challenge/og?w=72&a=96&d=30');
  assert.equal(challengeImagePath({ wpm: null, accuracy: null }, 30), '/typing-challenge/og?d=30');
});
t('text version: no g is version 1 (old links keep their text), g=2 is version 2', () => {
  assert.equal(parseChallenge('?c=k3x9aq&m=words&d=30').gen, 1);
  assert.equal(parseChallenge('?c=k3x9aq&m=standard&d=30&g=2').mode, 'standard');
  assert.equal(parseChallenge('?c=k3x9aq&m=standard&d=30&g=2').gen, 2);
  // standard is a version 2 text type, so an old link naming it falls back to the older 60 s link
  assert.equal(parseChallenge('?c=k3x9aq&m=standard&d=30').mode, null);
});
t('code language: only a version 2 code link carries k', () => {
  assert.equal(parseChallenge('?c=k3x9aq&m=code&d=30&g=2&k=python').language, 'python');
  assert.equal(parseChallenge('?c=k3x9aq&m=code&d=30&g=2&k=cobol').language, 'any');
  assert.equal(parseChallenge('?c=k3x9aq&m=code&d=30&k=python').language, 'any');
  assert.equal(parseChallenge('?c=k3x9aq&m=words&d=30&g=2&k=python').language, 'any');
  assert.match(buildChallengeUrl('https://freetyper.com', 'k3x9aq', 60, 95, 'code', 30, 3, 2, 'python'), /&g=2&k=python$/);
  assert.doesNotMatch(buildChallengeUrl('https://freetyper.com', 'k3x9aq', 60, 95, 'code', 30, 3, 2, 'any'), /&k=/);
});
console.log(`\n${n} passed`);
