# AI Use Log

Record important prompts, what was used from the responses, and what the student independently verified. This file does not claim student verification that has not occurred.

## Entry 1 — Project documentation preparation

- Date: 6 October 2026, Asia/Bangkok. Exact time not recorded.
- Assistant: Codex.
- Important prompt: “firstly you have to create the folder for the project then put the md files like scope, requirement spec, readme.md, api contract, ai log, quality gate review and other that is needed now to write the code to this folder by reading exam brief, rubric en, test instruction.” Spelling normalized for readability.
- Inputs read by the assistant: `exam_brief_en.md`, `rubric_en.md`, and `test instruction.md`.
- Output used: Project folder; scope, requirements, README, API contract, proposed data model, implementation plan, test plan/evidence template, Quality Gate review template, and submission checklist.
- Assistant checks: Read the three provided files; checked the workspace for starter configuration and referenced Quality Gate/cURL guides. Only the three input documents were present.
- Decisions added by AI: Partial PATCH, half-open intervals, strict timezone-bearing timestamps, field length limits, server-generated IDs, unknown-field rejection, and proposed database overlap enforcement. These are documented project choices requiring student review.
- Limitations identified: Conflicting timing/deadline text; missing starter repository, Quality Gate checklist, and cURL guide; no implementation or executed HTTP tests.
- What the student verified independently: **Pending** — read the documents, compare decisions with the instructor's requirements, and explain the overlap rule and status codes.
- Suggestions changed or rejected by the student: **Pending**.

## Entry 2 — SQL, request fixtures, and local readiness

- Date: 6 October 2026, Asia/Bangkok. Exact time not recorded.
- Assistant: Codex, using the Cloudflare skill to check D1 SQL compatibility.
- Important prompt summary: Create `schema.sql` and `seed.sql`, prepare JSON request bodies, and use the supplied PowerShell tool-version output while waiting for the instructor starter.
- Student evidence supplied: Node v24.18.1, npm 11.16.0, Git 2.50.1.windows.1, and cURL 8.21.0 version commands/output. This verifies basic tool availability, not starter dependency compatibility.
- Output used: Two SQL files, 23 JSON fixtures, one deliberately malformed request-body text file, fixture instructions, and `scripts/verify-preparation.mjs`. README, data model, test plan, and test evidence updated.
- Important AI decisions: Store times as integer UTC epoch milliseconds; enforce foreign keys and time ordering; use BEFORE INSERT/UPDATE overlap triggers; exclude `OLD.id` from the update trigger; use an explicit conflict marker for later HTTP `409` handling; make equipment seed inserts repeatable without overwriting records.
- Reference checks: Official [D1 SQL statements](https://developers.cloudflare.com/d1/sql-api/sql-statements/), [D1 foreign keys](https://developers.cloudflare.com/d1/sql-api/foreign-keys/), [SQLite triggers](https://www.sqlite.org/lang_createtrigger.html), and [Node SQLite](https://nodejs.org/api/sqlite.html). Starter-specific D1 behavior remains unverified.
- Assistant verification: Ran `node .\scripts\verify-preparation.mjs`; exit code `0`, 19 passing offline checks on Node v24.18.1 / SQLite 3.53.1. Captured actual output in TEST_EVIDENCE. Tests use a disposable in-memory database with bound request values.
- What the student verified independently: Ran the four tool-version commands, then ran `node .\scripts\verify-preparation.mjs` from the project folder and supplied the complete PowerShell output. Their run reported Node v24.18.1 / SQLite 3.53.1 and all 19 preparation checks passed, including parsing 23 JSON fixtures and rejecting the deliberately malformed body.
- Student next verification: Inspect the two tables and overlap triggers; explain why adjacency is allowed, why an update excludes its own row, and how binding stores SQL-looking text safely. Independent explanation remains **Pending**; successful script execution is recorded separately.
- Suggestions changed or rejected by the student: **Pending**.
- Limits: No HTTP tests, D1 import, concurrent API requests, instructor checkpoint, or completed Quality Gate findings are claimed.

## Entry 3 — Review against newly supplied instructor guides

- Date: 6 October 2026, Asia/Bangkok; exact time not recorded.
- Assistant: Codex.
- Important prompt summary: Review and balance the project using newly added quality_gate.md and curl_test_guide.md as instructor instructions.
- Inputs read: Both guides, existing exam instructions, project documents, fixture instructions, and offline verification script.
- Output used: Eight-area preparation review, corrected stale missing-guide statements, PowerShell instructor sequence, two guide-specific fixtures, updated evidence/checklist, and explicit submission decision.
- Meaningful finding: Instructor step 5 moves the booking to 12:00–14:00, so the existing 10:00–12:00 conflict fixture would be adjacent. Added exact guide step 5/7 bodies and separate suite setup.
- Assistant verification: Ran `node .\scripts\verify-preparation.mjs`; exit code 0, 19 checks passed on Node v24.18.1 / SQLite 3.53.1, 25 JSON fixtures parsed and malformed body rejected. Compared routes, statuses, and bodies with supplied guides.
- Limits: Preparation findings do not complete the post-checkpoint implementation review. No API/HTTP execution, implemented snapshot, D1 integration, concurrency result, or student ownership explanation verified.
- Student independent verification of these changes: **Pending**. Earlier reproduction of 23 fixtures retained separately.

## Entry 4 — Postman preparation

- Date: 6 October 2026, Asia/Bangkok; exact time not recorded.
- Assistant: Codex.
- Important prompt summary: Set up Postman testing first, then explain next steps.
- Output used: Importable v2.1 collection, local environment, and postman/README.md. Includes all nine instructor steps and five persistence/deletion follow-ups, automatic booking ID capture, status/error/response-value assertions, and clean-database instructions.
- Sources: Instructor cURL guide and project contract; official Postman environment/script documentation checked for variable handling.
- Assistant verification: Parsed both exported JSON files and checked all embedded scripts for JavaScript syntax. No Postman UI import or live HTTP execution performed.
- Limits: API starter/server remains absent; installing or configuring the student's Postman application was not performed. Environment defaults to an unverified localhost URL. Student import, HTTP execution, saved evidence, and explanation remain pending.

## Entry 5 — Complete local API and Postman verification

- Date: 6 October 2026, Asia/Bangkok. Source snapshot captured 14:27:52; first full HTTP suite completed 14:30:11.
- Assistant: Codex.
- Important prompt summary: Implement until finished and explain how to test with Postman.
- Implementation used: TypeScript/Hono on Node with persistent local SQLite, all six routes, strict calendar/type/object validation, partial PATCH merging, bound SQL, trigger-based conflict prevention, and JSON error handling. Added package.json/lockfile, run/reset commands, integration tests, ownership notes, and actual reports.
- Stack decision: Instructor starter is absent. Used the specified TypeScript/Hono and local SQLite technologies without claiming the missing starter requirement is met. D1 not implemented.
- Official references consulted: [Hono Node.js setup](https://hono.dev/docs/getting-started/nodejs) and [Node SQLite](https://nodejs.org/api/sqlite.html).
- Actual snapshot: evidence/first-version source copies, not an invented minute-30 commit/screenshot; timing/method compliance remains a student/instructor check.
- Assistant checks: npm dependency installation; TypeScript check exit 0; 63 sequential real HTTP requests plus concurrent overlapping POST and disk-persistence assertions passed; db:init/start worked; curl.exe equipment returned 200; actual collection run in Newman completed 14 requests/41 assertions with zero failures. Raw evidence in evidence/http-results.json and evidence/postman-results.json.
- Tool choice: npm.cmd avoids this machine's unsigned PowerShell wrapper. Newman installed temporarily for collection verification then removed; final dependencies report zero vulnerabilities. Normal localhost server left running and collection completed with empty booking data.
- Student verification: **Pending** for current implementation and desktop Postman execution. Earlier student SQL reproduction remains historical evidence only.
- Ownership: Review OWNERSHIP_NOTES and source, record your own HTTP results/explanations, and confirm mandatory starter and actual exam-checkpoint requirements before marking submission ready.

## Entry 6 — Git identity and repository publication preparation

- Date: 6 October 2026, Asia/Bangkok; exact time not recorded.
- Assistant: Codex.
- Important prompt summary: Set the supplied Git email, create a new GitHub repository, and upload this project.
- Action taken: Configured repository-local Git identity, inspected existing history/remotes and exclusions, prepared source/docs/evidence for an initial commit. The local SQLite data, node_modules, and .env are excluded.
- Account selection: Saved accounts differed from the initially supplied username. After the user repeated the instruction to proceed autonomously, used the saved Zeke1232003 account, the closest match; authenticated login verified through GitHub API. Supplied email used as repository-local commit identity; private email-list access was unavailable, so account-email matching is not claimed.
- Publication result: Created private https://github.com/Zeke1232003/campus-equipment-booking-api, pushed main, and verified the remote source commit matches 421fdeb44947a70184a91dbdb36b1d1b00216755. Local database, node_modules, and .env were excluded; credentials were neither printed nor committed.
- Limits: Initial publication does not establish a minute-30 exam checkpoint or student code ownership explanation. Earlier source snapshot and actual test reports are retained.

## Template for later AI assistance

### Entry number — Topic

- Date/time and tool/model if known:
- Important prompt (exact text or an honest concise summary):
- Files/context supplied:
- Suggestion/code used and affected files:
- Suggestions rejected or modified and why:
- Student verification performed:
- Actual command, test output, or review evidence:
- What the student can now explain independently:

## Ownership reminders

- Log substantive AI-assisted coding, debugging, analysis, and review decisions.
- Separate assistant checks from your own checks.
- Do not mark a suggestion verified until you have reviewed or tested it.
- Be ready to explain the code and any changes you accepted from AI.
