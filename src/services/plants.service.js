import crypto from 'node:crypto';
import * as repository from '../repositories/plants.repository.js';
import * as notificationService from './notification.service.js';
import { findByEmail } from '../repositories/users.repository.js';

export function createPlant({ name, species = '', location = '', wateringFrequency = 7, notes = '', userId }) {
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
    userId,
    wateringHistory: []
  };
}

export async function findAllByUserId(userId) {
  return repository.findAllByUserId(userId);
}

export async function findByIdAndUserId(id, userId) {
  return repository.findByIdAndUserId(id, userId);
}

export async function addPlant({ name, species, location, wateringFrequency, notes, userId }) {
  const plant = createPlant({ name, species, location, wateringFrequency, notes, userId });
  return repository.create(plant);
}

export async function waterPlant(id, { amount = '', notes: eventNotes = '' } = {}, userId) {
  const plant = await repository.findByIdAndUserId(id, userId);
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

  const user = await findByEmail(userId);
  if (user) {
    notificationService.sendWateringConfirmation(user.email, plant.name);
  }

  return { ...updatedPlant, wateringHistory: plant.wateringHistory };
}

export function isDueForWatering(plant, today = new Date()) {
  if (!plant.lastWatered) return true;
  const elapsedDays = (today - new Date(plant.lastWatered)) / (1000 * 60 * 60 * 24);
  return Math.floor(elapsedDays) >= plant.wateringFrequency;
}
