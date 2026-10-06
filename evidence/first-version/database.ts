import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const defaultDatabasePath = resolve(root, 'data/campus.sqlite');

export function openDatabase(path = process.env.DB_PATH ?? defaultDatabasePath) {
  if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true });
  const db = new DatabaseSync(path, { timeout: 5000 });
  db.exec('PRAGMA foreign_keys = ON');
  try {
    db.exec(readFileSync(resolve(root, 'schema.sql'), 'utf8'));
    db.exec(readFileSync(resolve(root, 'seed.sql'), 'utf8'));
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}
