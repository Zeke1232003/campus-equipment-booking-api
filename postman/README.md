# Postman setup

The local API is implemented and the collection passed in Newman against `http://localhost:8787/api`: 14 requests, 41 assertions, zero failures. Raw report: [evidence/postman-results.json](../evidence/postman-results.json). This verifies collection scripts, not a personal run in your Postman desktop app.

## Import and configure

1. Open the Postman desktop app. If needed, obtain it from https://www.postman.com/downloads/.
2. Choose Import and select both files from this folder: Campus-Equipment.postman_collection.json and Local.postman_environment.json.
3. Select the **Campus Equipment Local** environment. Its baseUrl defaults to `http://localhost:8787/api`; update it to the actual server address, with `/api` and no trailing slash.
4. Keep bookingId and expectedBooking blank initially. The collection manages them automatically. No authorization is required by the current contract.

Postman's environment variables are described at https://learning.postman.com/docs/use/send-requests/variables/environment-variables. Scripts use the selected environment to retain the created booking ID across requests.

## What to do next

1. Open a PowerShell terminal in campus-equipment-booking-api. Dependencies are already installed in this workspace; on a fresh checkout run `npm.cmd ci` first.
2. If the server is not running, run `npm.cmd run db:init`, then `npm.cmd start`. Schema and eq-1/eq-2 seeds are applied automatically; the local database file is data/campus.sqlite. Leave the terminal running.
3. Set baseUrl to `http://localhost:8787/api`. Start with no bookings. For a clean repeat run, stop the server with Ctrl+C, run `npm.cmd run db:reset`, then `npm.cmd start`. Reset deletes all bookings in the selected database; use disposable local test data only. If the assistant's server is still running, use it directly rather than launching a second server on the same port.
4. In Postman, open **01 List equipment** and click Send. Expect 200 and at least two equipment records. If you get a connection error, confirm the server is running and the address/port match. Stop and resolve a failed response or test before continuing.
5. Send each request in collection order. Request 03 saves the actual ID automatically. Do not manually invent an ID. The nine instructor steps plus five follow-ups make 14 requests.
6. Inspect each response status, body, and test results. Request 05 moves the booking to 12:00–14:00; request 07 tests a conflict inside that updated interval. Keep these data separate from the extended TEST_PLAN suite.
7. Save screenshots or raw response output in TEST_EVIDENCE.md. Include date/time, actual base URL, request method/path/body, observed status/body, and test results. Preserve errors and any retest results. Cover create/read/update/delete, invalid input, not found, and conflict.
8. Review the completed assistant Quality Gate findings and OWNERSHIP_NOTES, add your own testing/explanations to AI_LOG and TEST_EVIDENCE, and repeat all eight areas during the final five minutes. The missing instructor starter and exact checkpoint timing remain course-compliance checks.

Alternatively, use the collection runner for one iteration with the same environment and all requests in order. Review every failure. A clean initial database is required; do not reset the database while the sequence is in progress. Successful completion leaves no bookings. If a run stops early, use the actual captured booking ID to clean up your test record or reset only the disposable test database before restarting.

Tests check statuses, JSON/error shapes, equipment seeds, required booking values, update persistence, unchanged data after rejection, and deletion with an empty 204 body. This starter collection does not cover every extended boundary test, update conflict, concurrency, application SQL binding, or D1 behavior. Those remain in TEST_PLAN.

## Hosted API

Import Cloudflare.postman_environment.json and select Campus Equipment Cloudflare. Its baseUrl points to the deployed Worker API. Use demo data; booking CRUD is public.
