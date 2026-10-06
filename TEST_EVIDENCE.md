# Test Evidence

**HTTP execution status:** Completed by the assistant on 6 October 2026. 63 sequential HTTP requests passed with concurrent-write and disk-persistence assertions. The actual Postman collection also passed in Newman: 14 requests, 41 assertions, zero failures. Student personal Postman execution remains pending.

## Completed API verification

- Runtime: Node v24.18.1; TypeScript/Hono, @hono/node-server, built-in SQLite. Exact installed dependencies are locked in package-lock.json.
- `npm.cmd run check`: exit 0; TypeScript strict checking passed.
- `npm.cmd test`: exit 0; 63 sequential requests pass plus two simultaneous overlapping POSTs yielding one 201 and one 409, exactly one concurrent booking persisted, and disk persistence read through a second connection.
- Test date/time: 6 October 2026, 14:30:11 Asia/Bangkok (artifact timestamp 2026-10-06T07:30:11.569Z).
- Actual integration-test URL: `http://127.0.0.1:59767/api`; automatically allocated for this isolated run. That temporary test server is stopped after completion.
- Integration-test database: Separate temporary SQLite file, created and seeded automatically. The exact path, request methods/URLs/bodies, expected/observed statuses, response headers, and raw bodies are in [http-results.json](evidence/http-results.json).
- Normal server setup/start: `npm.cmd run db:init`, `npm.cmd start`; local file data/campus.sqlite.
- Stable localhost URL: `http://localhost:8787/api`. Equipment GET verified with curl.exe: 200, JSON with eq-1 and eq-2.
- Actual collection execution: `node node_modules/newman/bin/newman.js run postman/Campus-Equipment.postman_collection.json -e postman/Local.postman_environment.json --reporters cli,json --reporter-json-export evidence/postman-results.json`.
- Collection result: 14 requests, 41 assertions, zero failures. Raw report: [postman-results.json](evidence/postman-results.json). Collection IDs, full responses, request payloads, environment use, and test assertions are captured there. Completed run leaves the normal booking list empty.
- Newman was installed temporarily to verify the collection and then removed from project dependencies. The final dependency audit reported 0 vulnerabilities. Repeat collection tests through Postman desktop; use `npm.cmd test` for the repeatable isolated HTTP suite.
- First-version source copies: [evidence/first-version](evidence/first-version/README.md), captured 14:27:52 Asia/Bangkok; exact exam minute-30 commit/screenshot compliance is not claimed.
- At the time of the HTTP run there was no Git repository. Git was initialized afterward for versioning/publication. The first publication commit records the source, lockfile, and reports; it does not retroactively establish the exam checkpoint.

The HTTP suite covers the guide sequence, field/object/malformed-body validation, calendar/timezone checks, create and update conflicts, adjacency, different equipment, unchanged self-update, partial PATCH and rejected-write preservation, missing resources/routes, literal SQL-looking text, deletion/reuse, concurrency, and persistence. A controlled failure closes only the isolated test database and verifies a safe JSON 500; its server-side diagnostic is expected. D1, browser CORS, and multiple server processes have not been tested.

## Student Postman verification — still to complete personally

Import both postman JSON files, select Campus Equipment Local, run all 14 requests in order, and save your own screenshots/output. Add your date/time, actual base URL, results, and explanations here. The assistant's completed tests do not establish personal ownership.

## Environment — student evidence fields

- Test date/time and timezone: **Pending**.
- Actual base API URL: Assistant verified http://localhost:8787/api; record your personal test URL here.
- Runtime and package versions: Node v24.18.1 and npm 11.16.0; API dependencies in package-lock.json.
- Database adapter and setup command: Node built-in SQLite; `npm.cmd run db:init`.
- Code version/commit tested: Current src/ plus package-lock.json; no Git repository.
- HTTP client/version: Student previously checked cURL 8.21.0; assistant used fetch, curl.exe, and Newman 6.2.2. Personal Postman version/run pending.
- Database fixture/reset method: `npm.cmd run db:reset` clears bookings in the selected local test database; stop server first.
- Browser tester origin, if used: Not applicable to curl/Newman/desktop Postman.

## Offline preparation verification — executed by the assistant

- Date: 6 October 2026, Asia/Bangkok; exact time not recorded.
- Command from the project folder: `node .\scripts\verify-preparation.mjs`.
- Environment: Node v24.18.1; built-in SQLite 3.53.1.
- Files exercised: [schema.sql](schema.sql), [seed.sql](seed.sql), [fixtures/README.md](fixtures/README.md), and [verification script](scripts/verify-preparation.mjs).
- Database: Disposable in-memory SQLite with foreign keys explicitly enabled; no API database modified.
- Result: Exit code `0`; 19 checks passed; all 23 JSON fixtures parsed and the malformed text fixture failed parsing as intended.
- Student reproduction: **Completed** — the student supplied their own PowerShell run showing the same 19 passing checks, Node v24.18.1 / SQLite 3.53.1, 23 parsed JSON fixtures, and one intentionally malformed body. Exact execution time and a separate exit-code command were not supplied.
- Student explanation of the SQL and checks: **Pending**.
- Limits: These are SQL/fixture checks, not HTTP evidence, D1 integration results, or concurrent-request results. At least five actual HTTP cases are still required.

Captured output:

```text
Node v24.18.1; SQLite 3.53.1
PASS 01: Schema creates equipment, bookings, index, and both overlap triggers
PASS 02: Repeated schema/seed setup retains two equipment records and zero bookings
PASS 03: Valid booking persists with integer millisecond times
PASS 04: Nonexistent equipment is rejected by the foreign key
PASS 05: Reversed and equal intervals are rejected by the time CHECK
PASS 06: Fractional milliseconds are rejected by the integer CHECK
PASS 07: Blank, oversized, and null text fail constraints
PASS 08: Partial overlaps, enclosing, contained, and identical intervals are rejected
PASS 09: Timezone-offset interval conflicts after conversion to UTC milliseconds
PASS 10: Adjacent bookings at either endpoint are allowed
PASS 11: Identical interval on different equipment is allowed
PASS 12: Purpose and unchanged-time updates exclude the booking itself
PASS 13: Conflicting time and equipment updates abort without changing bookings
PASS 14: Changing only start time still enforces ordering with the stored end
PASS 15: Bound SQL-looking borrower text is stored literally and equipment survives
PASS 16: Equipment with bookings cannot be deleted
PASS 17: Deleting a booking frees its interval
PASS 18: Failed multi-row UPDATE rolls back the entire statement
  Parsed 23 JSON fixtures and checked 1 malformed body.
PASS 19: All JSON fixtures parse; malformed-body.txt fails JSON parsing intentionally

19 preparation checks passed. HTTP/API, D1, and concurrent-request tests remain pending.
```

## Assistant rerun after instructor-guide alignment

- Date: 6 October 2026, Asia/Bangkok; exact time not recorded.
- Command: `node .\scripts\verify-preparation.mjs` from the project folder.
- Observed: Node v24.18.1 / SQLite 3.53.1; exit code `0`; all 19 checks passed. Fixture output: `Parsed 25 JSON fixtures and checked 1 malformed body.`
- Change exercised: added guide-patch-full.json and guide-create-overlap.json; existing schema/seed checks still pass.
- Limit: Parsing checks syntax, not HTTP validation/statuses. Student reproduction of this updated run remains pending. Earlier 23-fixture output is retained as historical evidence.

## Instructor guide HTTP sequence — verified by assistant through Newman

Commands: [INSTRUCTOR_CURL_CHECK.md](INSTRUCTOR_CURL_CHECK.md). Run independently from the extended suite because G05 changes the reservation interval.

| ID | Instructor step | Expected | Observed / outcome |
|---|---|---|---|
| G01 | List equipment | 200, equipment array | 200 / passed |
| G02 | List bookings | 200, initially empty array | 200 / passed |
| G03 | Create | 201, actual generated ID and required fields | 201 / passed |
| G04 | Read created booking | 200, persisted values | 200 / passed |
| G05 | Full update to 12:00–14:00 | 200, updated values | 200 / passed |
| G06 | Reversed interval | 400, JSON error | 400 / passed |
| G07 | Overlap after update | 409, JSON error | 409 / passed |
| G08 | Missing booking | 404, JSON error | 404 / passed |
| G09 | Delete | 204, empty body | 204 with empty body / passed |

Preserve raw responses with the template below. Confirm persistence after update, unchanged data after rejected requests, and 404 after deletion. Expected statuses alone are not evidence.

## Student reproduction evidence

The student supplied the full terminal output of their own run on 6 October 2026. Its version line, PASS 01–19 lines, fixture counts, and final summary match the captured output above.

Command supplied:

```powershell
PS C:\Users\yemya\OneDrive\Desktop\New folder\campus-equipment-booking-api> node .\scripts\verify-preparation.mjs
```

The terminal returned to the project prompt after the success summary. This records the student's successful reproduction of the preparation checks; HTTP/API evidence remains pending.

## Results summary

Record at least five executed cases covering create/read/update/delete and errors. Include validation, not found, and conflict evidence for the strongest rubric coverage. Add rows for subcases and additional tests.

| Test ID | Behavior | Expected | Observed | Outcome | Evidence location |
|---|---|---|---|---|---|
| T03 | Create | 201 | 201 | Passed | evidence/http-results.json |
| T04 | Read | 200 | 200 | Passed | evidence/http-results.json |
| T13 | Update | 200 | 200 | Passed | evidence/http-results.json |
| T22 | Delete and missing after deletion | 204 / 404 | 204 empty / 404 | Passed | evidence/http-results.json |
| T05 | Missing data | 400 | 400 | Passed | evidence/http-results.json |
| T18 | Missing resource | 404 | 404 | Passed | Both raw reports |
| T09 | Create conflict | 409 | 409 | Passed | evidence/http-results.json |
| T15 | Update conflict | 409 | 409, unchanged persisted booking | Passed | evidence/http-results.json |

## Evidence entry template

Copy for each executed request or case:

### Test ID: Pending

- Requirement/rule tested: Pending.
- Setup, existing records, and actual IDs: Pending.
- Exact command or HTTP-client request: Pending.
- Request JSON/fixture content: Pending or no body.
- Expected status and behavior: Pending.
- Observed HTTP status, headers, and body: Pending.
- Follow-up database/API check, if applicable: Pending.
- Outcome: Not run.
- Screenshot/output file or pasted raw response: Pending.

For `204`, explicitly verify that the response body is empty. For rejected create/update requests, verify that stored records remain unchanged. Keep failures and retest results understandable rather than replacing them with invented successful output.

## Results summary for submission

Assistant verification: 63 sequential HTTP requests plus concurrent-write/persistence assertions passed, and the Postman collection passed 14 requests/41 assertions in Newman. Type checking and offline schema checks passed. Raw evidence linked above. Remaining: student Postman reproduction/explanations, instructor starter requirement, exact exam-checkpoint compliance, and final five-minute review. No D1/browser CORS result is claimed.
