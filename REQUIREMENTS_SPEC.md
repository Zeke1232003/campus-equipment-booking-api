# Requirements Specification

Source: [exam brief](reference/exam_brief_en.md), [rubric](reference/rubric_en.md), and [test instructions](reference/test%20instruction.md).

## Functional requirements

| ID | Requirement | Acceptance criterion |
|---|---|---|
| FR-01 | List equipment | `GET /api/equipment` returns `200` and an array with at least two seeded records, each containing `id`, `name`, `location` |
| FR-02 | List bookings | `GET /api/bookings` returns `200` and an array; empty database returns `[]` |
| FR-03 | Retrieve booking | `GET /api/bookings/:id` returns `200` with the booking or `404` with a JSON error |
| FR-04 | Create booking | Valid `POST /api/bookings` persists a booking and returns `201` with all required response fields |
| FR-05 | Update booking | Valid `PATCH /api/bookings/:id` returns `200`; omitted fields remain unchanged; merged data satisfies all rules |
| FR-06 | Delete booking | Existing booking is removed with `204` and no response body; missing booking returns `404` |
| FR-07 | Check equipment | Create/update accepts only an existing equipment ID; unknown reference returns `400` |
| FR-08 | Validate data | Missing/invalid data and malformed JSON return `400`; invalid input leaves stored data unchanged |
| FR-09 | Order timestamps | Every stored booking satisfies `startAt < endAt`; equality and reversal return `400` |
| FR-10 | Prevent overlap | Same-equipment overlap returns `409` on create/update; adjacent intervals and different equipment are allowed |
| FR-11 | Standardize errors | All application error responses are JSON objects with a string `error` field |
| FR-12 | Support browser tester when used | Preflight and success/error requests work for the tester's configured origin |

## Implementation and evidence requirements

| ID | Requirement | Acceptance criterion |
|---|---|---|
| NFR-01 | Safe SQL | Every request-derived query value uses placeholders and binding; queries contain no concatenated request data |
| NFR-02 | Persistent relational data | Equipment and bookings use primary keys, a foreign key relationship, and an appropriate time representation |
| NFR-03 | Reliable writes | Conflict protection guards create and update at the database level or through supported transactional behavior; a check-then-write gap is addressed |
| NFR-04 | Local operation | Documented install, database initialization, and start commands reproduce a working API from the supplied starter |
| NFR-05 | Controlled server errors | Unexpected failures return `500` with a safe JSON message; SQL, stack traces, and secrets are excluded from responses |
| E-01 | HTTP evidence | At least five executed cases cover create/read/update/delete and error behavior; actual base URL, commands, statuses, and bodies are recorded |
| E-02 | Initial snapshot | Commit or screenshot captures the real first version at minute 30 |
| E-03 | Quality Gate review | At least three genuine findings show what was found, how it was fixed, and verification; include Reliability/Accuracy and Reasoning/You Own It |
| E-04 | AI responsibility | Important prompts, adopted suggestions, rejected/changed suggestions where relevant, and student verification are logged |
| E-05 | Explainability | Student can explain schema, status choices, parameter binding, overlap detection, PATCH merging, and tests |

## Detailed field rules

See [API_CONTRACT.md](API_CONTRACT.md). Field length limits, timezone normalization, unknown-field rejection, and partial PATCH semantics are project decisions, not explicitly prescribed by the brief.

## Rubric mapping

| Rubric area | Points | Relevant requirements and evidence |
|---|---:|---|
| API contract and analysis | 20 | FR-01–FR-12; API contract and scope decisions |
| Data design and business rules | 20 | FR-07–FR-10, NFR-02–NFR-03; data model and boundary tests |
| Implementation and security | 25 | FR-01–FR-11, NFR-01, NFR-04–NFR-05; code and HTTP results |
| Testing and evidence | 15 | E-01; test plan and actual output |
| Quality Gate improvement | 10 | E-02–E-03; snapshot and verified changes |
| AI responsibility / You Own It | 10 | E-04–E-05; AI log and independent explanation |
