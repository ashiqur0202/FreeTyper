// Runs every text engine check. Run: node scripts/text-engine/check.js   (or: npm run check:text)
const cp = require('child_process');
const work = require('os').tmpdir() + '/freetyper-text-engine';
let failed = 0;
for (const f of ['engine-check.js', 'code-check.js', 'library-check.js']) {
  console.log('\n=== ' + f);
  const r = cp.spawnSync('node', [require('path').join(__dirname, f), work], { stdio: 'inherit' });
  if (r.status !== 0) { failed++; console.log('FAILED: ' + f); }
}
console.log(failed ? '\n' + failed + ' check(s) failed' : '\nall text engine checks passed');
process.exit(failed ? 1 : 0);
