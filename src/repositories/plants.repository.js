import { getDb, saveDb } from '../db/connection.js';

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
  const db = await getDb();
  const plants = db.exec('SELECT * FROM plants');
  if (plants.length === 0) return [];

  return plants[0].values.map(row => {
    const columns = plants[0].columns;
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return obj;
  }).map(row => {
    const events = db.exec(`SELECT * FROM watering_events WHERE plant_id = '${row.id}'`);
    const eventRows = events.length > 0
      ? events[0].values.map(e => {
          const obj = {};
          events[0].columns.forEach((col, i) => obj[col] = e[i]);
          return obj;
        })
      : [];
    return rowToPlant(row, eventRows);
  });
}

export async function findById(id) {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM plants WHERE id = '${id}'`);
  if (result.length === 0 || result[0].values.length === 0) return null;

  const columns = result[0].columns;
  const row = result[0].values[0];
  const obj = {};
  columns.forEach((col, i) => obj[col] = row[i]);

  const events = db.exec(`SELECT * FROM watering_events WHERE plant_id = '${id}'`);
  const eventRows = events.length > 0
    ? events[0].values.map(e => {
        const evObj = {};
        events[0].columns.forEach((col, i) => evObj[col] = e[i]);
        return evObj;
      })
    : [];

  return rowToPlant(obj, eventRows);
}

export async function create(plant) {
  const db = await getDb();
  db.run(
    `INSERT INTO plants (id, name, species, location, watering_frequency, last_watered, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [plant.id, plant.name, plant.species, plant.location, plant.wateringFrequency, plant.lastWatered, plant.notes, plant.createdAt]
  );
  await saveDb();
  return plant;
}

export async function update(plant) {
  const db = await getDb();
  db.run(
    `UPDATE plants SET name = ?, species = ?, location = ?, watering_frequency = ?, last_watered = ?, notes = ?
     WHERE id = ?`,
    [plant.name, plant.species, plant.location, plant.wateringFrequency, plant.lastWatered, plant.notes, plant.id]
  );
  await saveDb();
  return plant;
}

export async function addWateringEvent(event) {
  const db = await getDb();
  db.run(
    `INSERT INTO watering_events (id, plant_id, watered_at, amount, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [event.id, event.plantId, event.wateredAt, event.amount, event.notes]
  );
  await saveDb();
  return event;
}

export async function getWateringEvents(plantId) {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM watering_events WHERE plant_id = '${plantId}' ORDER BY watered_at DESC`);
  if (result.length === 0) return [];

  return result[0].values.map(row => {
    const obj = {};
    result[0].columns.forEach((col, i) => obj[col] = row[i]);
    return { wateredAt: obj.watered_at, amount: obj.amount, notes: obj.notes };
  });
}
