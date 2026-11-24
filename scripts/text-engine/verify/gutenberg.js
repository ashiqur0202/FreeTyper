// Fetches a public-domain book from a Project Gutenberg mirror into the work folder (first argument).
// Fetches public-domain books from a Project Gutenberg mirror and caches them, so quotes can be checked against the real text.
const fs = require('fs'), path = require('path');
const cacheDir = path.join(process.argv[2] || '.', 'books');
fs.mkdirSync(cacheDir, { recursive: true });

async function tryFetch(url) {
  try { const r = await fetch(url, { signal: AbortSignal.timeout(60000) }); if (!r.ok) return null; return await r.text(); } catch { return null; }
}
async function getBook(id) {
  const file = path.join(cacheDir, id + '.txt');
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  const dir = String(id).length > 1 ? String(id).slice(0, -1).split('').join('/') : '0';
  for (const name of [`${id}-0.txt`, `${id}.txt`, `${id}-8.txt`]) {
    const t = await tryFetch(`https://gutenberg.pglaf.org/${dir}/${id}/${name}`);
    if (t && t.length > 2000) { fs.writeFileSync(file, t); return t; }
  }
  return null;
}
module.exports = { getBook };

if (require.main === module) {
  (async () => {
    const ids = [2680, 1342, 11, 12, 1661, 205, 2944, 148, 132, 21, 2701, 1400, 98, 76, 74, 174, 46, 84, 16, 55, 100, 1322, 1, 5, 2814, 1232, 1727, 3600, 4300];
    for (const id of ids) {
      const t = await getBook(id);
      if (!t) { console.log(id, 'NOT FETCHED'); continue; }
      const title = (t.match(/Title:\s*(.+)/) || [])[1];
      const author = (t.match(/Author:\s*(.+)/) || [])[1];
      console.log(String(id).padEnd(5), (title || '?').trim().slice(0, 60).padEnd(60), '|', (author || '?').trim().slice(0, 30), '|', Math.round(t.length / 1000) + 'k');
    }
  })();
}
