# Implementation Plan

Implementation completed with standalone TypeScript/Hono and Node local SQLite because the instructor starter was absent. Current source: src/app.ts, src/validation.ts, src/database.ts, src/server.ts. Setup/testing commands are verified in README; raw results are in evidence/. The planning sequence below records the intended approach; mandatory starter compatibility and student checkpoint/ownership still require confirmation.

## Before coding

1. Obtain and inspect the instructor starter: package scripts, runtime, database binding/adapter, local configuration, and any repository instructions.
2. Check [SCOPE.md](SCOPE.md) decisions against instructor guidance. Resolve the current submission deadline separately from the 120-minute work plan.
3. Confirm the API contract and schema against the supplied reference/quality_gate.md and reference/curl_test_guide.md. Use INSTRUCTOR_CURL_CHECK.md for the PowerShell test sequence.

## Suggested responsibilities

Use existing starter conventions. Avoid creating an elaborate structure for a small API.

| Responsibility | Contents |
|---|---|
| Application entry | Hono setup, `/api` routes, JSON errors, optional CORS |
| Booking validation | Allowed fields, JSON types, trimmed strings, strict timestamp/calendar checks, create/PATCH rules |
| Database access | Bound equipment lookup, booking reads/writes, overlap queries, response mapping |
| Database migrations/seeds | Two tables, index, overlap enforcement, equipment seeds |
| HTTP verification | Request fixtures or commands and captured evidence |

Choose actual file names after inspecting the starter. The `reference/` folder contains exam documents, not runtime code.

## Coding order

1. Make the supplied server start locally and confirm the actual base URL.
2. Initialize the schema and two equipment seeds; implement equipment listing.
3. Implement booking list/get and JSON `404` behavior.
4. Implement POST validation, equipment lookup, time conversion, conflict detection, bound insertion, and `201` response.
5. Implement PATCH: load, merge, validate, check overlap excluding itself, update, and return `200`.
6. Implement DELETE with `204` or `404`; verify persistence and absence of a response body.
7. Add database write protection against overlap, safe exception handling, and JSON responses for malformed JSON/unknown routes.
8. Add CORS if connecting a browser tester; verify preflight and an error response.
9. Execute the planned tests and record actual results, fixing failures before marking them passed.
10. Replace README placeholders with verified commands and update the AI log and review.

## Elapsed-minute plan from the detailed brief

| Minute | Work |
|---|---|
| 0–10 | Read, document assumptions, plan contract/schema |
| 10–30 | Build initial version; prioritize a working database and booking create/read flow |
| 30 | Stop to commit or save a screenshot of the actual first version |
| 30–90 | Apply instructor Quality Gate; finish CRUD and improve validation, conflict checks, and error handling |
| 90–110 | Run HTTP success/error tests and collect evidence |
| 110–120 | Final checks, package submission, explain decisions |

If a git repository is available, record the snapshot commit hash. Otherwise save a screenshot as allowed by the brief. Do not invent a checkpoint or retroactively label later work as the minute-30 version.

## Review priorities

- Ensure overlapping POST and PATCH requests fail without modifying data.
- Validate merged PATCH values and exclude the booking itself from conflict detection.
- Validate real calendar dates rather than relying only on permissive date parsing.
- Ensure all SQL request values are bound and framework errors are JSON.
- Execute at least five cases spanning CRUD, invalid input, not found, and conflict; the full planned set provides stronger coverage.
- Explain the overlap predicate, status choices, and AI-assisted decisions in the student's own words.
