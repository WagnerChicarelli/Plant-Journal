import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb, saveDb } from './connection.js';
import { runMigrations } from './migrations.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(currentDirectory, '..', '..', 'data', 'plants.json');

async function migrate() {
  await runMigrations();
  const db = await getDb();

  const existing = db.exec('SELECT COUNT(*) as count FROM plants');
  if (existing[0]?.values[0][0] > 0) {
    console.log('Banco já contém dados. Migração ignorada.');
    return;
  }

  let plants;
  try {
    const content = await readFile(jsonPath, 'utf8');
    plants = JSON.parse(content);
  } catch {
    console.log('Arquivo plants.json não encontrado. Nada para migrar.');
    return;
  }

  if (!Array.isArray(plants) || plants.length === 0) {
    console.log('Nenhum dado para migrar.');
    return;
  }

  for (const plant of plants) {
    db.run(
      `INSERT INTO plants (id, name, species, location, watering_frequency, last_watered, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [plant.id, plant.name, plant.species, plant.location, plant.wateringFrequency, plant.lastWatered, plant.notes, plant.createdAt]
    );

    for (const event of (plant.wateringHistory || [])) {
      db.run(
        `INSERT INTO watering_events (id, plant_id, watered_at, amount, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), plant.id, event.wateredAt, event.amount, event.notes]
      );
    }
  }

  await saveDb();
  console.log(`${plants.length} planta(s) migrada(s) com sucesso.`);
}

migrate().catch(console.error);
