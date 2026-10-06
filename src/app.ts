import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { parseObject, validateBooking, invalid, type BookingInput } from './validation.js';

type Row = { id: string; equipment_id: string; borrower_name: string; start_at_ms: number; end_at_ms: number; purpose: string };
function serialize(row: Row) {
  return { id: row.id, equipmentId: row.equipment_id, borrowerName: row.borrower_name,
    startAt: new Date(row.start_at_ms).toISOString(), endAt: new Date(row.end_at_ms).toISOString(), purpose: row.purpose };
}

export interface ApiDatabase {
  prepare(sql: string): {
    get(...values: (string | number)[]): unknown | Promise<unknown>;
    all(): unknown[] | Promise<unknown[]>;
    run(...values: (string | number)[]): unknown | Promise<unknown>;
  };
}

export function createApp(db: ApiDatabase) {
  const app = new Hono();
  const get = async (id: string) => await db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) as Row | undefined;
  const required = async (id: string) => {
    const row = await get(id);
    if (!row) throw new HTTPException(404, { message: 'Booking not found' });
    return row;
  };
  const checkEquipment = async (booking: BookingInput) => {
    if (!await db.prepare('SELECT id FROM equipment WHERE id = ?').get(booking.equipmentId)) invalid('equipmentId must reference existing equipment');
  };
  const values = (b: BookingInput) => [b.equipmentId, b.borrowerName, Date.parse(b.startAt), Date.parse(b.endAt), b.purpose];
  app.onError((error, c) => {
    if (error instanceof HTTPException) return c.json({ error: error.message }, error.status);
    if ([error.message, error.cause instanceof Error ? error.cause.message : ''].some(message => /(?:^|\b)booking_time_conflict(?:$|\b)/.test(message))) return c.json({ error: 'Booking time conflicts with an existing booking' }, 409);
    console.error('Unexpected API failure:', error);
    return c.json({ error: 'Internal server error' }, 500);
  });
  app.notFound(c => c.json({ error: 'Resource not found' }, 404));
  app.get('/api/equipment', async c => c.json(await db.prepare('SELECT id, name, location FROM equipment ORDER BY id').all()));
  app.get('/api/bookings', async c => c.json((await db.prepare('SELECT * FROM bookings ORDER BY start_at_ms, id').all() as Row[]).map(serialize)));
  app.get('/api/bookings/:id', async c => c.json(serialize(await required(c.req.param('id')))));
  async function body(c: { req: { json: () => Promise<unknown> } }) {
    let value: unknown;
    try { value = await c.req.json(); } catch { invalid('Malformed JSON body'); }
    return parseObject(value);
  }
  app.post('/api/bookings', async c => {
    const booking = validateBooking(await body(c));
    await checkEquipment(booking);
    const id = crypto.randomUUID();
    // The trigger checks overlap atomically as part of this write.
    await db.prepare('INSERT INTO bookings (id, equipment_id, borrower_name, start_at_ms, end_at_ms, purpose) VALUES (?, ?, ?, ?, ?, ?)').run(id, ...values(booking));
    return c.json(serialize(await required(id)), 201);
  });
  app.patch('/api/bookings/:id', async c => {
    const patch = await body(c);
    const id = c.req.param('id');
    const booking = validateBooking({ ...serialize(await required(id)), ...patch });
    await checkEquipment(booking);
    await db.prepare('UPDATE bookings SET equipment_id = ?, borrower_name = ?, start_at_ms = ?, end_at_ms = ?, purpose = ? WHERE id = ?').run(...values(booking), id);
    return c.json(serialize(await required(id)));
  });
  app.delete('/api/bookings/:id', async c => {
    const id = c.req.param('id');
    await required(id);
    await db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
    return c.body(null, 204);
  });
  return app;
}
