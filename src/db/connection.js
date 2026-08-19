import initSqlJs from 'sql.js';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(currentDirectory, '..', '..', 'data', 'plant.db');

let db = null;

export async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();
  db = new SQL.Database();

  if (existsSync(dbPath)) {
    const buffer = await readFile(dbPath);
    db = new SQL.Database(buffer);
  }

  return db;
}

export async function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  await writeFile(dbPath, buffer);
}
