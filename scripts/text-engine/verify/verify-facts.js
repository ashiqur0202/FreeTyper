// For each fact [[wikipediaTitle, ourWording, [phrases that must appear in the article]], ...] fetches the article
// (politely, with a User-Agent and a delay) and checks the phrases. Usage: node verify-facts.js <workfolder> <facts.json>
// Each fact is my own short wording. Every fact lists words/numbers that must appear in the cited Wikipedia article;
// the script fetches the article text and shows each match with its surrounding sentence so I can confirm the meaning.
const fs = require('fs'), path = require('path');
const cache = path.join(process.argv[2], 'wiki'); fs.mkdirSync(cache, { recursive: true });
const list = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
async function article(title) {
  const f = path.join(cache, title.replace(/[^a-z0-9]/gi, '_') + '.txt');
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
  const url = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=' + encodeURIComponent(title);
  let j = null; for (let attempt = 0; attempt < 5 && !j; attempt++) { await new Promise((res) => setTimeout(res, 1500 + attempt * 2500)); try { const r = await fetch(url, { headers: { 'User-Agent': 'FreeTyper-fact-check/1.0 (https://freetyper.com; one-off verification script)' }, signal: AbortSignal.timeout(60000) }); const txt = await r.text(); j = JSON.parse(txt); } catch (e) { j = null; } } if (!j) throw new Error('no response');
  const page = Object.values(j.query.pages)[0];
  const t = page.extract || ''; fs.writeFileSync(f, t); return t;
}
(async () => {
  const good = [];
  for (const [title, text, tokens] of list) {
    let t = '';
    try { t = await article(title); } catch (e) { console.log('FETCH FAIL', title, e.message); continue; }
    const low = t.toLowerCase();
    const missing = tokens.filter((k) => !low.includes(k.toLowerCase()));
    const ascii = /^[\x20-\x7e]+$/.test(text);
    if (missing.length || !ascii || t.length < 500) { console.log('CHECK', title, '| missing:', missing.join(', ') || '-', ascii ? '' : '| not ascii', t.length < 500 ? '| short article ' + t.length : ''); continue; }
    // context of the first token
    const k = tokens[0]; const i = low.indexOf(k.toLowerCase());
    const ctx = t.slice(Math.max(0, i - 90), i + k.length + 110).replace(/\s+/g, ' ');
    console.log('OK   ', title.padEnd(28), '|', text.length, '|', '...' + ctx + '...');
    good.push({ title, text, url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_')) });
  }
  fs.writeFileSync(path.join(process.argv[2], 'facts-verified.json'), JSON.stringify(good, null, 1));
  console.log('\nverified', good.length, 'of', list.length);
})();
