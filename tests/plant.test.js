import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlant, isDueForWatering } from '../src/services/plants.service.js';

test('cria planta com valores padrão', () => {
  const plant = createPlant({ name: 'Manjericão' });
  assert.equal(plant.name, 'Manjericão');
  assert.equal(plant.wateringFrequency, 7);
  assert.equal(plant.lastWatered, null);
});

test('não permite planta sem nome', () => {
  assert.throws(() => createPlant({ name: '' }), /nome da planta/i);
});

test('identifica planta que precisa de água', () => {
  const plant = {
    ...createPlant({ name: 'Violeta', wateringFrequency: 2 }),
    lastWatered: '2024-01-01T00:00:00.000Z'
  };
  assert.equal(isDueForWatering(plant, new Date('2024-01-04T00:00:00.000Z')), true);
});

test('não identifica planta que não precisa de água', () => {
  const plant = {
    ...createPlant({ name: 'Violeta', wateringFrequency: 7 }),
    lastWatered: '2024-01-01T00:00:00.000Z'
  };
  assert.equal(isDueForWatering(plant, new Date('2024-01-03T00:00:00.000Z')), false);
});
