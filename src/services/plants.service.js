import crypto from 'node:crypto';
import * as repository from '../repositories/plants.repository.js';

export function createPlant({ name, species = '', location = '', wateringFrequency = 7, notes = '' }) {
  if (!name || !name.trim()) {
    throw new Error('O nome da planta é obrigatório.');
  }

  const frequency = Number(wateringFrequency);
  if (!Number.isInteger(frequency) || frequency < 1) {
    throw new Error('A frequência de rega deve ser um número inteiro maior que zero.');
  }

  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    species: species.trim(),
    location: location.trim(),
    wateringFrequency: frequency,
    lastWatered: null,
    notes: notes.trim(),
    createdAt: now,
    wateringHistory: []
  };
}

export async function findAll() {
  return repository.findAll();
}

export async function findById(id) {
  return repository.findById(id);
}

export async function addPlant({ name, species, location, wateringFrequency, notes }) {
  const plant = createPlant({ name, species, location, wateringFrequency, notes });
  return repository.create(plant);
}

export async function waterPlant(id, { amount = '', notes: eventNotes = '' } = {}) {
  const plant = await repository.findById(id);
  if (!plant) throw new Error('Planta não encontrada.');

  const now = new Date().toISOString();
  const updatedPlant = {
    ...plant,
    lastWatered: now
  };

  await repository.update(updatedPlant);
  await repository.addWateringEvent({
    id: crypto.randomUUID(),
    plantId: id,
    wateredAt: now,
    amount: String(amount).trim(),
    notes: String(eventNotes).trim()
  });

  return { ...updatedPlant, wateringHistory: plant.wateringHistory };
}

export function isDueForWatering(plant, today = new Date()) {
  if (!plant.lastWatered) return true;
  const elapsedDays = (today - new Date(plant.lastWatered)) / (1000 * 60 * 60 * 24);
  return Math.floor(elapsedDays) >= plant.wateringFrequency;
}
