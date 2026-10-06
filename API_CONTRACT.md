# API Contract

Default implemented base URL: `http://localhost:8787/api`. PORT can change the port. Automated tests use an isolated free port and record the actual URL in evidence/http-results.json.

Requests with bodies use `Content-Type: application/json`. Successful responses use JSON except `DELETE`, which has no body. Error responses use JSON in the prescribed format.

## Routes

| Method | Path | Success status and response | Expected client errors |
|---|---|---|---|
| GET | `/equipment` | `200`, equipment array | None for a valid route |
| GET | `/bookings` | `200`, booking array | None for a valid route |
| GET | `/bookings/:id` | `200`, booking object | `404` missing booking |
| POST | `/bookings` | `201`, created booking object | `400` invalid data; `409` overlap |
| PATCH | `/bookings/:id` | `200`, updated booking object | `400` invalid data; `404` missing booking; `409` overlap |
| DELETE | `/bookings/:id` | `204`, no body | `404` missing booking |

List ordering is `id` ascending for equipment and `startAt`, then `id`, ascending for bookings. No pagination or filtering is required.

## Equipment response

```json
[
  { "id": "eq-1", "name": "Projector A", "location": "Building 1" },
  { "id": "eq-2", "name": "Camera A", "location": "Media Lab" }
]
```

## Create request

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

The server generates `id`. A booking response includes exactly the following required fields at minimum:

```json
{
  "id": "<server-generated-booking-id>",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

Examples describe the contract; they are not observed HTTP results.

## Field validation

| Field | Proposed rule |
|---|---|
| `equipmentId` | Required string on create; 1–100 characters after trimming; must reference existing equipment |
| `borrowerName` | Required string on create; trim surrounding whitespace; 1–100 characters |
| `startAt` | Required string on create; valid ISO 8601 calendar date/time with seconds and explicit `Z` or `±HH:MM` timezone |
| `endAt` | Same timestamp rules; strictly later than `startAt` |
| `purpose` | Required string on create; trim surrounding whitespace; 1–500 characters |

Reject missing fields on create, `null`, wrong types, whitespace-only text, impossible calendar dates, and unknown fields. Request bodies must be JSON objects, not arrays or primitives. Fractional seconds may be omitted or contain 1–3 digits. Normalize accepted timestamps to UTC with milliseconds; do not compare raw strings containing different timezone offsets. No future-date restriction is imposed.

The limits and exact accepted timestamp form are implementation decisions. Keep validation and documentation consistent if instructor guidance changes them.

## PATCH semantics

Accept one or more known editable fields. For example:

```json
{ "purpose": "Updated presentation topic" }
```

An empty object is invalid. Load the existing booking, merge provided fields, and validate the resulting complete record. An update to only `startAt` must still be checked against the stored `endAt`. An equipment change must be checked against bookings for the new equipment. Reject `id`, unknown fields, and explicit `null` values.

Validation order for PATCH: parse JSON/object and allowed fields; find target booking; merge and validate fields/equipment/time order; check overlap; write. A valid object aimed at a missing booking returns `404`.

## Conflict rule

Intervals are half-open: `[startAt, endAt)`. Another booking conflicts when:

```text
existing.equipmentId == proposed.equipmentId
AND existing.startAt < proposed.endAt
AND existing.endAt > proposed.startAt
```

Exclude the target booking ID when checking an update. A booking ending at 11:00 and another starting at 11:00 do not conflict. An identical interval for another equipment ID is allowed.

## Errors

```json
{ "error": "Booking time conflicts with an existing booking" }
```

| Status | Use | Example message |
|---|---|---|
| `400` | Missing/invalid data, malformed JSON, nonexistent equipment reference | `equipmentId must reference existing equipment` |
| `404` | Missing booking or unknown API path | `Booking not found` |
| `409` | Overlapping reservation for the same equipment | `Booking time conflicts with an existing booking` |
| `500` | Unexpected internal failure | `Internal server error` |

Use clear messages; exact wording need not match these examples. Return `{ "error": "..." }` for unknown routes and framework errors as well. Never expose raw database errors or stack traces.

## CORS when using a browser client

Configure the tester's actual origin before routes so success and error responses include CORS headers. Permit `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS` and the `Content-Type` header. Preflight `OPTIONS` may return `204` without a body. Record the tested origin and results. The brief does not require CORS for command-line-only testing.
