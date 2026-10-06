# Instructor cURL Check — PowerShell

Source: [the instructor's guide](reference/curl_test_guide.md). The equivalent Postman collection has passed 14 requests and 41 assertions in Newman; these exact curl commands remain examples, not a recorded curl run. Start the API with `npm.cmd start` from this project folder. Use seeded equipment and an empty disposable booking database. Run this sequence separately from the extended TEST_PLAN; the PATCH below changes the times needed for the conflict case.

Use `curl.exe` explicitly in PowerShell. The instructor's Bash variable assignments and backslash continuations need PowerShell equivalents. JSON fixture files avoid shell quoting problems.

```powershell
$BaseUrl = 'http://localhost:8787/api'

# G01: equipment — 200, equipment array with at least two records
curl.exe -i "$BaseUrl/equipment"

# G02: bookings — 200, initially []
curl.exe -i "$BaseUrl/bookings"

# G03: create — 201, booking with generated id and all required fields
curl.exe -i -X POST "$BaseUrl/bookings" -H 'Content-Type: application/json' --data-binary '@fixtures/create-valid.json'
```

Copy the actual `id` from G03 into the variable below. Stop if creation failed; do not use an invented ID.

```powershell
$BookingId = 'replace-with-the-actual-booking-id'

# G04: retrieve — 200, same booking as G03
curl.exe -i "$BaseUrl/bookings/$BookingId"

# G05: full update — 200, eq-1 now reserved from 12:00 to 14:00 UTC
curl.exe -i -X PATCH "$BaseUrl/bookings/$BookingId" -H 'Content-Type: application/json' --data-binary '@fixtures/guide-patch-full.json'

# G06: reversed time range — 400, JSON error
curl.exe -i -X POST "$BaseUrl/bookings" -H 'Content-Type: application/json' --data-binary '@fixtures/create-invalid-range.json'

# G07: overlap with updated booking — 409, JSON error
curl.exe -i -X POST "$BaseUrl/bookings" -H 'Content-Type: application/json' --data-binary '@fixtures/guide-create-overlap.json'

# G08: nonexistent booking — 404, JSON error
curl.exe -i "$BaseUrl/bookings/not-found"

# G09: delete — 204, empty response body
curl.exe -i -X DELETE "$BaseUrl/bookings/$BookingId"

# Follow-up: deleted booking — 404, JSON error
curl.exe -i "$BaseUrl/bookings/$BookingId"
```

G06 uses the existing reversed-range fixture; its dates differ from the guide but exercise the same rule. G05 and G07 reproduce the guide's exact bodies. Do not substitute `create-overlap.json` for G07: that fixture overlaps the earlier 09:00–11:00 reservation, not the updated one.

For each request, preserve the command, actual URL/ID, status, headers, and raw body in [TEST_EVIDENCE.md](TEST_EVIDENCE.md). Check all six booking response fields and JSON arrays for list routes. After G05, GET the booking to confirm persistence. After G06/G07, list bookings to confirm no extra record was created and GET the original to confirm it was not changed. Every error must have a string `error` property; G09 must have no body.

Passing this sequence covers the instructor's required create, read, update, delete, invalid input, not found, and conflict evidence. Also run the extended tests for partial PATCH, self-update, update conflicts, adjacency, equipment changes, malformed JSON, and parameter binding.
