const API_BASE = '/plants';
const AUTH_BASE = '/auth';
const NOTIF_BASE = '/notifications';
const VALIDATE_BASE = '/validate-email';

let authToken = localStorage.getItem('token');

export function setToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export function getToken() {
  return authToken;
}

function authHeaders() {
  return authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
}

export async function fetchPlants() {
  const res = await fetch(API_BASE, { headers: authHeaders() });
  if (res.status === 401) throw new Error('Sessão expirada. Faça login novamente.');
  if (!res.ok) throw new Error('Erro ao buscar plantas');
  return res.json();
}

export async function fetchPlantById(id) {
  const res = await fetch(`${API_BASE}/${id}`, { headers: authHeaders() });
  if (res.status === 401) throw new Error('Sessão expirada. Faça login novamente.');
  if (!res.ok) throw new Error('Planta não encontrada');
  return res.json();
}

export async function createPlant(data) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data)
  });
  if (res.status === 401) throw new Error('Sessão expirada. Faça login novamente.');
  if (!res.ok) throw new Error('Erro ao criar planta');
  return res.json();
}

export async function waterPlant(id, data = {}) {
  const res = await fetch(`${API_BASE}/${id}/water`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data)
  });
  if (res.status === 401) throw new Error('Sessão expirada. Faça login novamente.');
  if (!res.ok) throw new Error('Erro ao registrar rega');
  return res.json();
}

export async function fetchWeather(id, latitude, longitude) {
  const params = new URLSearchParams();
  if (latitude) params.append('latitude', latitude);
  if (longitude) params.append('longitude', longitude);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/${id}/weather${query}`, { headers: authHeaders() });
  if (res.status === 401) throw new Error('Sessão expirada. Faça login novamente.');
  if (!res.ok) throw new Error('Erro ao buscar clima');
  return res.json();
}

export async function fetchOverduePlants() {
  const res = await fetch(`${NOTIF_BASE}/overdue`, { headers: authHeaders() });
  if (res.status === 401) throw new Error('Sessão expirada. Faça login novamente.');
  if (!res.ok) throw new Error('Erro ao buscar notificações');
  return res.json();
}

export async function sendReminders() {
  const res = await fetch(`${NOTIF_BASE}/send-reminders`, {
    method: 'POST',
    headers: authHeaders()
  });
  if (res.status === 401) throw new Error('Sessão expirada. Faça login novamente.');
  if (!res.ok) throw new Error('Erro ao enviar lembretes');
  return res.json();
}

export async function registerUser(data) {
  const res = await fetch(`${AUTH_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const text = await res.text();
  const result = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(result.error || 'Erro ao registrar');
  }
  return result;
}

export async function loginUser(data) {
  const res = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const text = await res.text();
  const result = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(result.error || 'Erro ao fazer login');
  }
  return result;
}

export async function validateEmailDomain(email) {
  const res = await fetch(`${VALIDATE_BASE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const text = await res.text();
  const result = text ? JSON.parse(text) : {};
  return result;
}

export async function confirmEmail(token) {
  const res = await fetch(`${AUTH_BASE}/confirm/${token}`);
  const text = await res.text();
  const result = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(result.error || 'Erro ao confirmar email');
  }
  return result;
}

export async function resendConfirmation(email) {
  const res = await fetch(`${AUTH_BASE}/resend-confirmation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const text = await res.text();
  const result = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new Error(result.error || 'Erro ao reenviar confirmação');
  }
  return result;
}
