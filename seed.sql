-- Apply schema.sql first. Seed equipment only so HTTP tests start without bookings.
-- Repeating this script preserves existing records and does not duplicate IDs.
-- Values below are fixed test data, not values received from API requests.

INSERT INTO equipment (id, name, location)
VALUES
    ('eq-1', 'Projector A', 'Building 1'),
    ('eq-2', 'Camera A', 'Media Lab')
ON CONFLICT(id) DO NOTHING;
