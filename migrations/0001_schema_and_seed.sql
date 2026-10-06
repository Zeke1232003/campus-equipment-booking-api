-- Campus Equipment Booking API: apply this file before seed.sql.
-- Times are UTC epoch milliseconds; the API converts ISO strings to integers.
-- For ordinary SQLite, enable PRAGMA foreign_keys = ON on EVERY connection.
-- D1 already enforces foreign keys. Connection setup is intentionally separate.
-- IF NOT EXISTS permits repeated initialization; it does not upgrade old tables.

CREATE TABLE IF NOT EXISTS equipment (
    id TEXT PRIMARY KEY NOT NULL
        CHECK (length(trim(id)) BETWEEN 1 AND 100),
    name TEXT NOT NULL CHECK (length(trim(name)) > 0),
    location TEXT NOT NULL CHECK (length(trim(location)) > 0)
);

CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY NOT NULL
        CHECK (length(trim(id)) BETWEEN 1 AND 100),
    equipment_id TEXT NOT NULL
        REFERENCES equipment(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    borrower_name TEXT NOT NULL
        CHECK (length(trim(borrower_name)) BETWEEN 1 AND 100),
    start_at_ms INTEGER NOT NULL CHECK (typeof(start_at_ms) = 'integer'),
    end_at_ms INTEGER NOT NULL CHECK (typeof(end_at_ms) = 'integer'),
    purpose TEXT NOT NULL
        CHECK (length(trim(purpose)) BETWEEN 1 AND 500),
    CHECK (start_at_ms < end_at_ms)
);

CREATE INDEX IF NOT EXISTS bookings_equipment_time_idx
    ON bookings (equipment_id, start_at_ms, end_at_ms);

-- Half-open intervals [start, end): touching endpoints are allowed.
-- The valid-range guard lets the CHECK constraint reject equal/reversed times.
-- The application must map ONLY booking_time_conflict to an HTTP 409 error.
CREATE TRIGGER IF NOT EXISTS bookings_prevent_overlap_insert
BEFORE INSERT ON bookings
WHEN NEW.start_at_ms < NEW.end_at_ms
    AND EXISTS (
        SELECT 1
        FROM bookings AS existing
        WHERE existing.equipment_id = NEW.equipment_id
          AND existing.start_at_ms < NEW.end_at_ms
          AND existing.end_at_ms > NEW.start_at_ms
    )
BEGIN
    SELECT RAISE(ABORT, 'booking_time_conflict');
END;

-- OLD.id identifies the stored row to exclude even if its ID changes in SQL.
-- API clients will not be allowed to update the server-generated booking ID.
CREATE TRIGGER IF NOT EXISTS bookings_prevent_overlap_update
BEFORE UPDATE ON bookings
WHEN NEW.start_at_ms < NEW.end_at_ms
    AND EXISTS (
        SELECT 1
        FROM bookings AS existing
        WHERE existing.equipment_id = NEW.equipment_id
          AND existing.id <> OLD.id
          AND existing.start_at_ms < NEW.end_at_ms
          AND existing.end_at_ms > NEW.start_at_ms
    )
BEGIN
    SELECT RAISE(ABORT, 'booking_time_conflict');
END;

-- Apply schema.sql first. Seed equipment only so HTTP tests start without bookings.
-- Repeating this script preserves existing records and does not duplicate IDs.
-- Values below are fixed test data, not values received from API requests.

INSERT INTO equipment (id, name, location)
VALUES
    ('eq-1', 'Projector A', 'Building 1'),
    ('eq-2', 'Camera A', 'Media Lab')
ON CONFLICT(id) DO NOTHING;
