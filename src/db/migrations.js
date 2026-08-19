import { getDb } from './connection.js';

export async function runMigrations() {
  const db = await getDb();

  db.run(`
    CREATE TABLE IF NOT EXISTS plants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      species TEXT DEFAULT '',
      location TEXT DEFAULT '',
      watering_frequency INTEGER NOT NULL DEFAULT 7,
      last_watered TEXT,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS watering_events (
      id TEXT PRIMARY KEY,
      plant_id TEXT NOT NULL,
      watered_at TEXT NOT NULL,
      amount TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_watering_plant_id ON watering_events(plant_id)`);
}
