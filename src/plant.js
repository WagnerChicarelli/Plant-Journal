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

export function waterPlant(plant, { amount = '', notes = '' } = {}) {
  const wateredAt = new Date().toISOString();
  return {
    ...plant,
    lastWatered: wateredAt,
    wateringHistory: [
      ...plant.wateringHistory,
      { wateredAt, amount: String(amount).trim(), notes: String(notes).trim() }
    ]
  };
}

export function isDueForWatering(plant, today = new Date()) {
  if (!plant.lastWatered) return true;
  const elapsedDays = (today - new Date(plant.lastWatered)) / (1000 * 60 * 60 * 24);
  return Math.floor(elapsedDays) >= plant.wateringFrequency;
}
