import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlant, isDueForWatering, waterPlant } from '../src/plant.js';

test('cria planta com valores padrão', () => {
  const plant = createPlant({ name: 'Manjericão' });
  assert.equal(plant.name, 'Manjericão');
  assert.equal(plant.wateringFrequency, 7);
  assert.equal(plant.lastWatered, null);
});

test('não permite planta sem nome', () => {
  assert.throws(() => createPlant({ name: '' }), /nome da planta/i);
});

test('registra uma rega e atualiza a última rega', () => {
  const plant = createPlant({ name: 'Sálvia' });
  const watered = waterPlant(plant, { notes: 'Regada pela manhã' });
  assert.ok(watered.lastWatered);
  assert.equal(watered.wateringHistory.length, 1);
});

test('identifica planta que precisa de água', () => {
  const plant = {
    ...createPlant({ name: 'Violeta', wateringFrequency: 2 }),
    lastWatered: '2024-01-01T00:00:00.000Z'
  };
  assert.equal(isDueForWatering(plant, new Date('2024-01-04T00:00:00.000Z')), true);
});
