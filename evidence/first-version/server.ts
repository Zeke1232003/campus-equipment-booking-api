import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { openDatabase } from './database.js';

const port = Number(process.env.PORT ?? 8787);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535');
const db = openDatabase();
const server = serve({ fetch: createApp(db).fetch, port, hostname: '127.0.0.1' }, () => {
  console.log(`Campus Equipment API running at http://localhost:${port}/api`);
});
server.on('error', error => { console.error(error); db.close(); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => {
  server.close(() => { db.close(); process.exit(0); });
});
