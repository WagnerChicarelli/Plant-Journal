import { query } from '../db/connection.js';

function rowToPlant(row, events = []) {
  return {
    id: row.id,
    name: row.name,
    species: row.species,
    location: row.location,
    wateringFrequency: row.watering_frequency,
    lastWatered: row.last_watered,
    notes: row.notes,
    createdAt: row.created_at,
    wateringHistory: events.map(e => ({
      wateredAt: e.watered_at,
      amount: e.amount,
      notes: e.notes
    }))
  };
}

export async function findAll() {
  const plantsResult = await query('SELECT * FROM plants ORDER BY created_at DESC');
  const plants = [];

  for (const row of plantsResult.rows) {
    const eventsResult = await query(
      'SELECT * FROM watering_events WHERE plant_id = $1 ORDER BY watered_at DESC',
      [row.id]
    );
    plants.push(rowToPlant(row, eventsResult.rows));
  }

  return plants;
}

export async function findById(id) {
  const result = await query('SELECT * FROM plants WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;

  const eventsResult = await query(
    'SELECT * FROM watering_events WHERE plant_id = $1 ORDER BY watered_at DESC',
    [id]
  );

  return rowToPlant(result.rows[0], eventsResult.rows);
}

export async function create(plant) {
  await query(
    `INSERT INTO plants (id, name, species, location, watering_frequency, last_watered, notes, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [plant.id, plant.name, plant.species, plant.location, plant.wateringFrequency, plant.lastWatered, plant.notes, plant.createdAt]
  );
  return plant;
}

export async function update(plant) {
  await query(
    `UPDATE plants SET name = $1, species = $2, location = $3, watering_frequency = $4, last_watered = $5, notes = $6
     WHERE id = $7`,
    [plant.name, plant.species, plant.location, plant.wateringFrequency, plant.lastWatered, plant.notes, plant.id]
  );
  return plant;
}

export async function addWateringEvent(event) {
  await query(
    `INSERT INTO watering_events (id, plant_id, watered_at, amount, notes)
     VALUES ($1, $2, $3, $4, $5)`,
    [event.id, event.plantId, event.wateredAt, event.amount, event.notes]
  );
  return event;
}

export async function getWateringEvents(plantId) {
  const result = await query(
    'SELECT * FROM watering_events WHERE plant_id = $1 ORDER BY watered_at DESC',
    [plantId]
  );
  return result.rows.map(e => ({
    wateredAt: e.watered_at,
    amount: e.amount,
    notes: e.notes
  }));
}
