import assert from 'node:assert/strict';
import { serve } from '@hono/node-server';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { openDatabase, root } from '../src/database.js';
import { createApp } from '../src/app.js';

const folder = mkdtempSync(resolve(tmpdir(), 'campus-api-test-'));
const database = resolve(folder, 'test.sqlite');
let db = openDatabase(database);
const server = serve({ fetch: createApp(db).fetch, hostname: '127.0.0.1', port: 0 });
await new Promise<void>((done, reject) => { server.once('listening', done); server.once('error', reject); });
const address = server.address();
if (!address || typeof address === 'string') throw Error('No HTTP address');
const baseUrl = `http://127.0.0.1:${address.port}/api`;
const evidence: unknown[] = [];
const fixture = (name: string) => JSON.parse(readFileSync(resolve(root, `fixtures/${name}`), 'utf8'));
let count = 0;
async function request(name: string, method: string, path: string, expected: number, body?: unknown, raw = false) {
  const response = await fetch(baseUrl + path, { method, headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : raw ? String(body) : JSON.stringify(body) });
  const text = await response.text();
  evidence.push({ name, method, url: baseUrl + path, requestBody: body, expectedStatus: expected,
    observedStatus: response.status, headers: Object.fromEntries(response.headers), responseBody: text });
  assert.equal(response.status, expected, `${name}: ${text}`);
  if (expected === 204) assert.equal(text, '');
  else assert.match(response.headers.get('content-type') ?? '', /application\/json/);
  const json = text ? JSON.parse(text) : null;
  if (expected >= 400) assert.equal(typeof json.error, 'string');
  count++;
  console.log(`PASS ${String(count).padStart(2, '0')}: ${name} (${expected})`);
  return json;
}

try {
  // Run the exported Postman request sequence through real HTTP, independently of the Postman UI.
  const collection = JSON.parse(readFileSync(resolve(root, 'postman/Campus-Equipment.postman_collection.json'), 'utf8'));
  let id = '';
  let expectedBooking: Record<string, unknown> | undefined;
  for (const item of collection.item) {
    const path = item.request.url.raw.replace('{{baseUrl}}', '').replace('{{bookingId}}', id);
    const body = item.request.body ? JSON.parse(item.request.body.raw) : undefined;
    const expected = Number(item.event.find((e: { listen: string }) => e.listen === 'test').script.exec[0].match(/HTTP (\d+)/)[1]);
    const result = await request(item.name, item.request.method, path, expected, body);
    if (item.name.startsWith('01')) assert.equal(result.length, 2);
    if (item.name.startsWith('02') || item.name.startsWith('09b')) assert.deepEqual(result, []);
    if (item.name.startsWith('03')) { id = result.id; expectedBooking = body; }
    if (item.name.startsWith('05 ')) expectedBooking = body;
    if (['03', '04', '05', '05a', '07a'].some(prefix => item.name.startsWith(prefix))) {
      assert.equal(typeof result.id, 'string'); assert.equal(result.id, id);
      for (const key of Object.keys(expectedBooking!)) assert.equal(result[key], expectedBooking![key]);
    }
    if (item.name.startsWith('07b')) { assert.equal(result.length, 1); assert.equal(result[0].id, id); }
  }

  const base = fixture('create-valid.json');
  const a = await request('Extended: create A', 'POST', '/bookings', 201, base);
  const b = await request('Adjacent interval', 'POST', '/bookings', 201, fixture('create-adjacent.json'));
  const c = await request('Same interval, different equipment', 'POST', '/bookings', 201, fixture('create-other-equipment.json'));
  for (const name of ['create-missing-borrower.json', 'create-unknown-equipment.json', 'create-invalid-range.json', 'create-equal-times.json',
    'create-invalid-date.json', 'invalid-wrong-type.json', 'invalid-blank-borrower.json', 'invalid-unknown-field.json',
    'invalid-null-field.json', 'invalid-null-body.json', 'invalid-array.json']) {
    await request(name, 'POST', '/bookings', 400, fixture(name));
  }
  await request('Malformed JSON', 'POST', '/bookings', 400, '{broken', true);
  for (const startAt of ['not-a-date', '2026-10-20T09:00:00', '2026-13-01T09:00:00Z', '2026-10-20T24:00:00Z']) {
    await request(`Invalid timestamp ${startAt}`, 'POST', '/bookings', 400, { ...base, startAt });
  }
  await request('Blank purpose', 'POST', '/bookings', 400, { ...base, purpose: '  ' });
  await request('Oversized borrower', 'POST', '/bookings', 400, { ...base, borrowerName: 'x'.repeat(101) });
  for (const name of ['create-overlap.json', 'create-offset-overlap.json']) await request(name, 'POST', '/bookings', 409, fixture(name));
  for (const [start, end] of [['08:00', '12:00'], ['09:30', '10:00'], ['09:00', '11:00']]) {
    await request(`Containment/identical ${start}–${end}`, 'POST', '/bookings', 409, { ...base, startAt: `2026-10-20T${start}:00Z`, endAt: `2026-10-20T${end}:00Z` });
  }
  const changedA = await request('Partial purpose PATCH', 'PATCH', `/bookings/${a.id}`, 200, fixture('patch-purpose.json'));
  assert.equal(changedA.startAt, a.startAt);
  await request('Self update', 'PATCH', `/bookings/${a.id}`, 200, fixture('patch-self-times.json'));
  await request('Merged PATCH invalid range', 'PATCH', `/bookings/${a.id}`, 400, fixture('patch-invalid-range.json'));
  await request('Empty PATCH', 'PATCH', `/bookings/${a.id}`, 400, {});
  await request('Unknown PATCH field', 'PATCH', `/bookings/${a.id}`, 400, { id: 'replacement' });
  await request('Null PATCH field', 'PATCH', `/bookings/${a.id}`, 400, { purpose: null });
  await request('Update overlap', 'PATCH', `/bookings/${b.id}`, 409, fixture('patch-overlap.json'));
  assert.deepEqual(await request('Rejected update preserved B', 'GET', `/bookings/${b.id}`, 200), b);
  await request('Equipment update conflict', 'PATCH', `/bookings/${c.id}`, 409, fixture('patch-equipment-conflict.json'));
  assert.deepEqual(await request('Rejected equipment update preserved C', 'GET', `/bookings/${c.id}`, 200), c);
  assert.deepEqual(await request('Rejected A changes preserved A', 'GET', `/bookings/${a.id}`, 200), changedA);
  await request('Missing PATCH target', 'PATCH', '/bookings/missing-id', 404, { purpose: 'Valid' });
  await request('Missing DELETE target', 'DELETE', '/bookings/missing-id', 404);
  await request('Unknown route', 'GET', '/unknown', 404);
  const sql = await request('SQL-looking text stored literally', 'POST', '/bookings', 201, fixture('create-sql-text.json'));
  assert.equal(sql.borrowerName, fixture('create-sql-text.json').borrowerName);
  assert.equal((await request('Equipment intact after SQL-looking text', 'GET', '/equipment', 200)).length, 2);
  const offset = await request('Timezone normalization', 'POST', '/bookings', 201, { ...base, equipmentId: 'eq-2', startAt: '2026-10-22T09:00:00+07:00', endAt: '2026-10-22T10:00:00+07:00' });
  assert.equal(offset.startAt, '2026-10-22T02:00:00.000Z');
  await request('Delete A', 'DELETE', `/bookings/${a.id}`, 204);
  await request('Deleted A absent', 'GET', `/bookings/${a.id}`, 404);
  await request('Repeated delete', 'DELETE', `/bookings/${a.id}`, 404);
  await request('Deleted interval available again', 'POST', '/bookings', 201, base);
  const concurrent = { ...base, startAt: '2026-10-23T09:00:00Z', endAt: '2026-10-23T11:00:00Z' };
  const results = await Promise.all([1, 2].map(() => fetch(baseUrl + '/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(concurrent) })));
  const outcomes = await Promise.all(results.map(async r => ({ status: r.status, body: await r.text() })));
  evidence.push({ name: 'Concurrent overlapping creates', outcomes });
  assert.deepEqual(outcomes.map(r => r.status).sort(), [201, 409]);
  const rows = await request('Concurrent result persisted exactly once', 'GET', '/bookings', 200);
  assert.equal(rows.filter((r: { startAt: string }) => r.startAt === '2026-10-23T09:00:00.000Z').length, 1);
  const persisted = openDatabase(database);
  assert.equal(persisted.prepare('SELECT count(*) AS n FROM bookings').get()!.n, rows.length);
  persisted.close();
  // Controlled failure in the isolated test database only: check safe JSON 500.
  db.close();
  await request('Unexpected database failure uses safe JSON', 'GET', '/equipment', 500);
  console.log(`${count} HTTP requests passed, plus concurrent-write and disk-persistence assertions.`);
} finally {
  await new Promise<void>(done => server.close(() => done()));
  try { db.close(); } catch { /* Already closed by controlled failure test. */ }
  mkdirSync(resolve(root, 'evidence'), { recursive: true });
  writeFileSync(resolve(root, 'evidence/http-results.json'), JSON.stringify({ executedAt: new Date().toISOString(), timezone: 'Asia/Bangkok', baseUrl, database, runtime: process.version, requestsPassed: count, requests: evidence }, null, 2));
}
