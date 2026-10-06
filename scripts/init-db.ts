import { openDatabase, defaultDatabasePath } from '../src/database.js';

const db = openDatabase();
try {
  // Explicit opt-in; preserve schema/equipment and clear only local bookings.
  if (process.argv.includes('--reset-bookings')) db.exec('DELETE FROM bookings');
  console.log(`Database ready: ${process.env.DB_PATH ?? defaultDatabasePath}`);
  console.log(db.prepare('SELECT id, name, location FROM equipment ORDER BY id').all());
} finally { db.close(); }
