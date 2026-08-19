const API_BASE = '/plants';

export async function fetchPlants() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Erro ao buscar plantas');
  return res.json();
}

export async function fetchPlantById(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error('Planta não encontrada');
  return res.json();
}

export async function createPlant(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erro ao criar planta');
  return res.json();
}

export async function waterPlant(id, data = {}) {
  const res = await fetch(`${API_BASE}/${id}/water`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Erro ao registrar rega');
  return res.json();
}

export async function fetchWeather(id, latitude, longitude) {
  const params = new URLSearchParams();
  if (latitude) params.append('latitude', latitude);
  if (longitude) params.append('longitude', longitude);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/${id}/weather${query}`);
  if (!res.ok) throw new Error('Erro ao buscar clima');
  return res.json();
}
