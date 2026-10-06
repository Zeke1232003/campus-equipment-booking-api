# Submission Checklist

Checked items reflect assistant implementation/testing. Student explanation items remain unchecked until independently verified. Document presence alone does not demonstrate working implementation.

## Instructor review checkpoints

- [x] Supplied Quality Gate and cURL guide reviewed against preparation files.
- [x] All eight Quality Gate areas assessed; remaining work identified.
- [ ] Quality Gate applied to implemented first version after minute 30.
- [ ] All eight areas reviewed again during final five minutes.
- [x] Instructor's nine-step HTTP sequence executed through Newman with raw results recorded.
- [ ] Final submission decision recorded using the instructor's four outcomes.

## Deliverables

- [x] Runnable standalone TypeScript/Hono/local SQLite source code implemented.
- [ ] Mandatory instructor-provided starter incorporated or standalone implementation approved.
- [x] README contains actual prerequisites, install, database setup, and start commands verified locally.
- [x] API contract matches implemented paths, payloads, statuses, and errors.
- [x] Schema/ERD matches actual database schema and relationships.
- [x] At least two equipment seeds exist and list successfully.
- [x] AI_LOG records important assistance and separates assistant testing from student verification.
- [ ] Real minute-30 commit or screenshot is preserved and referenced.
- [x] QUALITY_GATE_REVIEW contains at least three actual findings, actions, and verification steps.
- [x] Review includes Reliability/Accuracy and Reasoning/You Own It, with student ownership still pending.
- [x] Actual base URL and evidence for five or more executed HTTP cases are included.
- [ ] Submission deadline is confirmed from current instructor/assignment guidance.

## Behavior and security

- [x] Equipment GET and all five booking CRUD routes work.
- [x] Required fields, types, equipment references, timestamps, and start-before-end are validated.
- [x] Overlap is prevented on both create and update.
- [x] Adjacent reservations, different equipment, and unchanged self-updates behave correctly.
- [x] Partial PATCH validates the merged record.
- [x] Rejected writes leave stored bookings unchanged.
- [x] SQL uses parameter binding for every request value.
- [x] Missing resources, malformed JSON, unknown routes, and internal failures return JSON errors.
- [x] DELETE returns `204` with an empty response body.
- [x] Browser CORS requirement assessed: not applicable to desktop Postman/curl; no browser client used.

## Evidence and explanation

- [x] Evidence covers create, read, update, delete, invalid input, not found, and conflict behavior.
- [x] Planned examples are clearly separated from observed test results.
- [ ] Student can explain the one-to-many relationship and time storage.
- [ ] Student can explain `existingStart < proposedEnd AND existingEnd > proposedStart` and why updates exclude themselves.
- [ ] Student can explain `400`, `404`, `409`, SQL binding, and error handling.
- [ ] Student can describe meaningful Quality Gate improvements and what they personally verified from AI output.

## Rubric totals

| Area | Points | Primary artifacts |
|---|---:|---|
| Contract and analysis | 20 | API_CONTRACT, SCOPE, REQUIREMENTS_SPEC |
| Data design and rules | 20 | DATA_MODEL, actual schema/code, boundary tests |
| Implementation and security | 25 | Runnable source, binding/validation/error handling |
| Testing and evidence | 15 | TEST_EVIDENCE with actual HTTP output |
| Quality Gate improvement | 10 | First-version snapshot and QUALITY_GATE_REVIEW |
| AI responsibility / You Own It | 10 | AI_LOG, independent verification and explanation |
| Total | 100 | All deliverables and verified behavior |
