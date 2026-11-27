// An empty, unmigrated database on port 54330, to test that the server creates the tables itself on its first account request.
// Run from the repo root: node scripts/qa-accounts/empty-db.mjs
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
const client = await PGlite.create();
const server = new PGLiteSocketServer({ db: client, port: 54330, host: '127.0.0.1', maxConnections: 8 });
await server.start();
console.log('empty db ready');
setInterval(() => {}, 1 << 30);
