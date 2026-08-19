import { useState } from 'react';
import PlantList from './components/PlantList.jsx';
import PlantForm from './components/PlantForm.jsx';
import PlantDetail from './components/PlantDetail.jsx';

export default function App() {
  const [view, setView] = useState('list');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function handlePlantCreated() {
    setRefreshKey(k => k + 1);
    setView('list');
  }

  function handleSelectPlant(plant) {
    setSelectedPlant(plant);
    setView('detail');
  }

  function handleBack() {
    setSelectedPlant(null);
    setRefreshKey(k => k + 1);
    setView('list');
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌱 Plant Journal</h1>
        <p>Cuide das suas plantas com inteligência</p>
      </header>

      <nav className="app-nav">
        <button
          className={view === 'list' ? 'active' : ''}
          onClick={() => setView('list')}
        >
          Plantas
        </button>
        <button
          className={view === 'form' ? 'active' : ''}
          onClick={() => setView('form')}
        >
          + Nova Planta
        </button>
      </nav>

      <main className="app-main">
        {view === 'list' && (
          <PlantList key={refreshKey} onSelectPlant={handleSelectPlant} />
        )}
        {view === 'form' && (
          <PlantForm onPlantCreated={handlePlantCreated} />
        )}
        {view === 'detail' && selectedPlant && (
          <PlantDetail plant={selectedPlant} onBack={handleBack} />
        )}
      </main>
    </div>
  );
}
