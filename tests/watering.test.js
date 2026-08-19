import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlant, isDueForWatering } from '../src/services/plants.service.js';

test('rega marca data da última rega', () => {
  const plant = createPlant({ name: 'Manjericão' });
  const antes = new Date();
  const updated = {
    ...plant,
    lastWatered: new Date().toISOString()
  };
  assert.ok(updated.lastWatered);
  assert.ok(new Date(updated.lastWatered) >= antes);
});

test('rega com amount e notes', () => {
  const event = {
    wateredAt: new Date().toISOString(),
    amount: '200ml',
    notes: 'Rega pela manhã'
  };
  assert.equal(event.amount, '200ml');
  assert.equal(event.notes, 'Rega pela manhã');
});

test('planta regada hoje não precisa de água se frequência é 7 dias', () => {
  const today = new Date();
  const plant = {
    ...createPlant({ name: 'Teste', wateringFrequency: 7 }),
    lastWatered: today.toISOString()
  };
  assert.equal(isDueForWatering(plant, today), false);
});

test('planta regada há 7 dias precisa de água', () => {
  const today = new Date('2024-01-08T12:00:00.000Z');
  const sevenDaysAgo = new Date('2024-01-01T12:00:00.000Z');
  const plant = {
    ...createPlant({ name: 'Teste', wateringFrequency: 7 }),
    lastWatered: sevenDaysAgo.toISOString()
  };
  assert.equal(isDueForWatering(plant, today), true);
});

test('planta regada há 6 dias não precisa de água (frequência 7)', () => {
  const today = new Date('2024-01-07T12:00:00.000Z');
  const sixDaysAgo = new Date('2024-01-01T12:00:00.000Z');
  const plant = {
    ...createPlant({ name: 'Teste', wateringFrequency: 7 }),
    lastWatered: sixDaysAgo.toISOString()
  };
  assert.equal(isDueForWatering(plant, today), false);
});

test('planta com frequência 1 dia regada ontem precisa de água', () => {
  const today = new Date('2024-01-02T12:00:00.000Z');
  const yesterday = new Date('2024-01-01T12:00:00.000Z');
  const plant = {
    ...createPlant({ name: 'Teste', wateringFrequency: 1 }),
    lastWatered: yesterday.toISOString()
  };
  assert.equal(isDueForWatering(plant, today), true);
});

test('planta nunca regada sempre precisa de água', () => {
  const plant = createPlant({ name: 'Nova' });
  assert.equal(isDueForWatering(plant), true);
});

test('historico de regas é um array', () => {
  const plant = createPlant({ name: 'Teste' });
  assert.ok(Array.isArray(plant.wateringHistory));
  assert.equal(plant.wateringHistory.length, 0);
});
