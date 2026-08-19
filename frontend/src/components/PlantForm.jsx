import { useState } from 'react';
import { createPlant } from '../services/api.js';

export default function PlantForm({ onPlantCreated }) {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [location, setLocation] = useState('');
  const [wateringFrequency, setWateringFrequency] = useState(7);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nome é obrigatório.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createPlant({ name, species, location, wateringFrequency: Number(wateringFrequency), notes });
      setName('');
      setSpecies('');
      setLocation('');
      setWateringFrequency(7);
      setNotes('');
      onPlantCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="plant-form" onSubmit={handleSubmit}>
      <h2>Nova Planta</h2>

      {error && <p className="error">{error}</p>}

      <div className="form-group">
        <label>Nome *</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Manjericão"
        />
      </div>

      <div className="form-group">
        <label>Espécie</label>
        <input
          type="text"
          value={species}
          onChange={e => setSpecies(e.target.value)}
          placeholder="Ex: Ocimum basilicum"
        />
      </div>

      <div className="form-group">
        <label>Local</label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Ex: Cozinha"
        />
      </div>

      <div className="form-group">
        <label>Frequência de rega (dias)</label>
        <input
          type="number"
          min="1"
          value={wateringFrequency}
          onChange={e => setWateringFrequency(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Notas</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Observações sobre a planta..."
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Cadastrando...' : 'Cadastrar'}
      </button>
    </form>
  );
}
