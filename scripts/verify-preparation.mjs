// Offline SQL/fixture checks, independent of the instructor's API starter.
// Uses only Node built-ins; creates no persistent database and makes no HTTP calls.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const root = new URL('../', import.meta.url);
const read = (relativePath) => readFileSync(new URL(relativePath, root), 'utf8');
const fixture = (name) => JSON.parse(read(`fixtures/${name}`));
const db = new DatabaseSync(':memory:');
let passed = 0;

function check(description, action) {
  action();
  passed += 1;
  console.log(`PASS ${String(passed).padStart(2, '0')}: ${description}`);
}

function allBookings() {
  return db.prepare('SELECT * FROM bookings ORDER BY id').all();
}

function rejectedWithoutChanges(action, expectedError) {
  const before = allBookings();
  assert.throws(action, expectedError);
  assert.deepEqual(allBookings(), before);
}

try {
  console.log(`Node ${process.version}; SQLite ${db.prepare('SELECT sqlite_version() AS version').get().version}`);
  db.exec('PRAGMA foreign_keys = ON');
  assert.equal(db.prepare('PRAGMA foreign_keys').get().foreign_keys, 1);

  check('Schema creates equipment, bookings, index, and both overlap triggers', () => {
    db.exec(read('schema.sql'));
    const objects = db.prepare("SELECT name FROM sqlite_master WHERE name NOT LIKE 'sqlite_%'").all();
    const names = new Set(objects.map((row) => row.name));
    for (const name of ['equipment', 'bookings', 'bookings_equipment_time_idx',
      'bookings_prevent_overlap_insert', 'bookings_prevent_overlap_update']) {
      assert.ok(names.has(name), `Missing database object: ${name}`);
    }
  });

  check('Repeated schema/seed setup retains two equipment records and zero bookings', () => {
    db.exec(read('seed.sql'));
    db.exec(read('schema.sql'));
    db.exec(read('seed.sql'));
    assert.deepEqual(db.prepare('SELECT id, name, location FROM equipment ORDER BY id').all()
      .map((row) => ({ ...row })), [
      { id: 'eq-1', name: 'Projector A', location: 'Building 1' },
      { id: 'eq-2', name: 'Camera A', location: 'Media Lab' },
    ]);
    assert.equal(allBookings().length, 0);
  });

  const insert = db.prepare(`
    INSERT INTO bookings (id, equipment_id, borrower_name, start_at_ms, end_at_ms, purpose)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const create = (id, body) => insert.run(id, body.equipmentId, body.borrowerName,
    Date.parse(body.startAt), Date.parse(body.endAt), body.purpose);
  const base = fixture('create-valid.json');

  check('Valid booking persists with integer millisecond times', () => {
    create('A', base);
    const row = db.prepare('SELECT * FROM bookings WHERE id = ?').get('A');
    assert.equal(row.equipment_id, base.equipmentId);
    assert.equal(row.start_at_ms, Date.parse(base.startAt));
    assert.equal(row.end_at_ms, Date.parse(base.endAt));
  });

  check('Nonexistent equipment is rejected by the foreign key', () => {
    rejectedWithoutChanges(() => create('missing-equipment', fixture('create-unknown-equipment.json')),
      /FOREIGN KEY constraint failed/);
  });

  check('Reversed and equal intervals are rejected by the time CHECK', () => {
    for (const name of ['create-invalid-range.json', 'create-equal-times.json']) {
      rejectedWithoutChanges(() => create('invalid-time', fixture(name)), /CHECK constraint failed/);
    }
  });

  check('Fractional milliseconds are rejected by the integer CHECK', () => {
    rejectedWithoutChanges(() => insert.run('fractional', 'eq-2', 'Borrower',
      Date.parse(base.startAt) + 0.5, Date.parse(base.endAt), 'Purpose'), /CHECK constraint failed/);
  });

  check('Blank, oversized, and null text fail constraints', () => {
    const start = Date.parse(base.startAt);
    const end = Date.parse(base.endAt);
    for (const [borrower, purpose] of [['   ', 'Purpose'], ['Borrower', '   '],
      ['x'.repeat(101), 'Purpose'], ['Borrower', 'x'.repeat(501)], ['Borrower', null]]) {
      rejectedWithoutChanges(() => insert.run('invalid-text', 'eq-2', borrower, start, end, purpose),
        /CHECK constraint failed|NOT NULL constraint failed/);
    }
  });

  check('Partial overlaps, enclosing, contained, and identical intervals are rejected', () => {
    const intervals = [
      ['10:00', '12:00'], ['08:00', '10:00'], ['08:00', '12:00'],
      ['09:30', '10:00'], ['09:00', '11:00'],
    ];
    for (const [start, end] of intervals) {
      rejectedWithoutChanges(() => create('conflict', { ...base,
        startAt: `2026-10-20T${start}:00.000Z`, endAt: `2026-10-20T${end}:00.000Z`,
      }), /booking_time_conflict/);
    }
  });

  check('Timezone-offset interval conflicts after conversion to UTC milliseconds', () => {
    rejectedWithoutChanges(() => create('offset', fixture('create-offset-overlap.json')),
      /booking_time_conflict/);
  });

  check('Adjacent bookings at either endpoint are allowed', () => {
    create('B', fixture('create-adjacent.json'));
    create('before-A', { ...base, startAt: '2026-10-20T08:00:00.000Z',
      endAt: '2026-10-20T09:00:00.000Z' });
  });

  check('Identical interval on different equipment is allowed', () => {
    create('C', fixture('create-other-equipment.json'));
  });

  check('Purpose and unchanged-time updates exclude the booking itself', () => {
    db.prepare('UPDATE bookings SET purpose = ? WHERE id = ?')
      .run(fixture('patch-purpose.json').purpose, 'A');
    db.prepare('UPDATE bookings SET start_at_ms = ?, end_at_ms = ? WHERE id = ?')
      .run(Date.parse(base.startAt), Date.parse(base.endAt), 'A');
    assert.equal(db.prepare('SELECT purpose FROM bookings WHERE id = ?').get('A').purpose,
      fixture('patch-purpose.json').purpose);
  });

  check('Conflicting time and equipment updates abort without changing bookings', () => {
    const patch = fixture('patch-overlap.json');
    rejectedWithoutChanges(() => db.prepare('UPDATE bookings SET start_at_ms = ?, end_at_ms = ? WHERE id = ?')
      .run(Date.parse(patch.startAt), Date.parse(patch.endAt), 'B'), /booking_time_conflict/);
    rejectedWithoutChanges(() => db.prepare('UPDATE bookings SET equipment_id = ? WHERE id = ?')
      .run(fixture('patch-equipment-conflict.json').equipmentId, 'C'), /booking_time_conflict/);
  });

  check('Changing only start time still enforces ordering with the stored end', () => {
    rejectedWithoutChanges(() => db.prepare('UPDATE bookings SET start_at_ms = ? WHERE id = ?')
      .run(Date.parse(fixture('patch-invalid-range.json').startAt), 'A'), /CHECK constraint failed/);
  });

  check('Bound SQL-looking borrower text is stored literally and equipment survives', () => {
    const body = fixture('create-sql-text.json');
    create('sql-text', body);
    assert.equal(db.prepare('SELECT borrower_name FROM bookings WHERE id = ?').get('sql-text').borrower_name,
      body.borrowerName);
    assert.equal(db.prepare('SELECT count(*) AS count FROM equipment').get().count, 2);
  });

  check('Equipment with bookings cannot be deleted', () => {
    assert.throws(() => db.prepare('DELETE FROM equipment WHERE id = ?').run('eq-1'),
      /FOREIGN KEY constraint failed/);
    assert.equal(db.prepare('SELECT count(*) AS count FROM equipment').get().count, 2);
  });

  check('Deleting a booking frees its interval', () => {
    assert.equal(db.prepare('DELETE FROM bookings WHERE id = ?').run('A').changes, 1);
    create('replacement-A', base);
  });

  check('Failed multi-row UPDATE rolls back the entire statement', () => {
    rejectedWithoutChanges(() => db.prepare(`
      UPDATE bookings SET start_at_ms = ?, end_at_ms = ? WHERE equipment_id = ?
    `).run(Date.parse('2026-10-20T09:00:00.000Z'), Date.parse('2026-10-20T11:00:00.000Z'), 'eq-1'),
    /booking_time_conflict/);
  });

  check('All JSON fixtures parse; malformed-body.txt fails JSON parsing intentionally', () => {
    const names = readdirSync(new URL('fixtures/', root)).filter((name) => name.endsWith('.json'));
    assert.ok(names.length > 0);
    for (const name of names) fixture(name);
    assert.throws(() => JSON.parse(read('fixtures/malformed-body.txt')), SyntaxError);
    console.log(`  Parsed ${names.length} JSON fixtures and checked 1 malformed body.`);
  });

  console.log(`\n${passed} preparation checks passed. This script checks SQL/fixtures only; run npm.cmd test for HTTP/API and concurrent-request checks. D1 is not covered.`);
} finally {
  db.close();
}
