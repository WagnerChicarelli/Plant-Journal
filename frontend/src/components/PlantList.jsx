import { useState, useEffect } from 'react';
import { fetchPlants } from '../services/api.js';
import PlantCard from './PlantCard.jsx';

export default function PlantList({ onSelectPlant }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlants();
  }, []);

  async function loadPlants() {
    try {
      const data = await fetchPlants();
      setPlants(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="loading">Carregando plantas...</p>;
  if (error) return <p className="error">Erro: {error}</p>;
  if (plants.length === 0) return <p className="empty">Nenhuma planta cadastrada.</p>;

  return (
    <div className="plant-list">
      {plants.map(plant => (
        <PlantCard
          key={plant.id}
          plant={plant}
          onClick={() => onSelectPlant(plant)}
        />
      ))}
    </div>
  );
}
