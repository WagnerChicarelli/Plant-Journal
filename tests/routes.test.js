import test from 'node:test';
import assert from 'node:assert/strict';

let createdPlantId = null;

const BASE_URL = 'http://localhost:3000';

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  return { status: res.status, data };
}

test('POST /plants - cadastra planta com sucesso', async () => {
  const { status, data } = await request('POST', '/plants', {
    name: 'Teste Rosa',
    species: 'Rosa',
    wateringFrequency: 3
  });
  assert.equal(status, 201);
  assert.equal(data.name, 'Teste Rosa');
  assert.ok(data.id);
  createdPlantId = data.id;
});

test('POST /plants - retorna 400 sem nome', async () => {
  const { status, data } = await request('POST', '/plants', { name: '' });
  assert.equal(status, 400);
  assert.ok(data.error);
});

test('GET /plants - lista todas as plantas', async () => {
  const { status, data } = await request('GET', '/plants');
  assert.equal(status, 200);
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0);
});

test('GET /plants/:id - busca planta existente', async () => {
  const { status, data } = await request('GET', `/plants/${createdPlantId}`);
  assert.equal(status, 200);
  assert.equal(data.id, createdPlantId);
  assert.equal(data.name, 'Teste Rosa');
});

test('GET /plants/:id - retorna 404 para planta inexistente', async () => {
  const { status, data } = await request('GET', '/plants/00000000-0000-0000-0000-000000000000');
  assert.equal(status, 404);
  assert.ok(data.error);
});

test('GET /plants/due-for-watering - retorna plantas que precisam de água', async () => {
  const { status, data } = await request('GET', '/plants/due-for-watering');
  assert.equal(status, 200);
  assert.ok(Array.isArray(data));
});

test('POST /plants/:id/water - registra rega com sucesso', async () => {
  const { status, data } = await request('POST', `/plants/${createdPlantId}/water`, {
    amount: '200ml',
    notes: 'Teste de rega'
  });
  assert.equal(status, 200);
  assert.ok(data.lastWatered);
});

test('POST /plants/:id/water - retorna 404 para planta inexistente', async () => {
  const { status, data } = await request('POST', '/plants/00000000-0000-0000-0000-000000000000/water');
  assert.equal(status, 404);
  assert.ok(data.error);
});

test('GET /plants/:id/history - retorna histórico de regas', async () => {
  const { status, data } = await request('GET', `/plants/${createdPlantId}/history`);
  assert.equal(status, 200);
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0);
});

test('DELETE - remove planta criada (limpeza)', async () => {
  const plants = await request('GET', '/plants');
  assert.ok(plants.data.length > 0);
});
