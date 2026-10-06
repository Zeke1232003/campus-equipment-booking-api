# HTTP Test Plan

**Status:** Automated live HTTP tests have run successfully using an isolated local SQLite database. See TEST_EVIDENCE and evidence/http-results.json. The tables below specify expected behavior; personal Postman execution and conditional browser CORS testing remain separate.

Use `curl.exe` on Windows or an HTTP client. The supplied [instructor cURL guide](reference/curl_test_guide.md) is mapped to PowerShell in [INSTRUCTOR_CURL_CHECK.md](INSTRUCTOR_CURL_CHECK.md). Run that nine-step sequence in a clean database separately from T01–T27: its full PATCH moves A to 12:00–14:00, whereas this extended suite keeps A at 09:00–11:00 until deletion.

## Setup and fixtures

- Start the API using the verified README commands and record its actual base URL.
- Apply equipment seeds; start with no bookings in a disposable local test database.
- Use the contract's example POST body: `eq-1`, 20 October 2026, 09:00–11:00 UTC.
- Save the returned booking ID as `A`; IDs below are placeholders to replace with actual IDs.
- Supply `Content-Type: application/json` for POST/PATCH.
- Run cases in order unless their setup column says otherwise. Record HTTP status, response body, and any follow-up persistence check.

Prepared bodies and their expected setup/statuses are documented in [fixtures/README.md](fixtures/README.md). Use the saved A/B/C IDs from real POST responses. All 25 `.json` files are syntactically valid; `malformed-body.txt` is intentionally invalid JSON for a parsing-error test.

## Required and boundary cases

| ID | Request/setup | Expected result |
|---|---|---|
| T01 | GET `/equipment` | `200`; array includes `eq-1` and `eq-2` with expected fields |
| T02 | GET `/bookings` before creation | `200`; `[]` |
| T03 | POST example booking; save ID as A | `201`; required fields, generated ID, normalized timestamps |
| T04 | GET `/bookings/A`, then GET `/bookings` | `200`; persisted booking appears in both responses |
| T05 | POST without `borrowerName` | `400`; JSON error; no new booking |
| T06 | POST with `equipmentId: eq-missing` | `400`; JSON error; no new booking |
| T07 | POST with equal/reversed start/end; execute both variants | Both `400`; JSON errors |
| T08 | POST impossible date such as `2026-02-30T09:00:00.000Z`, invalid timestamp text, and no timezone; execute separately | Each `400`; JSON error |
| T09 | POST eq-1, 10:00–12:00 while A is 09:00–11:00 | `409`; JSON error; A unchanged |
| T10 | POST eq-1 with intervals 08:00–12:00, 09:30–10:00, and 09:00–11:00; execute separately | Each `409`; tests containment and identical interval |
| T11 | POST eq-1, 11:00–12:00; save ID as B | `201`; adjacent interval allowed |
| T12 | POST eq-2, 09:00–11:00; save ID as C | `201`; same interval on different equipment allowed |
| T13 | PATCH A with purpose only; GET A | `200`; purpose changed; equipment and times unchanged |
| T14 | PATCH A with its unchanged start/end | `200`; no conflict with itself |
| T15 | PATCH B to 10:30–12:00; GET B afterwards | `409`; B still 11:00–12:00 |
| T16 | PATCH A with `startAt` at 12:00 only; GET A afterwards | `400`; merged interval invalid; A unchanged |
| T17 | PATCH C to `equipmentId: eq-1`; GET C afterwards | `409`; C remains on eq-2 |
| T18 | GET/PATCH/DELETE `/bookings/missing-id`; use valid PATCH object | Each `404`; JSON error |
| T19 | POST malformed JSON, array body, null, wrong field type, blank borrower/purpose, unknown field; execute separately | Each `400`; JSON error |
| T20 | PATCH A with `{}` and with unknown field; execute separately | Each `400`; A unchanged |
| T21 | POST borrower containing SQL-like text, with an otherwise valid non-conflicting time such as eq-2 12:00–13:00 | `201`; input stored as text; equipment table still lists successfully |
| T22 | DELETE A; GET A; DELETE A again | `204` with empty body; then `404`, `404` |
| T23 | POST eq-1 at A's deleted interval 09:00–11:00 | `201`; deleted reservation no longer blocks availability |
| T24 | GET unknown API path | `404`; prescribed JSON error |

All times above are on 20 October 2026 in UTC unless stated otherwise. Subcases need separate observed outputs. T21 demonstrates behavior with hostile-looking input; also inspect SQL binding in code because that test alone does not prove safe query construction.

## Additional targeted verification

| ID | Case | Expected result |
|---|---|---|
| T25 | In a clean database, submit two concurrent POSTs for overlapping times on eq-1 | One `201`, one `409`; exactly one persisted booking |
| T26 | Against A before its deletion, POST eq-1 with `2026-10-20T16:30:00+07:00`–`2026-10-20T17:00:00+07:00` | `409`; equivalent to 09:30–10:00 UTC |
| T27 | When browser tester is used, OPTIONS then POST from its origin; include an invalid POST | Preflight succeeds; browser receives success and error JSON with correct CORS headers |

T26 must run before T22 or recreate A. T25 uses an isolated fixture. Inspect error-handler code or use a controlled local database failure to verify a safe JSON `500`; do not disrupt the normal database to fabricate a result.

## Minimal example commands

Replace host/port and IDs with actual values. These examples have not been executed:

```powershell
curl.exe -i http://localhost:8787/api/equipment
curl.exe -i http://localhost:8787/api/bookings
curl.exe -i http://localhost:8787/api/bookings/ACTUAL_BOOKING_ID
curl.exe -i -X DELETE http://localhost:8787/api/bookings/ACTUAL_BOOKING_ID
```

For POST/PATCH, save the intended JSON body into a fixture file and send it with `--data-binary "@fixture.json"`. Using files avoids Windows shell quoting errors. Record the exact fixture content with evidence.

The prepared POST body can be sent from the project folder with:

```powershell
curl.exe -i -X POST http://localhost:8787/api/bookings -H "Content-Type: application/json" --data-binary "@fixtures/create-valid.json"
```

This command must wait until the actual API is running. Offline checks can already be reproduced using `node .\scripts\verify-preparation.mjs`; their results are recorded separately in [TEST_EVIDENCE.md](TEST_EVIDENCE.md).
