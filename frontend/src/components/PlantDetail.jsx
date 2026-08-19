import { useState, useEffect } from 'react';
import { fetchWeather, waterPlant } from '../services/api.js';

export default function PlantDetail({ plant, onBack }) {
  const [weather, setWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    loadWeather();
  }, [plant.id]);

  async function loadWeather() {
    setLoadingWeather(true);
    try {
      const data = await fetchWeather(plant.id);
      setWeather(data);
    } catch (err) {
      console.error('Erro ao buscar clima:', err);
    } finally {
      setLoadingWeather(false);
    }
  }

  async function handleWater() {
    try {
      await waterPlant(plant.id);
      window.location.reload();
    } catch (err) {
      alert('Erro ao registrar rega.');
    }
  }

  return (
    <div className="plant-detail">
      <button className="back-btn" onClick={onBack}>← Voltar</button>

      <div className="detail-header">
        <h2>{plant.name}</h2>
        {plant.species && <p className="species">{plant.species}</p>}
      </div>

      <div className="detail-info">
        {plant.location && <p><strong>Local:</strong> {plant.location}</p>}
        <p><strong>Frequência de rega:</strong> a cada {plant.wateringFrequency} dia(s)</p>
        <p><strong>Última rega:</strong> {plant.lastWatered ? new Date(plant.lastWatered).toLocaleString('pt-BR') : 'Nunca'}</p>
        {plant.notes && <p><strong>Notas:</strong> {plant.notes}</p>}
      </div>

      <button className="water-btn large" onClick={handleWater}>
        💧 Registrar Rega
      </button>

      {plant.wateringHistory && plant.wateringHistory.length > 0 && (
        <div className="history">
          <h3>Histórico de Regas</h3>
          <ul>
            {plant.wateringHistory.map((event, i) => (
              <li key={i}>
                {new Date(event.wateredAt).toLocaleString('pt-BR')}
                {event.amount && ` — ${event.amount}`}
                {event.notes && ` (${event.notes})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="weather-section">
        <h3>🌤️ Clima Atual</h3>
        {loadingWeather ? (
          <p>Carregando clima...</p>
        ) : weather ? (
          <div className="weather-info">
            <p><strong>Temperatura:</strong> {weather.weather.temperature}°C</p>
            <p><strong>Umidade:</strong> {weather.weather.humidity}%</p>
            <p><strong>Chance de chuva:</strong> {weather.weather.precipitationProbability}%</p>
            <p className="recommendation">{weather.weather.recommendation}</p>
          </div>
        ) : (
          <p>Não foi possível carregar os dados do clima.</p>
        )}
      </div>
    </div>
  );
}
