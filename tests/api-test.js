const BASE_URL = "http://localhost:3000";

let plantId = null;

async function criarPlanta() {
  const res = await fetch(`${BASE_URL}/plants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Rosa",
      species: "Rosa gallica",
      location: "Varanda",
      wateringFrequency: 3,
      notes: "Regar pela manhã"
    })
  });
  const data = await res.json();
  plantId = data.id;
  console.log("Planta criada:", data);
  return data;
}

async function listarPlantas() {
  const res = await fetch(`${BASE_URL}/plants`);
  const data = await res.json();
  console.log("Plantas:", data);
  return data;
}

async function buscarPorId() {
  const res = await fetch(`${BASE_URL}/plants/${plantId}`);
  const data = await res.json();
  console.log("Planta:", data);
  return data;
}

async function plantasQuePrecisamDeAgua() {
  const res = await fetch(`${BASE_URL}/plants/due-for-watering`);
  const data = await res.json();
  console.log("Precisam de água:", data);
  return data;
}

async function registrarRega() {
  const res = await fetch(`${BASE_URL}/plants/${plantId}/water`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: "200ml",
      notes: "Rega pela manhã"
    })
  });
  const data = await res.json();
  console.log("Rega registrada:", data);
  return data;
}

async function historicoDeRegas() {
  const res = await fetch(`${BASE_URL}/plants/${plantId}/history`);
  const data = await res.json();
  console.log("Histórico:", data);
  return data;
}

async function executarTudo() {
  await criarPlanta();
  await listarPlantas();
  await buscarPorId();
  await plantasQuePrecisamDeAgua();
  await registrarRega();
  await historicoDeRegas();
}

executarTudo();
