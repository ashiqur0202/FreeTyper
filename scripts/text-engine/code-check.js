// Code generator check: JavaScript snippets are parsed with node, Python with Python's ast (needs `python`), CSS, HTML and SQL by structure.
// Run: node scripts/text-engine/code-check.js
process.argv[2] = process.argv[2] || require('os').tmpdir() + '/freetyper-text-engine';
require('fs').mkdirSync(process.argv[2], { recursive: true });
// CSS/HTML/SQL with structure checks. Also prints samples per level.
const ts = require('typescript');
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const root = require('path').join(__dirname, '..', '..', 'src', 'components', 'skills', 'typing') + '/';
const out = process.argv[2] + '/eng/';
for (const rel of ['engine/rng', 'engine/code']) {
  const src = fs.readFileSync(root + rel + '.ts', 'utf8');
  const dest = out + rel + '.js'; fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, ts.transpileModule(src, { compilerOptions: { module: 'commonjs', target: 'es2019' } }).outputText);
}
const C = require(out + 'engine/code.js'), R = require(out + 'engine/rng.js');
let bad = 0; const fail = (m) => { bad++; if (bad < 12) console.log('FAIL', m); };
const py = [];
const counts = {};
for (const language of ['js', 'python', 'sql', 'css', 'html']) {
  for (const level of [0, 1, 2]) {
    for (let i = 0; i < 400; i++) {
      const { text } = C.generateCode({ level, language, weight: () => 1, targetChars: 60 + (i % 4) * 60, rand: R.seeded(language + level + i) });
      counts[language] = (counts[language] || 0) + 1;
      if (!/^[\x20-\x7e]+$/.test(text)) fail('non-ascii ' + text);
      if (text.length < 8) fail('too short ' + language + ' ' + text);
      if (language === 'js') { try { new vm.Script(text); } catch (e) { fail('js ' + e.message + ' :: ' + text); } }
      else if (language === 'python') py.push(text);
      else if (language === 'css') { if ((text.match(/{/g) || []).length !== (text.match(/}/g) || []).length) fail('css braces ' + text); }
      else if (language === 'html') { const o = (text.match(/<[a-z]+/g) || []).filter((t) => !['<input', '<a'].includes(t) || true).length; const cl = (text.match(/<\/[a-z0-9]+>/g) || []).length; if (!text.startsWith('<')) fail('html ' + text); if (cl === 0 && !text.includes('<input')) fail('html no closing ' + text); }
      else if (language === 'sql') { if (!/;$/.test(text)) fail('sql no semicolon ' + text); if ((text.match(/'/g) || []).length % 2) fail('sql quotes ' + text); }
    }
  }
}
// Python: parse with the real parser
fs.writeFileSync(process.argv[2] + '/py-snippets.json', JSON.stringify(py));
const pyres = cp.spawnSync('python', ['-c', "import ast,json,sys\nxs=json.load(open(sys.argv[1]))\nbad=[]\nfor x in xs:\n    try: ast.parse(x)\n    except SyntaxError as e: bad.append((x,str(e)))\nprint(len(xs),'python snippets,',len(bad),'bad')\nfor b in bad[:8]: print(b)", process.argv[2] + '/py-snippets.json'], { encoding: 'utf8' });
console.log(pyres.stdout.trim(), pyres.stderr.trim());
if (/ 0 bad/.test(pyres.stdout) === false) bad++;
console.log('snippets per language', JSON.stringify(counts), '| failures', bad);
for (const level of [0, 1, 2]) {
  console.log('\n[level ' + level + ']');
  for (const language of ['js', 'python', 'sql', 'css', 'html']) console.log('  ' + language.padEnd(6), C.generateCode({ level, language, weight: () => 1, targetChars: 90, rand: R.seeded('show' + language + level) }).text);
}
process.exit(bad ? 1 : 0);
