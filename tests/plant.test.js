import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlant, isDueForWatering } from '../src/services/plants.service.js';

test('cria planta com valores padrão', () => {
  const plant = createPlant({ name: 'Manjericão' });
  assert.equal(plant.name, 'Manjericão');
  assert.equal(plant.wateringFrequency, 7);
  assert.equal(plant.lastWatered, null);
  assert.ok(plant.id);
  assert.ok(plant.createdAt);
});

test('cria planta com valores personalizados', () => {
  const plant = createPlant({
    name: 'Rosa',
    species: 'Rosa gallica',
    location: 'Varanda',
    wateringFrequency: 3,
    notes: 'Regar pela manhã'
  });
  assert.equal(plant.name, 'Rosa');
  assert.equal(plant.species, 'Rosa gallica');
  assert.equal(plant.location, 'Varanda');
  assert.equal(plant.wateringFrequency, 3);
  assert.equal(plant.notes, 'Regar pela manhã');
});

test('remove espaços extras do nome', () => {
  const plant = createPlant({ name: '  Manjericão  ' });
  assert.equal(plant.name, 'Manjericão');
});

test('não permite planta sem nome', () => {
  assert.throws(() => createPlant({ name: '' }), /nome da planta/i);
});

test('não permite planta com nome só espaços', () => {
  assert.throws(() => createPlant({ name: '   ' }), /nome da planta/i);
});

test('não permite frequência de rega zero', () => {
  assert.throws(() => createPlant({ name: 'Teste', wateringFrequency: 0 }), /frequência/i);
});

test('não permite frequência de rega negativa', () => {
  assert.throws(() => createPlant({ name: 'Teste', wateringFrequency: -1 }), /frequência/i);
});

test('não permite frequência de rega decimal', () => {
  assert.throws(() => createPlant({ name: 'Teste', wateringFrequency: 2.5 }), /frequência/i);
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

test('planta nunca regada sempre precisa de água', () => {
  const plant = createPlant({ name: 'Nova' });
  assert.equal(isDueForWatering(plant), true);
});
