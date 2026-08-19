import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from './connection.js';
import { runMigrations } from './migrations.js';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(currentDirectory, '..', '..', 'data', 'plants.json');

async function migrate() {
  await runMigrations();

  const existing = await query('SELECT COUNT(*) as count FROM plants');
  if (parseInt(existing.rows[0].count) > 0) {
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
    await query(
      `INSERT INTO plants (id, name, species, location, watering_frequency, last_watered, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [plant.id, plant.name, plant.species, plant.location, plant.wateringFrequency, plant.lastWatered, plant.notes, plant.createdAt]
    );

    for (const event of (plant.wateringHistory || [])) {
      const { randomUUID } = await import('node:crypto');
      await query(
        `INSERT INTO watering_events (id, plant_id, watered_at, amount, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [randomUUID(), plant.id, event.wateredAt, event.amount, event.notes]
      );
    }
  }

  console.log(`${plants.length} planta(s) migrada(s) com sucesso.`);
}

migrate().catch(console.error);
