import { waterPlant } from '../services/api.js';

function daysUntilWatering(plant) {
  if (!plant.lastWatered) return 'Nunca regada';
  const elapsed = Math.floor((Date.now() - new Date(plant.lastWatered)) / (1000 * 60 * 60 * 24));
  const remaining = plant.wateringFrequency - elapsed;
  if (remaining <= 0) return 'Precisa de água!';
  return `${remaining} dia(s) restante(s)`;
}

function isDue(plant) {
  if (!plant.lastWatered) return true;
  const elapsed = Math.floor((Date.now() - new Date(plant.lastWatered)) / (1000 * 60 * 60 * 24));
  return elapsed >= plant.wateringFrequency;
}

export default function PlantCard({ plant, onClick }) {
  async function handleWater(e) {
    e.stopPropagation();
    try {
      await waterPlant(plant.id);
      window.location.reload();
    } catch (err) {
      alert('Erro ao registrar rega.');
    }
  }

  const due = isDue(plant);

  return (
    <div className={`plant-card ${due ? 'due' : ''}`} onClick={onClick}>
      <div className="plant-card-header">
        <h3>{plant.name}</h3>
        {due && <span className="badge">Regar!</span>}
      </div>

      {plant.species && <p className="species">{plant.species}</p>}
      {plant.location && <p className="location">📍 {plant.location}</p>}

      <p className="watering-info">
        Rega a cada {plant.wateringFrequency} dia(s) — {daysUntilWatering(plant)}
      </p>

      <button className="water-btn" onClick={handleWater}>
        💧 Regar
      </button>
    </div>
  );
}
