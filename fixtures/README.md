# HTTP Request Fixtures

These are request bodies for the implemented local API. The live HTTP suite and Newman verified the covered cases; see TEST_EVIDENCE for actual output and limits. All `.json` files contain syntactically valid JSON, including intentionally invalid API payloads. `malformed-body.txt` intentionally contains broken JSON.

## Sequence and saved IDs

Start with equipment seeds and no bookings. Create A using `create-valid.json`, B using `create-adjacent.json`, and C using `create-other-equipment.json`. Replace `ACTUAL_A_ID`, `ACTUAL_B_ID`, and `ACTUAL_C_ID` in commands with IDs from the API responses; fixture files contain no generated IDs.

Run overlap tests while A exists. Run the B update-conflict test after creating B, and the C equipment-change test after creating C. DELETE A only after its read/update/conflict cases. Reposting `create-valid.json` after deleting A should succeed. GET and DELETE requests require no JSON fixture.

| Fixture | Method/target | Test ID | Expected result and setup |
|---|---|---|---|
| [create-valid.json](create-valid.json) | POST `/bookings` | T03 / T23 / G03 | `201`; save ID as A; reuse after deletion |
| [guide-patch-full.json](guide-patch-full.json) | PATCH `/bookings/A` | G05 | `200`; instructor sequence only; moves A to 12:00–14:00 |
| [guide-create-overlap.json](guide-create-overlap.json) | POST `/bookings` | G07 | `409`; instructor sequence only; run after successful G05 |
| [create-missing-borrower.json](create-missing-borrower.json) | POST `/bookings` | T05 | `400`; missing required borrower |
| [create-unknown-equipment.json](create-unknown-equipment.json) | POST `/bookings` | T06 | `400`; equipment does not exist |
| [create-invalid-range.json](create-invalid-range.json) | POST `/bookings` | T07 | `400`; start is later than end |
| [create-equal-times.json](create-equal-times.json) | POST `/bookings` | T07 | `400`; zero-length interval |
| [create-invalid-date.json](create-invalid-date.json) | POST `/bookings` | T08 | `400`; 30 February is not a calendar date |
| [create-overlap.json](create-overlap.json) | POST `/bookings` | T09 | `409`; A must exist |
| [create-adjacent.json](create-adjacent.json) | POST `/bookings` | T11 | `201`; touches A's end; save ID as B |
| [create-other-equipment.json](create-other-equipment.json) | POST `/bookings` | T12 | `201`; same time on eq-2; save ID as C |
| [create-offset-overlap.json](create-offset-overlap.json) | POST `/bookings` | T26 | `409`; +07:00 times equal 09:30–10:00 UTC; A must exist |
| [create-sql-text.json](create-sql-text.json) | POST `/bookings` | T21 | `201`; SQL-looking borrower is text; tables remain intact |
| [patch-purpose.json](patch-purpose.json) | PATCH `/bookings/A` | T13 / T18 | `200` for A; `404` when targeting missing ID |
| [patch-self-times.json](patch-self-times.json) | PATCH `/bookings/A` | T14 | `200`; unchanged times must not conflict with itself |
| [patch-overlap.json](patch-overlap.json) | PATCH `/bookings/B` | T15 | `409`; overlaps A; B unchanged |
| [patch-invalid-range.json](patch-invalid-range.json) | PATCH `/bookings/A` | T16 | `400`; supplied start exceeds stored end |
| [patch-equipment-conflict.json](patch-equipment-conflict.json) | PATCH `/bookings/C` | T17 | `409`; moving C to eq-1 overlaps A |
| [patch-empty.json](patch-empty.json) | PATCH `/bookings/A` | T20 | `400`; no editable fields |
| [invalid-wrong-type.json](invalid-wrong-type.json) | POST `/bookings` | T19 | `400`; numeric borrower |
| [invalid-blank-borrower.json](invalid-blank-borrower.json) | POST `/bookings` | T19 | `400`; whitespace-only borrower |
| [invalid-unknown-field.json](invalid-unknown-field.json) | POST or PATCH | T19 / T20 | `400`; unsupported field |
| [invalid-null-field.json](invalid-null-field.json) | POST `/bookings` | T19 | `400`; null purpose |
| [invalid-array.json](invalid-array.json) | POST `/bookings` | T19 | `400`; body must be an object |
| [invalid-null-body.json](invalid-null-body.json) | POST `/bookings` | T19 | `400`; body must be an object |
| [malformed-body.txt](malformed-body.txt) | POST `/bookings` | T19 | `400`; malformed JSON |

Other cases and subcases remain in [TEST_PLAN.md](../TEST_PLAN.md). The instructor's nine-step sequence is in [INSTRUCTOR_CURL_CHECK.md](../INSTRUCTOR_CURL_CHECK.md). Run these two suites independently with clean booking data because their update and conflict intervals differ.

## PowerShell examples

Run from the project folder. Change the URL if the starter uses another port. These are future HTTP commands and have not been run:

```powershell
curl.exe -i http://localhost:8787/api/equipment

curl.exe -i -X POST http://localhost:8787/api/bookings -H "Content-Type: application/json" --data-binary "@fixtures/create-valid.json"

curl.exe -i -X POST http://localhost:8787/api/bookings -H "Content-Type: application/json" --data-binary "@fixtures/create-overlap.json"

curl.exe -i -X PATCH http://localhost:8787/api/bookings/ACTUAL_A_ID -H "Content-Type: application/json" --data-binary "@fixtures/patch-purpose.json"

curl.exe -i -X DELETE http://localhost:8787/api/bookings/ACTUAL_A_ID
```

For `malformed-body.txt`, keep `Content-Type: application/json`; its contents are deliberately malformed, despite the `.txt` filename. Capture the actual request and raw response in [TEST_EVIDENCE.md](../TEST_EVIDENCE.md).
