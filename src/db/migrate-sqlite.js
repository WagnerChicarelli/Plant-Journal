import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import initSqlJs from 'sql.js';
import { query } from './connection.js';
import { runMigrations } from './migrations.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const sqlitePath = path.join(currentDirectory, '..', '..', 'data', 'plant.db');

async function migrateFromSQLite() {
  await runMigrations();

  const existing = await query('SELECT COUNT(*) as count FROM plants');
  if (parseInt(existing.rows[0].count) > 0) {
    console.log('PostgreSQL já contém dados. Migração ignorada.');
    return;
  }

  const SQL = await initSqlJs();
  let db;

  try {
    const buffer = await readFile(sqlitePath);
    db = new SQL.Database(buffer);
  } catch {
    console.log('Arquivo plant.db não encontrado. Nada para migrar.');
    return;
  }

  const plantsResult = db.exec('SELECT * FROM plants');
  if (plantsResult.length === 0) {
    console.log('Nenhum dado encontrado no SQLite.');
    return;
  }

  const columns = plantsResult[0].columns;
  const plants = plantsResult[0].values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  });

  let count = 0;

  for (const plant of plants) {
    await query(
      `INSERT INTO plants (id, name, species, location, watering_frequency, last_watered, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [plant.id, plant.name, plant.species, plant.location, plant.watering_frequency, plant.last_watered, plant.notes, plant.created_at]
    );

    const eventsResult = db.exec(`SELECT * FROM watering_events WHERE plant_id = '${plant.id}'`);
    if (eventsResult.length > 0) {
      const eventColumns = eventsResult[0].columns;
      for (const eventRow of eventsResult[0].values) {
        const event = {};
        eventColumns.forEach((col, i) => event[col] = eventRow[i]);

        const { randomUUID } = await import('node:crypto');
        await query(
          `INSERT INTO watering_events (id, plant_id, watered_at, amount, notes)
           VALUES ($1, $2, $3, $4, $5)`,
          [randomUUID(), event.plant_id, event.watered_at, event.amount, event.notes]
        );
      }
    }

    count++;
    console.log(`Migrada: ${plant.name}`);
  }

  db.close();
  console.log(`\n${count} planta(s) migrada(s) do SQLite para PostgreSQL com sucesso.`);
}

migrateFromSQLite().catch(console.error);
