// Tell IndexNow search engines (Bing, Yandex, ...) that URLs were added or changed.
// Usage: node scripts/indexnow.mjs <url> [<url> ...]   (changed URLs only)
//        node scripts/indexnow.mjs --all                (every URL in the live sitemap; use once, not per release)
// The key is public by design: it is served at https://freetyper.com/<key>.txt
const KEY = 'bc0913c67f5d7b38b5f9f5ec8d2c412e';
const HOST = 'freetyper.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

let urls = process.argv.slice(2);
if (urls[0] === '--all') {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
if (urls.length === 0) {
  console.error('No URLs given.');
  process.exit(1);
}
const bad = urls.filter((u) => new URL(u).host !== HOST);
if (bad.length) {
  console.error('URLs not on ' + HOST + ':', bad.join(', '));
  process.exit(1);
}

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, urlList: urls }),
});
console.log(`IndexNow: ${urls.length} URL(s) -> HTTP ${res.status}`);
if (res.status !== 200 && res.status !== 202) process.exit(1);
