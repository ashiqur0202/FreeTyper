import { pickOne, pickWeighted, type Rand } from './rng';

/**
 * Makes short code to type, in five languages. It is built from templates with names and numbers filled in, so no
 * two snippets are the same. A snippet has to be typeable as plain text with no Enter key, so every snippet is one
 * line: statements are joined with a space or a semicolon.
 *
 * Names are tracked inside a snippet: a name is declared once and later statements use names that exist, so the
 * JavaScript is valid (no `let x` twice). In Python a compound statement (for, if, def) cannot follow a semicolon,
 * so such a snippet is that one statement alone.
 *
 * What changes with the level: Beginner is short statements; Intermediate adds functions, conditions and loops;
 * Advanced adds arrow functions, objects, queries with several parts, and more symbols. Tests run JavaScript and
 * Python snippets through the real parsers.
 */

export type CodeLanguage = 'js' | 'python' | 'sql' | 'css' | 'html';

export const CODE_LANGUAGE_NAMES: Record<CodeLanguage, string> = {
  js: 'JavaScript',
  python: 'Python',
  sql: 'SQL',
  css: 'CSS',
  html: 'HTML',
};

export interface CodeRequest {
  /** 0 Beginner, 1 Intermediate, 2 Advanced. */
  level: 0 | 1 | 2;
  /** How much a letter should be practised; names are chosen to favour weak keys. */
  weight: (letter: string) => number;
  /** Stop once the text has at least this many characters. */
  targetChars: number;
  rand: Rand;
  language?: CodeLanguage;
}

export interface CodeText {
  text: string;
  language: CodeLanguage;
}

const NOUNS = ['user', 'item', 'price', 'total', 'count', 'name', 'age', 'list', 'score', 'level', 'value', 'index', 'result', 'data', 'size', 'color', 'width', 'height', 'title', 'page', 'order', 'email', 'city', 'speed', 'money', 'path', 'step', 'rate', 'limit', 'cart', 'task', 'note', 'team', 'game', 'tag'];
const VERBS = ['get', 'set', 'add', 'remove', 'update', 'find', 'load', 'save', 'show', 'hide', 'check', 'make', 'format', 'parse', 'clear', 'reset', 'toggle', 'build', 'send'];
const WORDS = ['hello', 'world', 'typing', 'quick', 'green', 'blue', 'ready', 'start', 'done', 'apple', 'river', 'happy', 'sunny', 'light', 'paper', 'garden'];
const TABLES = ['users', 'items', 'orders', 'products', 'tasks', 'scores', 'teams', 'notes', 'games', 'cities'];
const COLORS = ['red', 'blue', 'green', 'black', 'gray', 'orange', 'purple', 'white'];
const TAGS = ['p', 'b', 'em', 'h1', 'h2', 'li', 'span'];

interface Ctx {
  r: Rand;
  weight: (letter: string) => number;
  level: 0 | 1 | 2;
  /** Every name declared in this snippet (variables and functions). */
  declared: string[];
  /** Just the variables, which later statements may use. */
  vars: string[];
}

function score(ctx: Ctx, w: string): number {
  let s = 0;
  for (const ch of w) s += ctx.weight(ch);
  return Math.pow(s / Math.max(1, w.length), 1.5);
}

function name(ctx: Ctx, list: readonly string[], not: readonly string[] = []): string {
  const usable = list.filter((w) => !not.includes(w));
  return pickWeighted(usable.length ? usable : list, (w) => score(ctx, w), ctx.r);
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** A fresh variable name (not declared yet): one word, or two joined (camelCase, snake_case in Python) from Intermediate. */
function declare(ctx: Ctx, style: 'camel' | 'snake'): string {
  for (let i = 0; i < 40; i++) {
    const a = name(ctx, NOUNS);
    let id = a;
    if (ctx.level > 0 && ctx.r() < 0.45) {
      const b = name(ctx, NOUNS, [a]);
      id = style === 'camel' ? a + cap(b) : a + '_' + b;
    }
    if (!ctx.declared.includes(id)) {
      ctx.declared.push(id);
      ctx.vars.push(id);
      return id;
    }
  }
  const fallback = `item${ctx.declared.length + 1}`;
  ctx.declared.push(fallback);
  ctx.vars.push(fallback);
  return fallback;
}

/** A name that already exists in the snippet (or a fresh one when nothing is declared yet). */
function existing(ctx: Ctx, style: 'camel' | 'snake'): string {
  return ctx.vars.length ? pickOne(ctx.vars, ctx.r) : declare(ctx, style);
}

function fnName(ctx: Ctx, style: 'camel' | 'snake'): string {
  for (let i = 0; i < 40; i++) {
    const v = name(ctx, VERBS);
    const n = name(ctx, NOUNS);
    const id = style === 'camel' ? v + cap(n) : v + '_' + n;
    if (!ctx.declared.includes(id)) {
      ctx.declared.push(id);
      return id;
    }
  }
  return `run${ctx.declared.length}`;
}

function num(ctx: Ctx, max = 99): number {
  return 1 + Math.floor(ctx.r() * (ctx.level === 0 ? 9 : max));
}

type Template = {
  level: 0 | 1 | 2;
  make: (c: Ctx) => string;
  /** A statement that must stand alone on its line (Python for, if, def). */
  alone?: boolean;
};

const JS: Template[] = [
  { level: 0, make: (c) => `let ${declare(c, 'camel')} = ${num(c)};` },
  { level: 0, make: (c) => `const ${declare(c, 'camel')} = "${name(c, WORDS)}";` },
  { level: 0, make: (c) => `console.log(${existing(c, 'camel')});` },
  { level: 0, make: (c) => { const a = existing(c, 'camel'); return `${a} = ${a} + ${num(c)};`; } },
  { level: 1, make: (c) => { const x = name(c, NOUNS); const y = name(c, NOUNS, [x]); return `function ${fnName(c, 'camel')}(${x}, ${y}) { return ${x} + ${y}; }`; } },
  { level: 1, make: (c) => { const a = existing(c, 'camel'); return `if (${a} > ${num(c)}) { ${a} = 0; }`; } },
  { level: 1, make: (c) => `for (let i = 0; i < ${num(c, 20)}; i++) { console.log(i); }` },
  { level: 1, make: (c) => `const ${declare(c, 'camel')} = [${num(c)}, ${num(c)}, ${num(c)}];` },
  { level: 1, make: (c) => { const a = existing(c, 'camel'); return `while (${a} < ${num(c, 50)}) { ${a}++; }`; } },
  { level: 2, make: (c) => { const x = name(c, NOUNS); return `const ${fnName(c, 'camel')} = (${x}) => ${x} * ${num(c, 20)};`; } },
  { level: 2, make: (c) => { const src = existing(c, 'camel'); return `const { ${declare(c, 'camel')}, ${declare(c, 'camel')} } = ${src};`; } },
  { level: 2, make: (c) => { const a = name(c, NOUNS); const b = name(c, NOUNS, [a]); return `const ${declare(c, 'camel')} = { ${a}: ${num(c)}, ${b}: "${name(c, WORDS)}" };`; } },
  { level: 2, make: (c) => { const src = existing(c, 'camel'); return `const ${declare(c, 'camel')} = ${src}.map((n) => n + ${num(c, 9)}).filter(Boolean);`; } },
  { level: 2, make: (c) => `async function ${fnName(c, 'camel')}() { const res = await fetch("/api/${name(c, NOUNS)}"); return res.json(); }` },
  { level: 2, make: (c) => `try { ${fnName(c, 'camel')}(); } catch (err) { console.error(err); }` },
  { level: 2, make: (c) => `const ${declare(c, 'camel')} = ${num(c)} > ${num(c)} ? "${name(c, WORDS)}" : "${name(c, WORDS, [])}";` },
];

const PY: Template[] = [
  { level: 0, make: (c) => `${declare(c, 'snake')} = ${num(c)}` },
  { level: 0, make: (c) => `print("${name(c, WORDS)}")` },
  { level: 0, make: (c) => `${declare(c, 'snake')} = "${name(c, WORDS)}"` },
  { level: 1, make: (c) => `${declare(c, 'snake')} = [${num(c)}, ${num(c)}, ${num(c)}]` },
  { level: 1, make: (c) => { const a = existing(c, 'snake'); return `${a} = ${a} + ${num(c)}`; } },
  { level: 1, make: (c) => `print(len(${existing(c, 'snake')}))` },
  { level: 1, alone: true, make: (c) => `for i in range(${num(c, 20)}): print(i)` },
  { level: 1, alone: true, make: (c) => `if ${existing(c, 'snake')} > ${num(c)}: print("${name(c, WORDS)}")` },
  { level: 2, make: (c) => `squares = [n * n for n in range(${num(c, 20)})]` },
  { level: 2, make: (c) => `${fnName(c, 'snake')} = lambda n: n + ${num(c, 20)}` },
  { level: 2, make: (c) => { const a = name(c, NOUNS); const b = name(c, NOUNS, [a]); return `${declare(c, 'snake')} = {"${a}": ${num(c)}, "${b}": "${name(c, WORDS)}"}`; } },
  { level: 2, make: (c) => `names = [w.upper() for w in ["${name(c, WORDS)}", "${name(c, WORDS)}"]]` },
  { level: 2, alone: true, make: (c) => { const x = name(c, NOUNS); return `def ${fnName(c, 'snake')}(${x}, step=${num(c, 9)}): return ${x} * step`; } },
];

const SQL: Template[] = [
  { level: 0, make: (c) => `SELECT * FROM ${pickOne(TABLES, c.r)};` },
  { level: 0, make: (c) => `SELECT ${name(c, NOUNS)} FROM ${pickOne(TABLES, c.r)};` },
  { level: 0, make: (c) => `SELECT * FROM ${pickOne(TABLES, c.r)} LIMIT ${num(c)};` },
  { level: 1, make: (c) => { const a = name(c, NOUNS); const b = name(c, NOUNS, [a]); return `SELECT ${a}, ${b} FROM ${pickOne(TABLES, c.r)} WHERE ${a} > ${num(c)};`; } },
  { level: 1, make: (c) => `SELECT COUNT(*) FROM ${pickOne(TABLES, c.r)};` },
  { level: 1, make: (c) => `SELECT * FROM ${pickOne(TABLES, c.r)} ORDER BY ${name(c, NOUNS)};` },
  { level: 2, make: (c) => { const k = name(c, NOUNS); return `SELECT ${k}, SUM(${name(c, NOUNS, [k])}) FROM ${pickOne(TABLES, c.r)} GROUP BY ${k} ORDER BY ${k} DESC;`; } },
  { level: 2, make: (c) => `UPDATE ${pickOne(TABLES, c.r)} SET ${name(c, NOUNS)} = '${name(c, WORDS)}' WHERE id = ${num(c)};` },
  { level: 2, make: (c) => { const a = name(c, NOUNS); const b = name(c, NOUNS, [a]); return `INSERT INTO ${pickOne(TABLES, c.r)} (${a}, ${b}) VALUES ('${name(c, WORDS)}', ${num(c)});`; } },
];

const CSS: Template[] = [
  { level: 0, make: (c) => `.${name(c, NOUNS)} { color: ${pickOne(COLORS, c.r)}; }` },
  { level: 0, make: (c) => `${pickOne(['p', 'h1', 'a', 'li', 'body'], c.r)} { color: ${pickOne(COLORS, c.r)}; }` },
  { level: 0, make: () => `body { margin: 0; }` },
  { level: 1, make: (c) => `.${name(c, NOUNS)} { margin: ${num(c, 30)}px; padding: ${num(c, 30)}px; }` },
  { level: 1, make: (c) => `#${name(c, NOUNS)} { width: ${num(c, 90)}%; height: ${num(c, 90)}px; }` },
  { level: 2, make: (c) => `.${name(c, NOUNS)}:hover > a { background: ${pickOne(COLORS, c.r)}; border-radius: ${num(c, 20)}px; }` },
  { level: 2, make: (c) => `@media (max-width: ${100 + num(c, 90) * 10}px) { .${name(c, NOUNS)} { display: none; } }` },
];

const HTML: Template[] = [
  { level: 0, make: (c) => { const t = pickOne(TAGS, c.r); return `<${t}>${cap(name(c, WORDS))}</${t}>`; } },
  { level: 1, make: (c) => `<a href="/${name(c, NOUNS)}">${cap(name(c, WORDS))}</a>` },
  { level: 1, make: (c) => { const a = name(c, WORDS); return `<ul><li>${a}</li><li>${name(c, WORDS, [a])}</li></ul>`; } },
  { level: 2, make: (c) => `<div class="${name(c, NOUNS)}"><button type="button" onclick="${fnName(c, 'camel')}()">${cap(name(c, WORDS))}</button></div>` },
  { level: 2, make: (c) => `<input type="text" name="${name(c, NOUNS)}" placeholder="${cap(name(c, WORDS))}">` },
];

const BY_LANGUAGE: Record<CodeLanguage, { templates: Template[]; join: string }> = {
  js: { templates: JS, join: ' ' },
  python: { templates: PY, join: '; ' },
  sql: { templates: SQL, join: ' ' },
  css: { templates: CSS, join: ' ' },
  html: { templates: HTML, join: ' ' },
};

/** The languages a level may get: Beginner skips SQL (it needs the most symbols and words). */
function languagesFor(level: 0 | 1 | 2): CodeLanguage[] {
  return level === 0 ? ['js', 'python', 'html', 'css'] : ['js', 'python', 'sql', 'css', 'html'];
}

export function generateCode(req: CodeRequest): CodeText {
  const language = req.language ?? pickOne(languagesFor(req.level), req.rand);
  const { templates, join } = BY_LANGUAGE[language];
  const ctx: Ctx = { r: req.rand, weight: req.weight, level: req.level, declared: [], vars: [] };
  const usable = templates.filter((t) => t.level <= req.level);
  const chain = usable.filter((t) => !t.alone);
  // the newest level of the typist weighs most, so Advanced gets mostly advanced shapes
  const weightOf = (t: Template) => (t.level === req.level ? 3 : 1);

  // Python: a for, if or def cannot follow a semicolon, so now and then the whole snippet is one such statement
  const alone = usable.filter((t) => t.alone);
  if (language === 'python' && alone.length && req.rand() < 0.2) {
    return { text: pickWeighted(alone, weightOf, req.rand).make(ctx), language };
  }

  const parts: string[] = [];
  let total = 0;
  for (let guard = 0; total < req.targetChars && guard < 40; guard++) {
    let piece = pickWeighted(chain, weightOf, req.rand).make(ctx);
    // no statement twice in one snippet
    for (let tries = 0; tries < 6 && parts.includes(piece); tries++) piece = pickWeighted(chain, weightOf, req.rand).make(ctx);
    if (parts.includes(piece)) continue;
    parts.push(piece);
    total += piece.length + join.length;
  }
  return { text: parts.join(join), language };
}
