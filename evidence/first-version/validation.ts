import { HTTPException } from 'hono/http-exception';

export type BookingInput = {
  equipmentId: string; borrowerName: string; startAt: string; endAt: string; purpose: string;
};
const fields = ['equipmentId', 'borrowerName', 'startAt', 'endAt', 'purpose'];
export function invalid(message: string): never {
  throw new HTTPException(400, { message });
}

export function parseObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('Body must be a JSON object');
  const body = value as Record<string, unknown>;
  const keys = Object.keys(body);
  if (!keys.length) invalid('At least one booking field is required');
  if (keys.some(key => !fields.includes(key))) invalid('Unknown booking field');
  return body;
}

// Date.parse alone can normalize impossible dates (for example 30 February).
export function timestamp(value: unknown, field: string): string {
  if (typeof value !== 'string') invalid(`${field} must be an ISO timestamp string`);
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|([+-])(\d{2}):(\d{2}))$/.exec(value);
  if (!match) invalid(`${field} must include a valid date, seconds, and timezone`);
  const [, y, mo, d, h, mi, s, , zone, , oh, om] = match;
  const year = Number(y), month = Number(mo), day = Number(d);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > days[month - 1] ||
      Number(h) > 23 || Number(mi) > 59 || Number(s) > 59 ||
      (zone !== 'Z' && (Number(oh) > 23 || Number(om) > 59))) invalid(`${field} is not a valid calendar date/time`);
  const millis = Date.parse(value);
  if (!Number.isFinite(millis)) invalid(`${field} is invalid`);
  return new Date(millis).toISOString();
}

export function validateBooking(body: Record<string, unknown>): BookingInput {
  function text(field: string, max: number) {
    const value = body[field];
    if (typeof value !== 'string' || !value.trim() || value.trim().length > max) invalid(`${field} must contain 1–${max} characters`);
    return value.trim();
  }
  const booking = {
    equipmentId: text('equipmentId', 100), borrowerName: text('borrowerName', 100),
    startAt: timestamp(body.startAt, 'startAt'), endAt: timestamp(body.endAt, 'endAt'),
    purpose: text('purpose', 500),
  };
  if (Date.parse(booking.startAt) >= Date.parse(booking.endAt)) invalid('startAt must be before endAt');
  return booking;
}
