// Run: node --experimental-strip-types scripts/test-challenge.mjs
import assert from 'node:assert/strict';
import { newSeed, parseChallenge, parseScore, challengeCard, challengeImagePath, buildChallengeUrl, compareScores } from '../src/components/skills/typing/challengeLink.ts';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };

t('newSeed: 6 lowercase letters or digits, from the given random source', () => {
  assert.match(newSeed(), /^[a-z0-9]{6}$/);
  assert.equal(newSeed(() => 0), '000000');
  assert.notEqual(newSeed(() => 0.5), newSeed(() => 0.1));
});
t('parseChallenge reads seed, score and accuracy', () => {
  assert.deepEqual(parseChallenge('?c=k3x9aq&w=62&a=96'), { seed: 'k3x9aq', wpm: 62, accuracy: 96 });
});
t('parseChallenge: a seed alone is a challenge with no target', () => {
  assert.deepEqual(parseChallenge('?c=k3x9aq'), { seed: 'k3x9aq', wpm: null, accuracy: null });
});
t('parseChallenge: no seed or a bad seed is not a challenge', () => {
  assert.equal(parseChallenge(''), null);
  assert.equal(parseChallenge('?w=62&a=96'), null);
  assert.equal(parseChallenge('?c=ab'), null);
  assert.equal(parseChallenge('?c=<script>'), null);
  assert.equal(parseChallenge('?c=' + 'a'.repeat(13)), null);
});
t('parseChallenge: out-of-range or odd scores are dropped, not trusted', () => {
  assert.deepEqual(parseChallenge('?c=k3x9aq&w=9999&a=96'), { seed: 'k3x9aq', wpm: null, accuracy: null });
  assert.deepEqual(parseChallenge('?c=k3x9aq&w=0&a=96'), { seed: 'k3x9aq', wpm: null, accuracy: null });
  assert.deepEqual(parseChallenge('?c=k3x9aq&w=62&a=140'), { seed: 'k3x9aq', wpm: 62, accuracy: null });
  assert.deepEqual(parseChallenge('?c=k3x9aq&w=abc&a=x'), { seed: 'k3x9aq', wpm: null, accuracy: null });
  assert.deepEqual(parseChallenge('?c=k3x9aq&w=62.7&a=96'), { seed: 'k3x9aq', wpm: null, accuracy: null });
});
t('buildChallengeUrl rounds the score and round-trips through parseChallenge', () => {
  const url = buildChallengeUrl('https://freetyper.com', 'k3x9aq', 61.6, 95.4);
  assert.equal(url, 'https://freetyper.com/typing-challenge?c=k3x9aq&w=62&a=95');
  assert.deepEqual(parseChallenge(new URL(url).search), { seed: 'k3x9aq', wpm: 62, accuracy: 95 });
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

console.log(`\n${n} passed`);
