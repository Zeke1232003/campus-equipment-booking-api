# Campus Equipment Booking API

Backend REST API for reserving faculty equipment without overlapping bookings.

Private GitHub repository: [Zeke1232003/campus-equipment-booking-api](https://github.com/Zeke1232003/campus-equipment-booking-api). Main branch contains the source, documentation, fixtures, Postman collection, and captured test evidence.

**Current status:** Local TypeScript/Hono + SQLite API and Cloudflare Worker/D1 deployment implemented. All six routes work; TypeScript checking and 63 sequential HTTP requests plus concurrency/persistence assertions pass. Raw HTTP evidence is saved in [evidence/http-results.json](evidence/http-results.json). Postman collection/environment are included. Student testing/explanation and confirmation of the mandatory instructor starter remain outstanding before submission.

## Required stack and project boundaries

- Use the instructor-provided starter repository and TypeScript/Hono with local SQLite/D1, unless the instructor specifies a different course stack.
- Implement equipment listing and complete booking CRUD under `/api`.
- Seed at least two equipment records.
- Validate requests and prevent overlapping bookings on both create and update.
- Use SQL parameter binding and JSON error responses.
- Run locally; a full frontend, public deployment, and slides are unnecessary.

The instructor starter was not supplied. This implementation uses the specified TypeScript/Hono and local SQLite stack with Node's built-in SQLite adapter. It is a standalone local implementation, not an assertion that the missing starter requirement has been met. Incorporate it into the instructor starter if that repository is mandatory. A Cloudflare Worker entry point and D1 adapter are now included; see Cloudflare deployment below.

## Documents

| Document | Purpose |
|---|---|
| [SCOPE.md](SCOPE.md) | Included work, exclusions, assumptions, and source conflicts |
| [REQUIREMENTS_SPEC.md](REQUIREMENTS_SPEC.md) | Functional requirements and acceptance criteria |
| [API_CONTRACT.md](API_CONTRACT.md) | Routes, payloads, validation, responses, and status codes |
| [DATA_MODEL.md](DATA_MODEL.md) | ERD, proposed schema, seed data, and overlap rule |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Coding order, database handling, and review checkpoint |
| [TEST_PLAN.md](TEST_PLAN.md) | Success, error, and boundary cases to execute |
| [TEST_EVIDENCE.md](TEST_EVIDENCE.md) | Actual HTTP results, raw output links, and verification limits |
| [AI_LOG.md](AI_LOG.md) | Important prompts, use of AI output, and verification |
| [QUALITY_GATE_REVIEW.md](QUALITY_GATE_REVIEW.md) | Eight-area review, implementation improvements, and remaining student checks |
| [SUBMISSION_CHECKLIST.md](SUBMISSION_CHECKLIST.md) | Rubric coverage and final delivery checks |

Original instructions are copied into [reference/](reference/).

## Prepared code and test inputs

| File/folder | Purpose |
|---|---|
| [schema.sql](schema.sql) | Equipment/bookings tables, constraints, time index, and overlap triggers |
| [seed.sql](seed.sql) | Two equipment records; safe to repeat without duplicates |
| [fixtures/README.md](fixtures/README.md) | JSON request bodies, one malformed body, expected statuses, and cURL examples |
| [INSTRUCTOR_CURL_CHECK.md](INSTRUCTOR_CURL_CHECK.md) | Instructor's nine-step sequence adapted for PowerShell, with evidence checks |
| [postman/README.md](postman/README.md) | Importable Postman collection/environment, automatic booking ID, and setup steps |
| [src/app.ts](src/app.ts) | Six Hono routes, bound queries, JSON errors, and trigger conflict mapping |
| [src/validation.ts](src/validation.ts) | Body/field/calendar validation and timezone normalization |
| [src/database.ts](src/database.ts) | SQLite connection, schema, seeds, and persistent data path |
| [scripts/test-api.ts](scripts/test-api.ts) | Actual HTTP integration tests using an isolated database |
| [OWNERSHIP_NOTES.md](OWNERSHIP_NOTES.md) | Source map and explanations to review in your own words |
| [scripts/verify-preparation.mjs](scripts/verify-preparation.mjs) | Offline checks using Node's built-in SQLite and a disposable in-memory database |

`src/database.ts` applies schema.sql before seed.sql and enables foreign keys whenever it opens SQLite. Initialization seeds equipment and preserves any existing bookings. The reset command clears bookings explicitly. The Worker uses the D1 adapter in src/worker.ts and the migration in migrations/.

To reproduce the offline checks from this project folder:

```powershell
node .\scripts\verify-preparation.mjs
```

This needs no npm install and creates no persistent database. It uses Node's [built-in SQLite module](https://nodejs.org/api/sqlite.html), already checked on the installed Node version. These are SQL/fixture checks; actual HTTP responses, D1 integration, and concurrent API requests still need testing.

## Local tools checked by the student

Versions supplied from the student's PowerShell output on 6 October 2026:

| Tool | Reported version |
|---|---|
| Node.js | v24.18.1 |
| npm | 11.16.0 |
| Git | 2.50.1.windows.1 |
| cURL | 8.21.0 |

The assistant also ran Node and the offline checks successfully with Node v24.18.1 and its SQLite 3.53.1. Compatibility with the instructor's dependencies must be checked when the starter is available.

## Local run instructions — Windows PowerShell

Prerequisite: Node.js 24 or newer with npm. Use `npm.cmd` in PowerShell because this machine blocks the unsigned `npm.ps1` wrapper. No execution-policy change is needed.

From the project folder:

```powershell
npm.cmd ci
npm.cmd run db:init
npm.cmd start
```

Leave that terminal running. Equipment seeds are loaded automatically; booking data persists in `data/campus.sqlite` across restarts. No external database service, .env file, auth token, or D1 binding is needed. `npm.cmd run dev` optionally restarts the server when source files change.

For a fresh Postman sequence, stop the server with Ctrl+C, then run:

```powershell
npm.cmd run db:reset
npm.cmd start
```

**db:reset deletes all bookings in the selected database.** Use only your disposable local test data. It preserves equipment and schema. Do not reset halfway through a test sequence.

Defaults: loopback interface `127.0.0.1`, port `8787`, API base URL `http://localhost:8787/api`. Set `$env:PORT = '8788'` before starting to change the port; update Postman's baseUrl too. `$env:DB_PATH` optionally selects another SQLite file. Relative paths resolve from the working directory. Normal startup preserves existing bookings.

Check equipment with `curl.exe -i http://localhost:8787/api/equipment`. Import both files in `postman/`, select **Campus Equipment Local**, and send requests in order; see [Postman instructions](postman/README.md).

Verification commands:

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run test:preparation
```

HTTP tests start/stop their own server on a free port and use a separate temporary SQLite database. They save actual request/response evidence without changing your Postman database. A deliberately logged database failure at the end is expected: that test verifies a safe JSON 500. The test database is retained in the system temporary directory for inspection.

The automated suite records its actual temporary base URL in TEST_EVIDENCE and the raw JSON artifact. Record the address you personally use in Postman separately.

## Exam timing and missing materials

The detailed brief gives a 120-minute task and a minute-30 checkpoint. The general announcement says 13:00–17:00, while the assignment text says 13:00–16:00 with a 16:00 deadline. Confirm the current deadline with the instructor or assignment page; use elapsed minutes for the implementation plan.

The supplied [Quality Gate](reference/quality_gate.md) and [cURL guide](reference/curl_test_guide.md) are now included and reviewed. Follow the Quality Gate after the first 30 minutes and again during the final five minutes. Use [INSTRUCTOR_CURL_CHECK.md](INSTRUCTOR_CURL_CHECK.md) for its test sequence in PowerShell; record actual responses in TEST_EVIDENCE.

## Cloudflare deployment

The public API uses Cloudflare Workers and D1; the local SQLite file is not uploaded.

```powershell
npm.cmd ci
npx.cmd wrangler login
npx.cmd wrangler d1 create campus-equipment-booking-db
```

Copy the returned database_id into the DB entry in wrangler.jsonc, then run:

```powershell
npm.cmd run cf:types
npm.cmd run cf:db:remote
npm.cmd run cf:deploy
```

Wrangler prints the actual workers.dev URL. Append `/api` for Postman's baseUrl, or `/api/equipment` to check the seeded equipment. This API permits public booking CRUD without authentication, so use it for demo data.

Local Worker verification: `npm.cmd run cf:db:local`, then `npm.cmd run cf:dev`.

For GitHub Builds, connect this repository and use `npm run check` as the build command and `npm run cf:deploy` as the deploy command. Apply the remote migration once before using the deployed API. The project name must match campus-equipment-booking-api.

Deployed API base URL: https://campus-equipment-booking-api.6731503094.workers.dev/api

Import postman/Cloudflare.postman_environment.json and select Campus Equipment Cloudflare to test the hosted API.
