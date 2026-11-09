// Run: node --experimental-strip-types scripts/test-typing-target.mjs
import assert from 'node:assert/strict';
import { ignoresTyping } from '../src/components/skills/typing/typingTarget.ts';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok -', name); };
// A tiny stand-in for a DOM element: closest() answers for the marker selector only.
const el = (marked) => ({ closest: (sel) => (sel === '[data-typing-ignore]' && marked ? {} : null) });

t('a marked element, or one inside a marked area, is ignored by the typing test', () => {
  assert.equal(ignoresTyping(el(true)), true);
});
t('an unmarked element is not ignored', () => assert.equal(ignoresTyping(el(false)), false));
t('no target (null) is not ignored', () => assert.equal(ignoresTyping(null), false));
t('a target without closest() (such as window) is not ignored', () => assert.equal(ignoresTyping({}), false));

console.log(`${n} tests passed`);
