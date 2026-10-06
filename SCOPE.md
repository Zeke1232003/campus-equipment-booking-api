# Project Scope

## Objective

Deliver a locally runnable Campus Equipment Booking API that lets a borrower reserve existing equipment and prevents overlapping reservations for that equipment.

## In scope

- Design the REST contract and a two-table equipment/booking data model before coding.
- Seed at least two equipment records and expose `GET /api/equipment`.
- List, retrieve, create, partially update, and delete bookings.
- Validate equipment references, borrower and purpose fields, timestamps, and interval ordering.
- Detect conflicts for both new and updated bookings.
- Return the prescribed success statuses and `{ "error": "..." }` for errors.
- Bind request values as SQL parameters; handle malformed JSON and server errors.
- Test with an HTTP client and preserve evidence for at least five cases covering CRUD and errors.
- Keep an AI log, a minute-30 snapshot, and a Quality Gate review with at least three findings and verification.
- Enable CORS if a browser tester is used; document its actual origin.

## Out of scope

- Equipment create/update/delete endpoints, accounts, login, roles, and payment.
- A full frontend, deployment, presentation slides, notifications, or recurring bookings.
- Additional features that consume exam time without satisfying the supplied contract.

## Project decisions to verify against instructor guidance

1. The instructor starter is still unavailable. Implemented standalone TypeScript/Hono with Node's local SQLite adapter; adapt to the supplied starter if mandatory. No D1 runtime is claimed.
2. Treat booking intervals as half-open: `[startAt, endAt)`. Adjacent bookings are allowed.
3. `PATCH` accepts a non-empty subset of booking fields; validate the merged complete record.
4. All five fields in the create payload are required. Borrower name and purpose must contain non-whitespace text.
5. Accept timestamps with an explicit timezone and return canonical UTC ISO timestamps.
6. An unknown `equipmentId` in a payload is invalid data (`400`); an unknown booking resource in a URL returns `404`.
7. Generate booking IDs on the server. Use deterministic ordering for list responses.
8. Do not require a future date, maximum booking duration, or authentication unless the instructor adds those requirements.

These decisions fill gaps in the brief; they are not additional instructor requirements. See [API_CONTRACT.md](API_CONTRACT.md) for exact behavior.

## Source interpretation and open questions

| Topic | Evidence | Working interpretation |
|---|---|---|
| Contract | Detailed exam brief and rubric specify this scenario | Follow their equipment and booking routes |
| Timing | Brief: 120 minutes; announcement: 13:00–17:00; assignment: 13:00–16:00, due 16:00 | Confirm current deadline; preserve minute-30 checkpoint |
| CORS | Announcement mentions a frontend tester; brief requires CORS only for a browser client | Add when browser testing is used; discover the tester origin |
| Stack | Instructor starter, TypeScript/Hono, local SQLite/D1 | Local TypeScript/Hono/SQLite implemented; instructor starter absent and remains a submission compatibility check |
| Quality Gate | Supplied `reference/quality_gate.md` has eight review areas | Review at minute 30 and in the final five minutes; record three meaningful improvements with evidence |
| cURL guide | Supplied `reference/curl_test_guide.md` has nine sequential requests | Follow INSTRUCTOR_CURL_CHECK in a clean database; preserve CRUD, invalid-input, missing-resource, and conflict evidence |

## Completion criteria

All six required routes work, equipment seeds exist, validation and conflict checks pass on create and update, and results can be explained. The submission includes runnable code, verified run instructions, schema/ERD, contract, actual HTTP evidence, an honest AI log, and a completed Quality Gate review.
