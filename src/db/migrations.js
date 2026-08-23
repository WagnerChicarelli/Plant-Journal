import { query } from './connection.js';

export async function runMigrations() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL,
      email_confirmed BOOLEAN DEFAULT FALSE,
      confirmation_token TEXT,
      confirmation_expires TEXT
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS plants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      species TEXT DEFAULT '',
      location TEXT DEFAULT '',
      watering_frequency INTEGER NOT NULL DEFAULT 7,
      last_watered TEXT,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await query(`
    DO $$ BEGIN
      ALTER TABLE plants ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;
  `);

  await query(`
    DO $$ BEGIN
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT FALSE;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;
  `);

  await query(`
    DO $$ BEGIN
      ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_token TEXT;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;
  `);

  await query(`
    DO $$ BEGIN
      ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_expires TEXT;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS watering_events (
      id TEXT PRIMARY KEY,
      plant_id TEXT NOT NULL,
      watered_at TEXT NOT NULL,
      amount TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE CASCADE
    )
  `);

  await query(`CREATE INDEX IF NOT EXISTS idx_watering_plant_id ON watering_events(plant_id)`);

  try {
    await query(`CREATE INDEX IF NOT EXISTS idx_plants_user_id ON plants(user_id)`);
  } catch {
    // Index might already exist
  }
}
