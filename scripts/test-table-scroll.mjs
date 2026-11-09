// A wide guide table must scroll inside itself, never widen the page on a phone.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const css = readFileSync(new URL('../src/app/globals.css', import.meta.url), 'utf8');
const rule = /\.blog-article table\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';

assert.ok(rule, 'table rule exists');
assert.match(rule, /display:\s*block/, 'table is a block so it can scroll');
assert.match(rule, /overflow-x:\s*auto/, 'table scrolls sideways inside itself');
assert.match(rule, /max-width:\s*100%/, 'table never exceeds its column');
console.log('table scroll: 3/3');
