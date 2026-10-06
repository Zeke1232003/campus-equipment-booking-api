# Explain your API

Read the source and verify these explanations yourself before submitting. These notes are AI-assisted learning material, not evidence that you have already explained the work independently.

- src/server.ts starts Hono on 127.0.0.1:8787. src/app.ts defines GET equipment and booking list/detail, POST, PATCH, and DELETE.
- src/database.ts opens the SQLite file, enables foreign keys, applies schema and seeds. Starting the server preserves bookings. npm.cmd run db:reset explicitly clears bookings for a fresh local test run.
- Equipment has many bookings. Each booking refers to equipment through equipment_id. API responses use camelCase and ISO timestamps; SQLite stores snake_case columns and integer UTC milliseconds.
- src/validation.ts rejects non-object JSON, unknown fields, missing/wrong-type/blank text, impossible dates, timestamps without timezone, and startAt >= endAt. Checking the calendar separately avoids Date.parse silently normalizing 30 February.
- PATCH loads the existing booking, merges provided fields, and validates the complete result. Changing only startAt must still be checked against the stored endAt.
- Overlap means existingStart < proposedEnd AND existingEnd > proposedStart for the same equipment. The strict inequalities allow a booking to end exactly when the next starts. The update trigger excludes OLD.id so a booking does not conflict with itself.
- Overlap triggers run during INSERT/UPDATE. They avoid relying solely on a separate availability check that two simultaneous requests could both pass. The trigger's exact booking_time_conflict message becomes HTTP 409.
- Every request value is passed as a bound SQL argument. User input never chooses SQL columns or gets concatenated into SQL. SQL-looking borrower text is stored literally.
- 400 means invalid data, including nonexistent equipment in a payload. 404 means the requested booking or route does not exist. 409 means another booking reserves that equipment for overlapping time. DELETE succeeds with 204 and no body. Unexpected failures become a safe JSON 500.
- Postman request 03 saves the returned ID. Request 05 moves the booking to 12:00–14:00; request 07 tries 12:30–13:30 and must return 409. Sending the earlier 10:00–12:00 fixture after this update would only touch the endpoint and should be allowed.
- tests use an isolated database and actual HTTP requests. Disk persistence is checked through a second connection. The final database-failure test closes only the isolated database to verify safe error handling.
- Local SQLite was selected because the instructor starter was absent. D1 integration is not implemented or claimed; adapt this project to the instructor starter if it is mandatory. No CORS is needed for desktop Postman or curl.

Student verification to record: your own commands/output, three improvements you understand, your actual checkpoint, and your explanations of validation, triggers, binding, and test outcomes.
