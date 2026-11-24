// Checks that every quote in a JSON list [[gutenbergId, text, author, work, note], ...] is an exact piece of its book.
// Usage: node verify-quotes.js <workfolder> <quotes.json>   (fetch the books first with gutenberg.js)
// Checks every quote is an exact, contiguous piece of its source text (after turning curly quotes and dashes into plain ASCII).
const fs = require('fs'), path = require('path');
const dir = path.join(process.argv[2], 'books');
const norm = (t) => t.replace(/\r/g, '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/—|–/g, ' - ').replace(/--/g, ' - ').replace(/_/g, '').replace(/\s+/g, ' ');
const books = {};
const list = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
let ok = 0, bad = 0;
const result = [];
for (const [id, text, author, work, note] of list) {
  if (!books[id]) books[id] = norm(fs.readFileSync(path.join(dir, id + '.txt'), 'utf8'));
  const found = books[id].includes(text);
  const ascii = /^[\x20-\x7e]+$/.test(text);
  if (found && ascii) { ok++; result.push({ id, text, author, work, note, gutenberg: id }); }
  else { bad++; console.log('NOT VERIFIED', id, !found ? '(not in source)' : '(not ASCII)', '|', text.slice(0, 80)); }
}
console.log('verified', ok, 'of', ok + bad);
fs.writeFileSync(path.join(process.argv[2], 'quotes-verified.json'), JSON.stringify(result, null, 1));
